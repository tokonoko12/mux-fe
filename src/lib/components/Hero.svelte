<script lang="ts">
	import type { Movie } from '../types/tmdb';
	import { tmdb } from '../services/tmdb';

	let { movie } = $props<{ movie: Movie }>();
</script>

<div class="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
	<div class="absolute inset-0">
		{#if movie.backdrop_path}
			<img
				src={tmdb.getImageUrl(movie.backdrop_path, 'w1280')}
				alt={movie.title || movie.name}
				class="h-full w-full object-cover"
			/>
		{/if}
		<div class="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
	</div>

	<div class="relative flex h-full items-center px-4 md:px-12">
		<div class="max-w-2xl space-y-2 md:space-y-4">
			<h1 class="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
				{movie.title || movie.name}
			</h1>
			<p class="line-clamp-3 text-sm sm:text-base md:text-xl text-gray-300">
				{movie.overview}
			</p>
			<div class="flex gap-4 pt-4 md:pt-6">
				<button
					class="flex items-center gap-2 rounded-full bg-primary px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-bold text-white transition hover:bg-primary-hover hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-5 w-5 md:h-6 md:w-6"
					>
						<path
							fill-rule="evenodd"
							d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
							clip-rule="evenodd"
						/>
					</svg>
					Watch Now
				</button>
				<a
					href={movie.media_type === 'tv' || movie.name ? `/tv/${movie.id}` : `/movie/${movie.id}`}
					class="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-bold text-white transition hover:bg-white/20 hover:scale-105 active:scale-95"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5 md:h-6 md:w-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
						/>
					</svg>
					More Info
				</a>
			</div>
		</div>
	</div>
</div>
