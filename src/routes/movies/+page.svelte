<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import MediaRow from '$lib/components/MediaRow.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let heroMovie = $derived(data.action[0]);
</script>

<svelte:head>
	<title>Movies - Mux</title>
</svelte:head>

<div class="min-h-screen bg-dark text-white pb-20">
	<Navbar />

	{#if heroMovie}
		<Hero movie={heroMovie} />
	{/if}

	<div class="-mt-32 relative z-10 space-y-4">
		<MediaRow title="Action Thrillers" movies={data.action} />
		<MediaRow title="Comedy Hits" movies={data.comedy} />
		<MediaRow title="Dramatic Journeys" movies={data.drama} />
		<MediaRow title="Horror Night" movies={data.horror} />
	</div>
</div>
