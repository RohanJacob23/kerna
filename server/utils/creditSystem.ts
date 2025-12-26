import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { user } from "~~/server/db/schema";
import { PLANS } from "../../shared/utils/plans";

/**
 * Checks a user's plan status, refills daily/expired credits if necessary,
 * and returns the fresh user object.
 * * MUST be called before any generation request.
 */
export async function checkAndRefillCredits(userId: string) {
	// We use a transaction to ensure the read-update-return cycle is atomic.
	return await db.transaction(async (tx) => {
		let dbUser = await tx.query.user.findFirst({
			where: eq(user.id, userId),
			columns: {
				id: true,
				plan: true,
				credits: true,
				lastDailyCreditRefillAt: true,
				planExpiresAt: true,
			},
		});

		if (!dbUser) throw new Error("User not found");

		const now = new Date();
		let userUpdated = false;

		// --- LOGIC FOR FREE TIER ---
		if (dbUser.plan === "free") {
			const lastRefill = dbUser.lastDailyCreditRefillAt;
			// Check if the last refill was yesterday or earlier (using setHours to ignore time)
			const isNewDay =
				!lastRefill ||
				lastRefill.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0);

			if (isNewDay) {
				console.log(`Refilling daily credits for free user: ${userId}`);
				// Reset credits to 5. Do not accumulate.
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

		// --- LOGIC FOR "CRAM WEEK" EXPIRATION ---
		if (dbUser.plan === "cram_week") {
			if (dbUser.planExpiresAt && dbUser.planExpiresAt < now) {
				console.log(
					`Cram week expired for user: ${userId}. Downgrading to free.`
				);
				// Downgrade to free plan. They keep any remaining credits until the next day.
				await tx
					.update(user)
					.set({
						plan: "free",
						planExpiresAt: null, // Clear expiration
					})
					.where(eq(user.id, userId));
				userUpdated = true;
			}
		}

		// If we made changes, fetch the fresh user object to return.
		// If no changes, the original dbUser is still fresh.
		if (userUpdated) {
			dbUser = await tx.query.user.findFirst({
				where: eq(user.id, userId),
				// We only need plan and credits for the next step
				columns: {
					id: true,
					plan: true,
					credits: true,
					lastDailyCreditRefillAt: true,
					planExpiresAt: true,
				},
			});
			if (!dbUser) throw new Error("User not found after update");
		}

		return dbUser; // Returns the fresh user info
	});
}
