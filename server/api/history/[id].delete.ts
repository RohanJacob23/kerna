import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "~~/db";
import { generations } from "~~/db/schema";

const paramsSchema = z.object({
	id: z.coerce.number(),
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
