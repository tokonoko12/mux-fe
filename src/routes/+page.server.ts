import { tmdb } from '$lib/services/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [trending, popular, topRated, upcoming] = await Promise.all([
        tmdb.getTrending(),
        tmdb.getPopularMovies(),
        tmdb.getTopRatedMovies(),
        tmdb.getUpcomingMovies()
    ]);

    return {
        trending: trending.results,
        popular: popular.results,
        topRated: topRated.results,
        upcoming: upcoming.results
    };
};
