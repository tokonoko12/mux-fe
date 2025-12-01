<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import MediaRow from '$lib/components/MediaRow.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let heroMovie = $derived(data.upcoming[0]);
</script>

<svelte:head>
	<title>New & Popular - Mux</title>
</svelte:head>

<div class="min-h-screen bg-dark text-white pb-20">
	<Navbar />

	{#if heroMovie}
		<Hero movie={heroMovie} />
	{/if}

	<div class="-mt-32 relative z-10 space-y-8">
		<MediaRow title="New Releases" movies={data.upcoming} />
		<MediaRow title="Trending Today" movies={data.trendingDay} />
		<MediaRow title="Trending This Week" movies={data.trendingWeek} />
		<MediaRow title="Popular" movies={data.popular} />
	</div>
</div>
