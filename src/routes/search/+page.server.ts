import { tmdb } from '$lib/services/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const query = url.searchParams.get('q');

    if (!query) {
        return {
            results: [],
            query: ''
        };
    }

    const response = await tmdb.searchMulti(query);

    return {
        results: response.results,
        query
    };
};
