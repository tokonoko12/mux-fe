<script lang="ts">
	import { page } from '$app/stores';

	let isScrolled = $state(false);

	function handleScroll() {
		isScrolled = window.scrollY > 0;
	}

	const links = [
		{ name: 'Series', href: '/series' },
		{ name: 'Movies', href: '/movies' },
		{ name: 'New & Popular', href: '/new' },
		{ name: 'My List', href: '/list' }
	];
</script>

<svelte:window onscroll={handleScroll} />

<nav
	class="fixed top-0 z-50 w-full transition-all duration-300 {isScrolled
		? 'bg-dark/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
		: 'bg-gradient-to-b from-dark/90 to-transparent'}"
>
	<div class="mx-auto flex items-center justify-between px-6 py-4 md:px-16">
		<div class="flex items-center gap-10">
			<a
				href="/"
				class="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400"
				>MUX</a
			>
			<ul class="hidden gap-8 md:flex">
				{#each links as link}
					<li>
						<a
							href={link.href}
							class="text-sm font-medium transition-colors hover:text-gray-300 {$page.url
								.pathname === link.href
								? 'text-white'
								: 'text-gray-400'}"
						>
							{link.name}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="flex items-center gap-6 text-white">
			<a href="/search" aria-label="Search" class="hover:text-gray-300">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
					/>
				</svg>
			</a>
			<button aria-label="Notifications" class="hover:text-gray-300">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
					/>
				</svg>
			</button>
			<div class="h-8 w-8 overflow-hidden rounded bg-gray-600">
				<img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="User" />
			</div>
		</div>
	</div>
</nav>
