import z from "zod";
import * as cheerio from "cheerio";

const bodySchema = z.object({
	promptUrl: z.url(),
});

export default defineEventHandler(async (event) => {
	const result = await readValidatedBody(event, (body) =>
		bodySchema.safeParse(body)
	);

	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid request. "url" is required.',
		});
	}

	const { promptUrl } = result.data;
	let html = "";

	try {
		const response = await fetch(promptUrl, {
			headers: {
				// Pretend to be a browser to avoid some basic blocks
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
		});
		if (!response.ok) {
			throw createError({
				statusCode: response.status,
				statusMessage: response.statusText,
			});
		}
		html = await response.text();
	} catch {
		throw createError({
			statusCode: 400,
			statusMessage:
				"Could not fetch the URL. The site might be blocking access.",
		});
	}
	const htmlParser = cheerio.load(html);

	htmlParser(
		"script, style, nav, footer, iframe, noscript, .ad, .advertisement, .cookie-banner"
	).remove();

	// Extract the main content
	// We try a few common selectors, falling back to body
	let text =
		htmlParser("article").text() ||
		htmlParser("main").text() ||
		htmlParser("body").text();

	// Clean up whitespace (multiple newlines/spaces)
	text = text.replace(/\s\s+/g, " ").trim();

	// Extract title
	const title = htmlParser("title").text().trim() || promptUrl;

	if (!text || text.length < 100) {
		throw createError({
			statusCode: 400,
			statusMessage: "Could not extract enough text from this page.",
		});
	}

	// Use your existing shared logic
	const streamResult = await generateStudyGuide(text, title, event);

	return streamResult.toUIMessageStreamResponse();
});
