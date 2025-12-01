<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import MediaRow from '$lib/components/MediaRow.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	// Use the first trending show for the hero
	// We need to cast it to 'any' or update Hero to accept TVShow because Hero expects Movie
	// For now, let's assume TVShow and Movie are similar enough for Hero or we update Hero
	// Ideally we should update Hero to accept (Movie | TVShow)
	let heroShow = $derived(data.trending[0]);
</script>

<svelte:head>
	<title>Series - Mux</title>
</svelte:head>

<div class="min-h-screen bg-dark text-white pb-20">
	<Navbar />

	{#if heroShow}
		<Hero movie={heroShow} />
	{/if}

	<div class="-mt-32 relative z-10 space-y-8">
		<MediaRow title="Trending Series" movies={data.trending} />
		<MediaRow title="Popular Series" movies={data.popular} />
		<MediaRow title="Top Rated Series" movies={data.topRated} />
		<MediaRow title="On The Air" movies={data.onTheAir} />
	</div>
</div>
