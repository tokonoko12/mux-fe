import { tmdb } from '$lib/services/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;
    const movie = await tmdb.getMovieDetails(parseInt(id));

    return {
        movie
    };
};
