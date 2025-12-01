<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import MediaRow from '$lib/components/MediaRow.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	// Use the first trending movie for the hero
	let heroMovie = $derived(data.trending[0]);
</script>

<svelte:head>
	<title>Home - Mux</title>
</svelte:head>

<div class="min-h-screen bg-dark text-white pb-20">
	<Navbar />

	{#if heroMovie}
		<Hero movie={heroMovie} />
	{/if}

	<div class="-mt-32 relative z-10 space-y-8">
		<MediaRow title="Trending Now" movies={data.trending} />
		<MediaRow title="Popular on Mux" movies={data.popular} />
		<MediaRow title="Top Rated" movies={data.topRated} />
		<MediaRow title="Upcoming Releases" movies={data.upcoming} />
	</div>
</div>
