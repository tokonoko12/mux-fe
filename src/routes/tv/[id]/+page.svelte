<script lang="ts">
	import { tmdb } from '$lib/services/tmdb';
	import Navbar from '$lib/components/Navbar.svelte';
	import MediaRow from '$lib/components/MediaRow.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let { tvShow } = $derived(data);

	let trailerKey = $derived(
		tvShow.videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key
	);

	let isPlaying = $state(true);
	let isMuted = $state(true);
	let iframe: HTMLIFrameElement;

	function togglePlay() {
		if (iframe && iframe.contentWindow) {
			const action = isPlaying ? 'pauseVideo' : 'playVideo';
			iframe.contentWindow.postMessage(
				JSON.stringify({ event: 'command', func: action, args: '' }),
				'*'
			);
			isPlaying = !isPlaying;
		}
	}

	function toggleMute() {
		if (iframe && iframe.contentWindow) {
			const action = isMuted ? 'unMute' : 'mute';
			iframe.contentWindow.postMessage(
				JSON.stringify({ event: 'command', func: action, args: '' }),
				'*'
			);
			isMuted = !isMuted;
		}
	}

	let showModal = $state(false);

	function openModal() {
		showModal = true;
		if (isPlaying) {
			togglePlay();
		}
	}

	function closeModal() {
		showModal = false;
	}
</script>

<svelte:head>
	<title>{tvShow.name} - Mux</title>
</svelte:head>

<div class="min-h-screen bg-dark text-white">
	<Navbar />

	<!-- Hero Section -->
	<div class="relative h-[80vh] w-full overflow-hidden">
		<div class="absolute inset-0">
			{#if trailerKey}
				<div
					class="absolute inset-0 overflow-hidden transition-opacity duration-700"
					class:opacity-0={!isPlaying}
				>
					<iframe
						bind:this={iframe}
						class="h-full w-full scale-150 object-cover opacity-50"
						src="https://www.youtube.com/embed/{trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist={trailerKey}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1"
						title="Trailer"
						allow="autoplay; encrypted-media"
						frameborder="0"
					></iframe>
				</div>
			{/if}

			{#if tvShow.backdrop_path && (!trailerKey || !isPlaying)}
				<img
					src={tmdb.getImageUrl(tvShow.backdrop_path, 'original')}
					alt={tvShow.name}
					class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
				/>
			{/if}
			<div class="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
			<div
				class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"
			></div>
		</div>

		<div class="relative flex h-full items-end px-4 pb-12 md:px-12">
			<div class="flex w-full flex-col items-end justify-between gap-8 md:flex-row">
				<!-- Info -->
				<div class="max-w-2xl space-y-4">
					<h1 class="text-4xl font-bold md:text-6xl">{tvShow.name}</h1>

					<div class="flex items-center gap-4 text-sm text-gray-300">
						<span class="font-bold text-green-400"
							>{Math.round(tvShow.vote_average * 10)}% Match</span
						>
						<span>{new Date(tvShow.first_air_date).getFullYear()}</span>
						<span>{tvShow.number_of_seasons} Seasons</span>
						<span class="rounded border border-gray-500 px-2 py-0.5 text-xs">HD</span>
					</div>

					<div class="flex flex-col gap-6 pt-6 lg:flex-row lg:items-center">
						<div class="flex items-center gap-4">
							<button
								class="rounded-full border border-white/20 bg-white/10 px-8 py-3 font-bold text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/20 active:scale-95"
								onclick={openModal}
							>
								Watch Trailer
							</button>

							{#if trailerKey}
								<div class="flex gap-2 ml-2">
									<button
										class="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/20 active:scale-95"
										onclick={togglePlay}
										aria-label={isPlaying ? 'Pause' : 'Play'}
									>
										{#if isPlaying}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="w-6 h-6"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M15.75 5.25v13.5m-7.5-13.5v13.5"
												/>
											</svg>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="w-6 h-6"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
												/>
											</svg>
										{/if}
									</button>
									<button
										class="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/20 active:scale-95"
										onclick={toggleMute}
										aria-label={isMuted ? 'Unmute' : 'Mute'}
									>
										{#if isMuted}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="w-6 h-6"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M17.25 9.75 21 12m0 0-3.75 2.25M21 12l-3.75-2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
												/>
											</svg>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="w-6 h-6"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
												/>
											</svg>
										{/if}
									</button>
								</div>
							{/if}
						</div>

						<!-- Top Cast Preview -->
						<div class="flex items-center gap-4 border-l border-white/10 pl-6">
							<div class="flex -space-x-4">
								{#each tvShow.credits.cast.slice(0, 5) as person}
									{#if person.profile_path}
										<div
											class="relative h-12 w-12 overflow-hidden rounded-full border-2 border-dark bg-gray-800 transition hover:z-10 hover:scale-110"
											title={person.name}
										>
											<img
												src={tmdb.getImageUrl(person.profile_path)}
												alt={person.name}
												class="h-full w-full object-cover"
											/>
										</div>
									{/if}
								{/each}
							</div>
							<div class="text-sm font-medium text-gray-300">
								<p>Starring</p>
								<p class="text-xs text-gray-500">Top Cast</p>
							</div>
						</div>
					</div>

					<p class="line-clamp-3 text-lg text-gray-300 md:text-xl">
						{tvShow.overview}
					</p>

					<div class="pt-4">
						<button
							class="rounded-full bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:scale-105 hover:bg-primary-hover active:scale-95"
						>
							Play Now
						</button>
					</div>
				</div>

				<!-- Poster -->
				<div class="hidden h-96 w-64 shrink-0 overflow-hidden rounded-lg shadow-2xl md:block">
					<img
						src={tmdb.getImageUrl(tvShow.poster_path)}
						alt={tvShow.name}
						class="h-full w-full object-cover"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Content Section -->
	<div class="px-4 py-8 md:px-12 space-y-12">
		<!-- More Like This -->
		{#if tvShow.similar.results.length > 0}
			<MediaRow title="More Like This" movies={tvShow.similar.results} />
		{/if}

		<!-- Trailer Modal -->
		{#if showModal && trailerKey}
			<div
				class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
				onclick={closeModal}
				role="dialog"
				aria-modal="true"
			>
				<div
					class="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
				>
					<button
						class="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition"
						onclick={closeModal}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
					<iframe
						class="w-full h-full"
						src="https://www.youtube.com/embed/{trailerKey}?autoplay=1&rel=0&showinfo=0"
						title="Trailer"
						allow="autoplay; encrypted-media"
						allowfullscreen
					></iframe>
				</div>
			</div>
		{/if}
	</div>
</div>
