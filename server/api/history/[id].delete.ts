import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~~/server/db";
import { generations } from "~~/server/db/schema";

const paramsSchema = z.object({
	id: z.string(),
});

export default defineEventHandler(async (event) => {
	const result = await getValidatedRouterParams(event, (params) =>
		paramsSchema.safeParse(params)
	);

	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid request. "id" is required.',
		});
	}

	const session = await auth.api.getSession({ headers: event.headers });
	if (!session) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const { id } = result.data;

	await db.delete(generations).where(eq(generations.id, id));
});
