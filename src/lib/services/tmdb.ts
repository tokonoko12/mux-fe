import type { Movie, MovieDetails, PaginatedResponse, TVShow, TVShowDetails, Person } from '../types/tmdb';

const API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.statusText}`);
    }

    return response.json();
}

export const tmdb = {
    getTrending: async (timeWindow: 'day' | 'week' = 'day') => {
        return fetchTMDB<PaginatedResponse<Movie>>(`/trending/movie/${timeWindow}`);
    },

    getPopularMovies: async () => {
        return fetchTMDB<PaginatedResponse<Movie>>('/movie/popular');
    },

    getTopRatedMovies: async () => {
        return fetchTMDB<PaginatedResponse<Movie>>('/movie/top_rated');
    },

    getUpcomingMovies: async () => {
        return fetchTMDB<PaginatedResponse<Movie>>('/movie/upcoming');
    },

    getTrendingTV: async (timeWindow: 'day' | 'week' = 'day') => {
        return fetchTMDB<PaginatedResponse<TVShow>>(`/trending/tv/${timeWindow}`);
    },

    getPopularTV: async () => {
        return fetchTMDB<PaginatedResponse<TVShow>>('/tv/popular');
    },

    getTopRatedTV: async () => {
        return fetchTMDB<PaginatedResponse<TVShow>>('/tv/top_rated');
    },

    getOnTheAirTV: async () => {
        return fetchTMDB<PaginatedResponse<TVShow>>('/tv/on_the_air');
    },

    getActionMovies: async () => {
        return fetchTMDB<PaginatedResponse<Movie>>('/discover/movie', { with_genres: '28' });
    },

    getComedyMovies: async () => {
        return fetchTMDB<PaginatedResponse<Movie>>('/discover/movie', { with_genres: '35' });
    },

    getDramaMovies: async () => {
        return fetchTMDB<PaginatedResponse<Movie>>('/discover/movie', { with_genres: '18' });
    },

    getHorrorMovies: async () => {
        return fetchTMDB<PaginatedResponse<Movie>>('/discover/movie', { with_genres: '27' });
    },

    getMovieDetails: async (id: number) => {
        return fetchTMDB<MovieDetails>(`/movie/${id}`, {
            append_to_response: 'credits,videos,similar,external_ids'
        });
    },

    getTVShowDetails: async (id: number) => {
        return fetchTMDB<TVShowDetails>(`/tv/${id}`, {
            append_to_response: 'credits,videos,similar,external_ids'
        });
    },

    searchMovies: async (query: string) => {
        return fetchTMDB<PaginatedResponse<Movie>>('/search/movie', { query });
    },

    searchMulti: async (query: string) => {
        return fetchTMDB<PaginatedResponse<Movie | TVShow | Person>>('/search/multi', { query });
    },

    getImageUrl: (path: string | null, size: 'w500' | 'original' | 'w1280' = 'w500') => {
        if (!path) return '';
        // You might want a placeholder here
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }
};
