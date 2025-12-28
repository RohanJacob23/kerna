import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { user } from "~~/server/db/schema";
import { PLANS } from "../../shared/utils/plans";

/**
 * Checks a user's plan status, refills daily/monthly credits if necessary,
 * handles plan expiration, and returns the fresh user object.
 * * MUST be called before any generation request to ensure credit balance is accurate.
 */
export async function checkAndRefillCredits(userId: string) {
	// We use a transaction to ensure the read-check-update cycle is atomic.
	return await db.transaction(async (tx) => {
		let dbUser = await tx.query.user.findFirst({
			where: eq(user.id, userId),
			columns: {
				id: true,
				plan: true,
				credits: true,
				lastDailyCreditRefillAt: true,
				creditResetAt: true,
				planExpiresAt: true,
				isDowngraded: true,
			},
		});

		if (!dbUser) throw new Error("User not found");

		const now = new Date();
		let userUpdated = false;

		// --- LOGIC 1: FREE TIER DAILY REFILL ---
		// Only refill if they are NOT downgraded.
		// A downgraded user is one who was paid and is now free but still has > 5 credits.
		if (dbUser.plan === "free" && !dbUser.isDowngraded) {
			const lastRefill = dbUser.lastDailyCreditRefillAt;
			// Check if the last refill was yesterday or earlier (ignoring time)
			const isNewDay =
				!lastRefill ||
				lastRefill.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0);

			if (isNewDay) {
				console.log(`Refilling daily credits for free user: ${userId}`);
				// Reset credits to base amount. Do not accumulate.
				await tx
					.update(user)
					.set({
						credits: PLANS.free.credits,
						lastDailyCreditRefillAt: now,
					})
					.where(eq(user.id, userId));
				userUpdated = true;
			}
		}

		// --- LOGIC 2: MONTHLY & ANNUAL SUBSCRIPTION REFILL ---
		if (dbUser.plan === "monthly" || dbUser.plan === "annual") {
			// Check if it's time for a refill based on the date from the webhook
			if (dbUser.creditResetAt && dbUser.creditResetAt <= now) {
				console.log(
					`Refilling monthly credits for ${dbUser.plan} user: ${userId}`
				);

				const planDetails = PLANS[dbUser.plan];

				// Calculate the *next* reset date by adding one month.
				const nextResetDate = new Date(dbUser.creditResetAt);
				nextResetDate.setMonth(nextResetDate.getMonth() + 1);

				// Refill credits to plan limit and update reset date.
				// We do NOT accumulate unused credits.
				await tx
					.update(user)
					.set({
						credits: planDetails.credits,
						creditResetAt: nextResetDate,
						lastDailyCreditRefillAt: now,
					})
					.where(eq(user.id, userId));
				userUpdated = true;
			}
		}

		// --- LOGIC 3: "CRAM WEEK" EXPIRATION ---
		if (dbUser.plan === "cram_week") {
			if (dbUser.planExpiresAt && dbUser.planExpiresAt < now) {
				console.log(
					`Cram week expired for user: ${userId}. Downgrading to free.`
				);
				// Downgrade to free plan.
				// Mark as downgraded so they keep remaining credits.
				await tx
					.update(user)
					.set({
						plan: "free",
						planExpiresAt: null,
						creditResetAt: null,
						isDowngraded: true, // Treated like a cancelled sub
					})
					.where(eq(user.id, userId));
				userUpdated = true;
			}
		}

		// --- LOGIC 4: RESET DOWNGRADED STATUS ---
		// If a downgraded user has burned through their extra credits and is now
		// below or at the free tier limit, we remove the downgraded flag.
		// This puts them back on the normal daily refill cycle for tomorrow.
		if (dbUser.isDowngraded && dbUser.credits <= PLANS.free.credits) {
			console.log(
				`User ${userId} has used up downgraded credits. Resetting status.`
			);
			await tx
				.update(user)
				.set({ isDowngraded: false })
				.where(eq(user.id, userId));
			userUpdated = true;
		}

		// If any updates happened, fetch and return the fresh user object.
		if (userUpdated) {
			dbUser = await tx.query.user.findFirst({
				where: eq(user.id, userId),
				columns: {
					id: true,
					plan: true,
					credits: true,
					lastDailyCreditRefillAt: true,
					creditResetAt: true,
					planExpiresAt: true,
					isDowngraded: true,
				},
			});
			if (!dbUser) throw new Error("User not found after update");
		}

		return dbUser; // Returns the fresh, accurate user info
	});
}
