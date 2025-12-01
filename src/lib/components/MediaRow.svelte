<script lang="ts">
	import type { Movie } from '../types/tmdb';
	import MovieCard from './MovieCard.svelte';

	let { title, movies } = $props<{ title: string; movies: Movie[] }>();
</script>

<div class="space-y-2 px-4 py-2 md:px-12">
	<h2
		class="text-xl font-bold text-white md:text-2xl hover:text-primary transition-colors cursor-pointer"
	>
		{title}
	</h2>
	<div class="relative">
		<div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
			{#each movies as movie (movie.id)}
				<div class="min-w-[120px] sm:min-w-[160px] md:min-w-[200px] lg:min-w-[240px]">
					<MovieCard {movie} />
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
