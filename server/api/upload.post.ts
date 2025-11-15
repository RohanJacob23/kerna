import z from "zod";
import { PDFParse } from "pdf-parse";

const fileSchema = z.file().mime("application/pdf");

export default defineEventHandler(async (event) => {
	const body = await readFormData(event);

	const result = fileSchema.safeParse(body.get("file"));

	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid request. "file" is required.',
		});
	}

	const file = result.data;

	const arrayBuffer = await file.arrayBuffer();
	const parser = new PDFParse({ data: arrayBuffer });
	const extractedText = (await parser.getText()).text;

	const title = file.name;

	const aiResponse = await generateStudyGuide(extractedText, title, event);

	return { aiResponse };
});
