export const PLANS = {
	free: {
		name: "Free Tier",
		credits: 5,
		refillFrequency: "daily",
	},
	cram_week: {
		name: "Cram Week",
		dodoProductId: process.env.DODO_CRAM_WEEK_ID,
		credits: 1000,
		durationDays: 7,
	},
	monthly: {
		name: "Semester Monthly",
		dodoProductId: process.env.DODO_MONTHLY_ID,
		credits: 3000,
		refillFrequency: "monthly",
	},
	annual: {
		name: "Annual Pro",
		dodoProductId: process.env.DODO_ANNUAL_ID,
		credits: 5000,
		refillFrequency: "monthly",
	},
} as const;

// Credit Cost per 1k tokens
export const MODEL_COSTS = {
	"gemini-2.5-flash-lite": 1,
	"gpt-4o-mini": 2,
	"gpt-4o": 40,
	"claude-sonnet": 60,
} as const;

// Minimum credits required to start a generation
export const MIN_CREDIT_BUFFER = 10;
