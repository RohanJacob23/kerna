<template>
	<section>
		<UHeader title="KERNA"
			><template #right>
				<ClientOnly>
					<Suspense>
						<AuthButton />

						<template #fallback
							><USkeleton class="h-8 w-24"
						/></template>
					</Suspense>

					<template #fallback>
						<USkeleton class="h-8 w-24" />
					</template>
				</ClientOnly> </template
		></UHeader>
		<UMain>
			<slot />
		</UMain>
	</section>
</template>
