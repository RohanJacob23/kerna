import z from "zod";

const bodySchema = z.object({
	text: z.string(),
});

export default defineEventHandler(async (event) => {
	const result = await readValidatedBody(event, (body) =>
		bodySchema.safeParse(body)
	);

	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid request. "text" is required.',
		});
	}

	const { text } = result.data;

	const aiResponse = await generateStudyGuide(text, event);

	return { aiResponse };
});
