<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import MediaRow from '$lib/components/MediaRow.svelte';
	import { tmdb } from '$lib/services/tmdb';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let { movie } = $derived(data);

	let trailerKey = $derived(
		movie.videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key
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

	import { streamService, type Stream } from '$lib/services/stream';

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
	let showSourceModal = $state(false);
	let streams = $state<Record<string, Stream[]> | null>(null);
	let isLoadingStreams = $state(false);
	let selectedStream = $state<string | null>(null);
	let selectedQuality = $state<string>('1080p');

	function openModal() {
		showModal = true;
		if (isPlaying) {
			togglePlay();
		}
	}

	function closeModal() {
		showModal = false;
		selectedStream = null;
		isResolvingStream = false;
		streamError = null;
	}

	let chosenStream = $state<Stream | null>(null);

	async function fetchStreams() {
		if (!movie.external_ids.imdb_id) return;
		isLoadingStreams = true;
		try {
			const data = await streamService.getMovieStreams(movie.external_ids.imdb_id);
			streams = data.streams;

			// Set initial quality and chosen stream
			const qualities = ['4k', '1080p', '720p', '480p', '360p'];
			let bestStream: Stream | undefined;

			for (const q of qualities) {
				if (streams[q] && streams[q].length > 0) {
					selectedQuality = q;
					bestStream = streams[q][0];
					break;
				}
			}

			if (!bestStream && streams) {
				const firstKey = Object.keys(streams)[0];
				if (firstKey && streams[firstKey].length > 0) {
					selectedQuality = firstKey;
					bestStream = streams[firstKey][0];
				}
			}

			if (bestStream) {
				chosenStream = bestStream;
			}
		} catch (e) {
			console.error('Failed to fetch streams', e);
		} finally {
			isLoadingStreams = false;
		}
	}

	let isResolvingStream = $state(false);
	let streamError = $state<string | null>(null);

	async function resolveStream(url: string) {
		isResolvingStream = true;
		streamError = null;
		try {
			const data = await streamService.getPlayableLink(url);
			console.log('Playable Link Data:', data);
			// Prefer Original (MPD) over main
			let streamUrl = data.streams.Original || data.streams.main;

			// Handle {audio} placeholder
			if (streamUrl && streamUrl.includes('{audio}') && data.audio_lang) {
				const audioKey = Object.keys(data.audio_lang)[0];
				if (audioKey) {
					console.log('Replacing {audio} with:', audioKey);
					streamUrl = streamUrl.replace('{audio}', audioKey);
				}
			}

			console.log('Selected Stream URL:', streamUrl);
			selectedStream = streamUrl;
		} catch (e) {
			console.error('Failed to get playable link', e);
			streamError = 'Failed to load stream. Please try another source.';
		} finally {
			isResolvingStream = false;
		}
	}

	function playStream(url: string) {
		selectedStream = null;
		showSourceModal = false;
		openModal();
		resolveStream(url);
	}

	import { onMount } from 'svelte';

	onMount(() => {
		fetchStreams();
	});

	async function handlePlayNow() {
		if (chosenStream) {
			playStream(chosenStream.url);
		} else if (streams) {
			// Fallback if chosenStream isn't set yet but streams are available
			// (This logic is mostly handled in fetchStreams now, but good for safety)
			const qualities = ['4k', '1080p', '720p', '480p', '360p'];
			let bestStream: Stream | undefined;

			for (const q of qualities) {
				if (streams[q] && streams[q].length > 0) {
					bestStream = streams[q][0];
					break;
				}
			}

			if (!bestStream) {
				const firstKey = Object.keys(streams)[0];
				if (firstKey && streams[firstKey].length > 0) {
					bestStream = streams[firstKey][0];
				}
			}

			if (bestStream) {
				playStream(bestStream.url);
			}
		}
	}

	function openSourceModal() {
		showSourceModal = true;
	}

	function closeSourceModal() {
		showSourceModal = false;
	}

	let videoPaused = $state(true);
	let videoCurrentTime = $state(0);
	let videoDuration = $state(0);
	let showControls = $state(true);
	let controlsTimeout: any;

	function handleMouseMove() {
		showControls = true;
		clearTimeout(controlsTimeout);
		controlsTimeout = setTimeout(() => {
			if (!videoPaused) showControls = false;
		}, 3000);
	}

	function toggleVideoPlay() {
		videoPaused = !videoPaused;
		handleMouseMove();
	}

	function handleSeek(e: MouseEvent & { currentTarget: HTMLDivElement }) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = x / rect.width;
		videoCurrentTime = percentage * videoDuration;
	}

	function formatTime(seconds: number) {
		if (isNaN(seconds)) return '0:00';
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);
		if (h > 0) {
			return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
		}
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function setupDash(node: HTMLVideoElement, url: string) {
		console.log('setupDash called with URL:', url);
		if (url.includes('.mpd')) {
			console.log('Detected MPD stream, initializing Dash.js...');
			let player: any;
			import('dashjs')
				.then((module) => {
					console.log('Dash.js module loaded:', module);
					const dash = module.default || module;
					if (dash && dash.MediaPlayer) {
						console.log('Creating Dash.js player...');
						player = dash.MediaPlayer().create();
						player.initialize(node, url, true);
						player.on('error', (e: any) => {
							console.error('Dash.js Error:', e);
						});
					} else {
						console.error('Dash.js MediaPlayer not found in module:', module);
					}
				})
				.catch((e) => console.error('Failed to load dashjs', e));
			return {
				destroy() {
					console.log('Destroying Dash.js player');
					player?.reset();
				}
			};
		} else {
			console.log('Not an MPD stream, using native playback');
			node.src = url;
			return {
				destroy() {
					node.src = '';
				}
			};
		}
	}
</script>

<svelte:head>
	<title>{movie.title} - Mux</title>
</svelte:head>

<div class="min-h-screen bg-dark text-white pb-20">
	<Navbar />

	<!-- Backdrop Hero -->
	<div class="relative h-[70vh] w-full overflow-hidden">
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

			{#if movie.backdrop_path && (!trailerKey || !isPlaying)}
				<img
					src={tmdb.getImageUrl(movie.backdrop_path, 'original')}
					alt={movie.title}
					class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
				/>
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent"></div>
		</div>

		<div class="relative flex h-full items-end px-4 pb-12 md:px-12">
			<div class="flex w-full flex-col items-end justify-between gap-8 md:flex-row">
				<!-- Info -->
				<div class="max-w-3xl space-y-4">
					<h1 class="text-4xl font-bold md:text-6xl">{movie.title}</h1>

					<div class="flex items-center gap-4 text-sm md:text-base">
						<span class="font-bold text-green-400"
							>{Math.round(movie.vote_average * 10)}% Match</span
						>
						<span>{new Date(movie.release_date).getFullYear()}</span>
						<span>{movie.runtime}m</span>
						{#if movie.genres}
							<div class="flex gap-2">
								{#each movie.genres as genre}
									<span class="rounded-full border border-gray-600 px-2 py-0.5 text-xs"
										>{genre.name}</span
									>
								{/each}
							</div>
						{/if}
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
								{#each movie.credits.cast.slice(0, 5) as person}
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

					<p class="text-lg text-gray-300">{movie.overview}</p>

					<div class="pt-4">
						<button
							class="rounded-full bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/30 transition hover:scale-105 hover:bg-primary-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
							onclick={handlePlayNow}
							disabled={isLoadingStreams || !streams || Object.keys(streams).length === 0}
						>
							{isLoadingStreams
								? 'Loading...'
								: !streams || Object.keys(streams).length === 0
									? 'No Streams'
									: 'Play Now'}
						</button>
						<button
							class="rounded-full border border-white/20 bg-white/10 px-8 py-3 font-bold text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
							onclick={openSourceModal}
							disabled={isLoadingStreams || !streams || Object.keys(streams).length === 0}
						>
							{chosenStream ? `Source: ${selectedQuality}` : 'Change Source'}
						</button>
					</div>
				</div>

				<!-- Poster -->
				<div class="hidden h-96 w-64 shrink-0 overflow-hidden rounded-lg shadow-2xl md:block">
					<img
						src={tmdb.getImageUrl(movie.poster_path)}
						alt={movie.title}
						class="h-full w-full object-cover"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Similar Movies -->
	{#if movie.similar && movie.similar.results.length > 0}
		<MediaRow title="More Like This" movies={movie.similar.results} />
	{/if}

	<!-- Video Modal -->
	{#if showModal}
		<div class="fixed inset-0 z-[100] bg-black" role="dialog" aria-modal="true">
			<div
				class="relative w-full h-full bg-black group"
				onmousemove={handleMouseMove}
				role="application"
			>
				<!-- Top Gradient -->
				<div
					class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/90 to-transparent pointer-events-none z-10 transition-opacity duration-300"
					class:opacity-0={!showControls}
				></div>

				<!-- Back Button (Top Left) -->
				<button
					class="absolute top-6 left-8 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 backdrop-blur-md transition-all duration-300 group/btn"
					class:opacity-0={!showControls}
					onclick={closeModal}
					aria-label="Go Back"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="w-6 h-6 group-hover/btn:-translate-x-1 transition-transform duration-300"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
						/>
					</svg>
				</button>

				{#if isResolvingStream}
					<div class="absolute inset-0 flex flex-col items-center justify-center text-white">
						<div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
						<p class="text-lg font-medium">Loading Stream...</p>
					</div>
				{:else if streamError}
					<div
						class="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center"
					>
						<div class="bg-red-500/20 p-6 rounded-full mb-6">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-12 h-12 text-red-500"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
								/>
							</svg>
						</div>
						<h3 class="text-2xl font-bold mb-2">Playback Error</h3>
						<p class="text-gray-300 mb-8 max-w-md">{streamError}</p>
						<button
							class="rounded-full bg-white/10 px-8 py-3 font-bold text-white backdrop-blur-md transition hover:bg-white/20"
							onclick={closeModal}
						>
							Close Player
						</button>
					</div>
				{:else if selectedStream}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video
						class="w-full h-full object-contain"
						autoplay
						bind:paused={videoPaused}
						bind:currentTime={videoCurrentTime}
						bind:duration={videoDuration}
						onended={() => (videoPaused = true)}
						onclick={toggleVideoPlay}
						use:setupDash={selectedStream}
					>
					</video>

					<!-- Centered Play/Pause Button -->
					<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
						{#if videoPaused || showControls}
							<button
								class="p-6 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 hover:scale-110 transition-all duration-300 pointer-events-auto"
								onclick={toggleVideoPlay}
							>
								{#if videoPaused}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-16 h-16 fill-white"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
										/>
									</svg>
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-16 h-16 fill-white"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.75 5.25v13.5m-7.5-13.5v13.5"
										/>
									</svg>
								{/if}
							</button>
						{/if}
					</div>

					<!-- Bottom Controls -->
					<div
						class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent px-8 pb-8 pt-20 transition-opacity duration-300 z-20"
						class:opacity-0={!showControls}
					>
						<div class="flex flex-col gap-2">
							<!-- Timeline -->
							<div
								class="relative h-2 bg-white/20 rounded-full cursor-pointer group/timeline"
								onclick={handleSeek}
								role="slider"
								aria-valuenow={videoCurrentTime}
								aria-valuemin="0"
								aria-valuemax={videoDuration}
								tabindex="0"
							>
								<div
									class="absolute top-0 left-0 h-full bg-primary rounded-full relative"
									style="width: {(videoCurrentTime / videoDuration) * 100}%"
								>
									<div
										class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/timeline:scale-100 transition-transform"
									></div>
								</div>
							</div>

							<div class="flex justify-between text-sm font-medium text-gray-300 mt-1">
								<span>{formatTime(videoCurrentTime)}</span>
								<span>{formatTime(videoDuration)}</span>
							</div>
						</div>
					</div>
				{:else if trailerKey}
					<iframe
						class="w-full h-full"
						src="https://www.youtube.com/embed/{trailerKey}?autoplay=1&rel=0&showinfo=0"
						title="Trailer"
						allow="autoplay; encrypted-media"
						allowfullscreen
					></iframe>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Source Selection Modal -->
	{#if showSourceModal}
		<div
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
			onclick={closeSourceModal}
			role="dialog"
			aria-modal="true"
		>
			<div
				class="relative w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="p-6 border-b border-white/10 flex justify-between items-center">
					<h2 class="text-xl font-bold">Select Source</h2>
					<button onclick={closeSourceModal} class="text-gray-400 hover:text-white">
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
				</div>

				<div class="flex flex-col h-full overflow-hidden">
					{#if isLoadingStreams}
						<div class="flex justify-center py-12">
							<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					{:else if streams}
						<!-- Tabs -->
						<div class="flex overflow-x-auto border-b border-white/10 px-6 scrollbar-hide">
							{#each Object.keys(streams).sort((a, b) => {
								const order = ['4k', '1080p', '720p', '480p', '360p'];
								const indexA = order.indexOf(a);
								const indexB = order.indexOf(b);
								if (indexA !== -1 && indexB !== -1) return indexA - indexB;
								if (indexA !== -1) return -1;
								if (indexB !== -1) return 1;
								return a.localeCompare(b);
							}) as quality}
								{#if streams[quality] && streams[quality].length > 0}
									<button
										class="px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap {selectedQuality ===
										quality
											? 'border-primary text-primary'
											: 'border-transparent text-gray-400 hover:text-white'}"
										onclick={() => (selectedQuality = quality)}
									>
										{quality}
									</button>
								{/if}
							{/each}
						</div>

						<!-- Stream List -->
						<div class="p-6 overflow-y-auto space-y-2 flex-1">
							{#if streams[selectedQuality]}
								{#each streams[selectedQuality] as stream}
									<button
										class="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition group"
										onclick={() => {
											chosenStream = stream;
											closeSourceModal();
										}}
									>
										<div
											class="font-medium text-white group-hover:text-primary transition-colors line-clamp-2"
										>
											{stream.title}
										</div>
									</button>
								{/each}
							{:else}
								<div class="text-center text-gray-400 py-8">
									No streams available for this quality.
								</div>
							{/if}
						</div>
					{:else}
						<div class="text-center text-gray-400 py-8">No streams found.</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
