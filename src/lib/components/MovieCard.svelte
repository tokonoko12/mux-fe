<script lang="ts">
	import type { Movie } from '../types/tmdb';
	import { tmdb } from '../services/tmdb';

	let { movie } = $props<{ movie: Movie }>();
</script>

<a
	href={movie.media_type === 'tv' || movie.name ? `/tv/${movie.id}` : `/movie/${movie.id}`}
	class="group/card relative block aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-xl hover:shadow-primary/20"
>
	{#if movie.poster_path}
		<img
			src={tmdb.getImageUrl(movie.poster_path)}
			alt={movie.title || movie.name}
			class="h-full w-full object-cover"
			loading="lazy"
		/>
	{:else}
		<div class="flex h-full w-full items-center justify-center bg-gray-800 text-gray-400">
			No Image
		</div>
	{/if}

	<div
		class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
	>
		<div
			class="flex h-full flex-col justify-end p-4 translate-y-4 transition-transform duration-300 group-hover/card:translate-y-0"
		>
			<h3 class="font-bold text-white text-sm md:text-base lg:text-lg leading-tight">
				{movie.title || movie.name}
			</h3>
			<div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-300">
				<span>{new Date(movie.release_date || movie.first_air_date || '').getFullYear()}</span>
			</div>
		</div>
	</div>
</a>
