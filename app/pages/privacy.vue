<script setup lang="ts">
useSeoMeta({
	title: "Privacy Policy",
	description: "Privacy Policy for Kerna.",
});
</script>

<template>
	<UContainer class="prose dark:prose-invert">
		<UPage>
			<UPageBody>
				<div class="mb-10 text-center">
					<h1>Privacy Policy</h1>
					<p>Last updated: 21/11/2025</p>
				</div>

				<div>
					<p>
						At Kerna ("we", "us", or "our"), we value your privacy.
						This Privacy Policy explains how we collect, use, and
						protect your information when you use our AI study guide
						generator.
					</p>

					<h3>1. Information We Collect</h3>
					<p>We collect the following types of information:</p>
					<ul>
						<li>
							<strong>Account Information:</strong> When you sign
							up, we collect your email address and name via our
							authentication providers (Google, GitHub, or Email).
						</li>
						<li>
							<strong>User Content:</strong> We process the text
							and files (PDFs, DOCX, etc.) you upload to generate
							study guides. This content is sent to our AI
							providers (Google Gemini) for processing.
						</li>
						<li>
							<strong>Usage Data:</strong> We may collect
							anonymous metrics on how you interact with our
							service to improve performance.
						</li>
					</ul>

					<h3>2. How We Use Your Information</h3>
					<p>We use your information to:</p>
					<ul>
						<li>Provide and maintain the Kerna service.</li>
						<li>
							Process your payments and manage your subscription
							via Dodo Payments.
						</li>
						<li>
							Generate AI study guides, summaries, and quizzes
							based on your input.
						</li>
						<li>
							Communicate with you regarding your account or
							updates to the service.
						</li>
					</ul>

					<h3>3. Third-Party Services</h3>
					<p>
						We share data with trusted third-party vendors solely to
						operate our service:
					</p>
					<ul>
						<li>
							<strong>Google Gemini API:</strong> For generating
							AI content.
						</li>
						<li>
							<strong>Dodo Payments:</strong> For payment
							processing and billing (Merchant of Record).
						</li>
						<li>
							<strong>Vercel:</strong> For hosting and
							infrastructure.
						</li>
						<li><strong>Neon:</strong> For database storage.</li>
					</ul>
					<p>We do not sell your personal data to advertisers.</p>

					<h3>4. Data Security</h3>
					<p>
						We implement reasonable security measures to protect
						your data. However, no method of transmission over the
						Internet is 100% secure. While we strive to use
						commercially acceptable means to protect your personal
						data, we cannot guarantee its absolute security.
					</p>

					<h3>5. Contact Us</h3>
					<p>
						If you have any questions about this Privacy Policy,
						please contact us at:
						<a href="mailto:support@kerna.ai">support@kerna.ai</a>
						(Replace with your email).
					</p>
				</div>
			</UPageBody>
		</UPage>
	</UContainer>
</template>
