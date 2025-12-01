import { tmdb } from '$lib/services/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [trending, popular, topRated, onTheAir] = await Promise.all([
        tmdb.getTrendingTV(),
        tmdb.getPopularTV(),
        tmdb.getTopRatedTV(),
        tmdb.getOnTheAirTV()
    ]);

    return {
        trending: trending.results,
        popular: popular.results,
        topRated: topRated.results,
        onTheAir: onTheAir.results
    };
};
