import { GoogleGenAI } from "@google/genai";
import { eq } from "drizzle-orm";
import { createError, type H3Event, type EventHandlerRequest } from "h3";
import { db } from "~~/db";
import { user } from "~~/db/schema";

const DAILY_LIMIT = 20; // Set your limit

/**
 * This is our shared function that calls the AI.
 * Both of our endpoints will use this.
 * @param text The text extracted from either the textarea or the PDF.
 * @returns The AI's generated Markdown response.
 */
export default async function (
	text: string,
	event: H3Event<EventHandlerRequest>
): Promise<string> {
	// 1. Get the secret API key
	const { googleAiKey } = useRuntimeConfig();
	if (!googleAiKey) {
		throw createError({
			statusCode: 500,
			statusMessage: "Server is not configured. Missing API key.",
		});
	}

	const session = await auth.api.getSession({ headers: event.headers });
	if (!session) {
		throw createError({
			statusCode: 401,
			statusMessage: "You must be logged in.",
		});
	}

	const userId = session.user.id;

	const userRecord = await db.query.user.findFirst({
		where: eq(user.id, userId),
		columns: { requestsToday: true, lastRequestAt: true },
	});

	if (!userRecord) {
		throw createError({
			statusCode: 404,
			statusMessage: "User not found.",
		});
	}

	const today = new Date().setHours(0, 0, 0, 0);
	const lastRequestDate = userRecord.lastRequestAt
		? new Date(userRecord.lastRequestAt).setHours(0, 0, 0, 0)
		: null;

	let currentRequests = userRecord.requestsToday;

	// 2. Reset count if it's a new day
	if (lastRequestDate && lastRequestDate !== today) {
		currentRequests = 0;
	}

	// 3. Check the limit
	if (currentRequests !== null && currentRequests >= DAILY_LIMIT) {
		throw createError({
			statusCode: 429, // Too Many Requests
			statusMessage: "You have exceeded your daily usage limit.",
		});
	}

	// 4. Update the user's count in the DB (do this *before* the AI call)
	await db
		.update(user)
		.set({
			requestsToday: currentRequests ? currentRequests + 1 : 1,
			lastRequestAt: new Date(),
		})
		.where(eq(user.id, userId));

	// 2. Initialize the Google AI client
	const genAI = new GoogleGenAI({ apiKey: googleAiKey });

	// 3. This is your "Master Prompt"
	const masterPrompt = `
    You are an expert academic tutor. A student has provided the following text.
    Your task is to generate a comprehensive study guide based on this text.
    The output MUST be in simple, clean Markdown format.

    Here is the text:
    ---
    ${text}
    ---

    Please generate the following three sections:
    
    ## 1. 📝 Quick Summary
    A concise, 3-to-5-bullet-point summary of the text's main ideas.

    ## 2. 🔑 Key Terms
    A list of the 5-7 most important terms, keywords, or concepts from the text,
    with a brief one-sentence definition for each. Format this as a bulleted list
    with the term in bold.
    Example:
    * **Photosynthesis:** The process by which plants use sunlight to create food.

    ## 3. 🧠 Practice Quiz
    A 3-question multiple-choice quiz based on the text. Provide 4 options (A, B, C, D)
    for each question. After the last question, provide the answer key.
  `;

	try {
		// 4. Call the AI API
		const response = await genAI.models.generateContent({
			model: "gemini-2.5-flash-lite",
			contents: masterPrompt,
		});

		if (!response.text) {
			throw createError({
				statusCode: 500,
				statusMessage: "Error generating response from AI.",
			});
		}

		return response.text;
	} catch (e) {
		console.error("AI API Error:", e);
		throw createError({
			statusCode: 500,
			statusMessage: "Error generating response from AI.",
		});
	}
}
