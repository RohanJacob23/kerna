import { streamText, type StreamTextResult, type ToolSet } from "ai";
import { eq } from "drizzle-orm";
import { createError, type H3Event, type EventHandlerRequest } from "h3";
import { db } from "~~/server/db";
import { generations, type ModelType, user } from "~~/server/db/schema";
import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const ABSOLUTE_MAX_TOKENS = 4000;

// Initialize OpenRouter client for Pro users
const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

export default async function (
	text: string,
	title: string,
	event: H3Event<EventHandlerRequest>,
	modelChoice: ModelType = "gemini-2.5-flash-lite" // Default for pro if not sent
): Promise<StreamTextResult<ToolSet, never>> {
	// 1. Auth & Config Check
	const { googleAiKey, openrouterApiKey } = useRuntimeConfig();
	if (!googleAiKey || !openrouterApiKey) {
		throw createError({
			statusCode: 500,
			statusMessage: "Server config error.",
		});
	}
	const session = await auth.api.getSession({ headers: event.headers });
	if (!session) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}
	const userId = session.user.id;

	// --- CRITICAL: Run daily credit refill logic before proceeding ---
	const dbUser = await checkAndRefillCredits(userId);

	if (!dbUser)
		throw createError({
			statusCode: 404,
			statusMessage: "User not found.",
		});

	const isPaidPlan = dbUser.plan !== "free";
	let model;
	let costMultiplier: number;
	let modelNameForDb: ModelType;

	// --- LOGIC BRANCH: FREE vs. PAID PLAN ---
	if (isPaidPlan) {
		// PAID PLAN: Use OpenRouter based on their choice

		switch (modelChoice) {
			case "claude-sonnet":
				model = openrouter("anthropic/claude-3.5-sonnet");
				costMultiplier = MODEL_COSTS["claude-sonnet"];
				modelNameForDb = "claude-sonnet";
				break;
			case "gpt-4o":
				model = openrouter("openai/gpt-4o");
				costMultiplier = MODEL_COSTS["gpt-4o"];
				modelNameForDb = "gpt-4o";
				break;
			case "gpt-4o-mini":
				model = openrouter("openai/gpt-4o-mini");
				costMultiplier = MODEL_COSTS["gpt-4o-mini"];
				modelNameForDb = "gpt-4o-mini";
				break;
			case "gemini-2.5-flash-lite":
			default:
				model = google("gemini-2.5-flash-lite"); // Using the 8B model as per your plan
				costMultiplier = MODEL_COSTS["gemini-2.5-flash-lite"];
				modelNameForDb = "gemini-2.5-flash-lite";
				break;
		}
	} else {
		// FREE TIER: Force Google Direct to save costs.
		// Model choice is ignored.
		model = google("gemini-2.5-flash-lite"); // Using the 8B model as per your plan
		costMultiplier = MODEL_COSTS["gemini-2.5-flash-lite"]; // Cost is 1 credit per 1k tokens
		modelNameForDb = "gemini-2.5-flash-lite";
	}

	// A. Ensure they have at least 1 credit to start.
	if (dbUser.credits < 1) {
		throw createError({
			statusCode: 402,
			statusMessage: "You have run out of credits. Please refill.",
		});
	}

	// B. Calculate how many tokens they can afford.
	// Example: Balance 5 credits. Multiplier 2 (GPT-4o mini).
	// (5 / 2) * 1000 = 2500 tokens max.
	const maxAffordableTokens = Math.floor(
		(dbUser.credits / costMultiplier) * 1000
	);

	// C. Determine the hard cap for this streaming process.
	// Use the lower of what they can afford OR the absolute system max.
	// We subtract a small buffer (e.g., 50 tokens) for safety margin.
	const hardCapTokens = Math.max(
		1,
		Math.min(maxAffordableTokens, ABSOLUTE_MAX_TOKENS) - 50
	);

	console.log(
		`Starting stream. Balance: ${dbUser.credits}. Multiplier: ${costMultiplier}. Hard Cap set to: ${hardCapTokens} tokens.`
	);

	// 3. Call AI via Vercel SDK
	// (Using the improved masterPrompt function you already have)
	return streamText({
		model,
		prompt: masterPrompt(text), // Make sure masterPrompt is imported/available
		temperature: 0.3,
		maxOutputTokens: hardCapTokens,
		async onFinish({ text: aiResponse, usage, finishReason }) {
			if (!usage || typeof usage.totalTokens !== "number") return;

			const totalTokens = usage.totalTokens;
			// Calculate exact cost based on actual usage
			const costInCredits = Math.max(
				1 * costMultiplier,
				Math.ceil((totalTokens / 1000) * costMultiplier)
			);

			console.log(
				`Stream finished. Reason: ${finishReason}. Tokens: ${totalTokens}. Final Cost: ${costInCredits}.`
			);

			try {
				await db.transaction(async (tx) => {
					// We still re-check balance for race conditions (e.g., two tabs open)
					const freshUser = await tx.query.user.findFirst({
						where: eq(user.id, userId),
						columns: { credits: true },
					});

					if (!freshUser) throw new Error("User not found");

					// Because we hard-capped the tokens, this check should theoretically never fail
					// unless they spent credits in another tab simultaneously.
					if (freshUser.credits < costInCredits) {
						// Deduct whatever is left to bring them to zero.
						const deduction = freshUser ? freshUser.credits : 0;
						if (deduction > 0) {
							await tx
								.update(user)
								.set({
									credits: freshUser.credits - deduction,
								})
								.where(eq(user.id, userId));
						}
						console.error(
							`CRITICAL: User ${userId} hit zero balance mid-stream. Deducted remaining ${deduction}.`
						);
						return;
					}

					// Deduct credits atomically
					await tx
						.update(user)
						.set({
							credits: freshUser.credits - costInCredits,
						})
						.where(eq(user.id, userId));

					// Save history
					await tx.insert(generations).values({
						userId,
						title,
						// If finishReason is 'length', it means they ran out of credits.
						// You might want to append a note to the response.
						aiResponse:
							finishReason === "length"
								? aiResponse +
								  "\n\n*[Generation paused due to credit limit]*"
								: aiResponse,
						modelUsed: modelNameForDb,
						creditsCost: costInCredits,
					});
				});
			} catch (error) {
				console.error("Transaction failed in onFinish:", error);
			}
		},
	});
}
