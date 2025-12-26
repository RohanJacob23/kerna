import { z } from "zod";

const bodySchema = z.object({
	prompt: z.string(),
	modelChoice: z.enum([
		"gemini-2.5-flash-lite",
		"gpt-4o-mini",
		"gpt-4o",
		"claude-sonnet",
	]),
});

export default defineEventHandler(async (event) => {
	const result = await readValidatedBody(event, (body) =>
		bodySchema.safeParse(body)
	);

	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid request. "prompt" is required.',
		});
	}

	const { prompt } = result.data;

	const title = prompt.substring(0, 40) + "...";
	const streamResult = await generateStudyGuide(prompt, title, event);

	return streamResult.toUIMessageStreamResponse();
});
