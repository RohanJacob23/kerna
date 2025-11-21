import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST, // e.g., 'smtp-relay.brevo.com'
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER, // Your Brevo/Gmail email
		pass: process.env.SMTP_PASS, // Your API Key or App Password
	},
});
