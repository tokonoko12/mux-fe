import { tmdb } from '$lib/services/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [trendingDay, trendingWeek, upcoming, popular] = await Promise.all([
        tmdb.getTrending('day'),
        tmdb.getTrending('week'),
        tmdb.getUpcomingMovies(),
        tmdb.getPopularMovies()
    ]);

    return {
        trendingDay: trendingDay.results,
        trendingWeek: trendingWeek.results,
        upcoming: upcoming.results,
        popular: popular.results
    };
};
