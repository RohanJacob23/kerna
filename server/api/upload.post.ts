import z from "zod";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const fileSchema = z
	.file()
	.mime([
		"application/pdf",
		"text/plain",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	]);

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
	const buffer = Buffer.from(arrayBuffer);
	let extractedText = "";

	try {
		if (file.type === "application/pdf") {
			const parser = new PDFParse({ data: buffer });
			extractedText = (await parser.getText()).text;
		} else if (
			file.type ===
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		) {
			const { value } = await mammoth.extractRawText({ buffer });
			extractedText = value;
		} else if (file.type === "text/plain") {
			extractedText = buffer.toString("utf-8");
		}
	} catch (e) {
		console.error("File Parsing Error:", e);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to read file content.",
		});
	}

	if (!extractedText.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: "The file appears to be empty.",
		});
	}

	const title = file.name;

	const aiResponse = await generateStudyGuide(extractedText, title, event);

	return { aiResponse };
});
