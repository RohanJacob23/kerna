import z from "zod";
import { db } from "~~/db";
import { feedback } from "~~/db/schema";

const bodySchema = z.object({
	message: z.string().min(1, "Message is required"),
	type: z.enum(["bug", "feature", "other"]).default("other"),
});

export default defineEventHandler(async (event) => {
	const result = await readValidatedBody(event, (body) =>
		bodySchema.safeParse(body)
	);

	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid request. "message" is required.',
		});
	}

	const session = await auth.api.getSession({ headers: event.headers });
	if (!session) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const { data } = result;

	await db.insert(feedback).values({
		...data,
		userId: session.user.id,
		email: session.user.email,
	});

	try {
		await transporter.sendMail({
			from: "Kerna<rohankoshyjacob@gmail.com>", // Use your authenticated domain
			to: "rohankoshyjacob@gmail.com", // Your personal email
			subject: `[Kerna Feedback] New ${data.type} report`,
			html: `
        <h3>New Feedback Received</h3>
        <p><strong>User:</strong> ${session.user.name} (${session.user.email})</p>
        <p><strong>Type:</strong> ${data.type}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
          ${data.message}
        </blockquote>
      `,
		});
	} catch (e) {
		console.error("Failed to send feedback email:", e);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to send feedback email",
		});
	}
});
