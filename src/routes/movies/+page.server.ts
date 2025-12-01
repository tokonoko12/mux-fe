import { tmdb } from '$lib/services/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [action, comedy, drama, horror] = await Promise.all([
        tmdb.getActionMovies(),
        tmdb.getComedyMovies(),
        tmdb.getDramaMovies(),
        tmdb.getHorrorMovies()
    ]);

    return {
        action: action.results,
        comedy: comedy.results,
        drama: drama.results,
        horror: horror.results
    };
};
