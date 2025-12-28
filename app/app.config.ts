export default defineAppConfig({
	ui: {
		icons: {
			loading: "hugeicons:loading-03",
			file: "hugeicons:file-02",
			close: "hugeicons:cancel-01",
		},
		button: {
			slots: {
				base: ["not-disabled:active:scale-95 transition-transform"],
			},
			compoundVariants: [
				{
					color: "primary",
					variant: "solid",
					class: "text-default dark:text-inverted",
				},
			],
		},
	},
});
