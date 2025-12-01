<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { goto } from '$app/navigation';
	import { tmdb } from '$lib/services/tmdb';
	import type { PageData } from './$types';
	import type { Movie, TVShow, Person } from '$lib/types/tmdb';

	let { data } = $props<{ data: PageData }>();
	let query = $state(data.query);
	let activeTab = $state<'content' | 'cast'>('content');
	let timeout: NodeJS.Timeout;

	let contentResults = $derived(
		data.results.filter((item) => item.media_type === 'movie' || item.media_type === 'tv') as (
			| Movie
			| TVShow
		)[]
	);
	let personResults = $derived(
		data.results.filter((item) => item.media_type === 'person') as Person[]
	);

	function handleInput(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		query = value;

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			goto(`/search?q=${encodeURIComponent(value)}`, { keepFocus: true });
		}, 500);
	}
</script>

<svelte:head>
	<title>Search - Mux</title>
</svelte:head>

<div class="min-h-screen bg-dark text-white pb-20">
	<Navbar />

	<div class="pt-32 px-4 md:px-12">
		<!-- Search Input -->
		<div class="max-w-4xl mx-auto mb-8">
			<div class="relative">
				<div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
					<svg
						aria-hidden="true"
						class="w-5 h-5 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
				</div>
				<input
					type="search"
					class="block w-full p-4 pl-12 text-base text-white border border-white/10 rounded-lg bg-white/5 focus:ring-primary focus:border-primary placeholder-gray-500"
					placeholder="Search movies, TV shows, people..."
					value={query}
					oninput={handleInput}
				/>
			</div>
		</div>

		{#if data.query}
			<!-- Tabs -->
			<div class="max-w-7xl mx-auto mb-8 border-b border-white/10">
				<div class="flex gap-8">
					<button
						class="pb-4 text-sm font-medium transition-colors relative {activeTab === 'content'
							? 'text-white'
							: 'text-gray-400 hover:text-white'}"
						onclick={() => (activeTab = 'content')}
					>
						Content
						{#if activeTab === 'content'}
							<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
						{/if}
					</button>
					<button
						class="pb-4 text-sm font-medium transition-colors relative {activeTab === 'cast'
							? 'text-white'
							: 'text-gray-400 hover:text-white'}"
						onclick={() => (activeTab = 'cast')}
					>
						Cast & Crew
						{#if activeTab === 'cast'}
							<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
						{/if}
					</button>
				</div>
			</div>

			<!-- Results -->
			<div class="max-w-7xl mx-auto">
				{#if activeTab === 'content'}
					{#if contentResults.length > 0}
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{#each contentResults as item}
								<a
									href={item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}
									class="flex bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition group"
								>
									<div class="w-24 shrink-0 aspect-[2/3] bg-gray-800">
										{#if item.poster_path}
											<img
												src={tmdb.getImageUrl(item.poster_path)}
												alt={'title' in item ? item.title : item.name}
												class="w-full h-full object-cover"
											/>
										{:else}
											<div
												class="w-full h-full flex items-center justify-center text-xs text-gray-500"
											>
												No Image
											</div>
										{/if}
									</div>
									<div class="p-4 flex flex-col justify-center min-w-0">
										<h3
											class="font-bold text-white truncate group-hover:text-primary transition-colors"
										>
											{'title' in item ? item.title : item.name}
										</h3>
										<p class="text-sm text-gray-400 mt-1">
											{#if 'release_date' in item && item.release_date}
												{new Date(item.release_date).getFullYear()}
											{:else if 'first_air_date' in item && item.first_air_date}
												{new Date(item.first_air_date).getFullYear()}
											{/if}
											<span class="mx-1">•</span>
											<span class="capitalize"
												>{item.media_type === 'tv' ? 'TV Show' : 'Movie'}</span
											>
										</p>
									</div>
								</a>
							{/each}
						</div>
					{:else}
						<div class="text-center text-gray-400 py-20">
							<p>No movies or TV shows found.</p>
						</div>
					{/if}
				{:else if personResults.length > 0}
					<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
						{#each personResults as person}
							<div
								class="bg-white/5 rounded-lg p-4 flex flex-col items-center text-center hover:bg-white/10 transition"
							>
								<div class="w-24 h-24 rounded-full overflow-hidden bg-gray-800 mb-3">
									{#if person.profile_path}
										<img
											src={tmdb.getImageUrl(person.profile_path)}
											alt={person.name}
											class="w-full h-full object-cover"
										/>
									{:else}
										<div
											class="w-full h-full flex items-center justify-center text-xs text-gray-500"
										>
											No Image
										</div>
									{/if}
								</div>
								<h3 class="font-bold text-white text-sm">{person.name}</h3>
								<p class="text-xs text-gray-400 mt-1">{person.known_for_department}</p>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center text-gray-400 py-20">
						<p>No people found.</p>
					</div>
				{/if}
			</div>
		{:else}
			<div class="text-center text-gray-400 mt-20">
				<p class="text-xl">Type something to search...</p>
			</div>
		{/if}
	</div>
</div>
