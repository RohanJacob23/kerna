import { eq, desc } from "drizzle-orm";
import { db } from "~~/db";
import { generations } from "~~/db/schema";

export default defineEventHandler(async (event) => {
	// 1. Get the user session
	const session = await auth.api.getSession({ headers: event.headers });
	if (!session) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	// 2. Fetch all generations for this user
	try {
		const userHistory = await db.query.generations.findMany({
			where: eq(generations.userId, session.user.id),
			orderBy: [desc(generations.createdAt)], // Show newest first
			// Select only the columns we need
			columns: {
				id: true,
				title: true,
				aiResponse: true,
				createdAt: true,
			},
		});

		return userHistory;
	} catch (e) {
		console.error("Failed to fetch history:", e);
		throw createError({
			statusCode: 500,
			statusMessage: "Could not fetch generation history.",
		});
	}
});
