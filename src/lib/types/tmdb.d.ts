export interface Movie {
    id: number;
    title?: string; // TV shows use 'name'
    name?: string;  // Movies use 'title'
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string; // TV shows use 'first_air_date'
    first_air_date?: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    popularity: number;
    media_type?: 'movie' | 'tv';
}

export interface TVShow {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    popularity: number;
    media_type?: 'tv';
}

export interface Person {
    id: number;
    name: string;
    profile_path: string | null;
    character?: string;
    known_for_department?: string;
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}

export interface MovieDetails extends Movie {
    genres: { id: number; name: string }[];
    runtime: number;
    tagline: string;
    credits: {
        cast: Person[];
        crew: Person[];
    };
    videos: {
        results: Video[];
    };
    similar: {
        results: Movie[];
    };
    external_ids: {
        imdb_id: string | null;
    };
}

export interface TVShowDetails extends TVShow {
    genres: { id: number; name: string }[];
    episode_run_time: number[];
    tagline: string;
    number_of_seasons: number;
    number_of_episodes: number;
    credits: {
        cast: Person[];
        crew: Person[];
    };
    videos: {
        results: Video[];
    };
    similar: {
        results: TVShow[];
    };
    external_ids: {
        imdb_id: string | null;
    };
}

export interface PaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}
