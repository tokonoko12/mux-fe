export interface Stream {
    quality: string;
    title: string;
    url: string;
}

export interface StreamResponse {
    streams: Record<string, Stream[]>;
}

export interface PlayableStreamResponse {
    audio_lang: Record<string, string>;
    duration: number;
    size: number;
    streams: Record<string, string>;
}

const BASE_URL = 'https://stream.mitserve.fun';

export const streamService = {
    getMovieStreams: async (imdbId: string): Promise<StreamResponse> => {
        const response = await fetch(`${BASE_URL}/movies/${imdbId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch movie streams');
        }
        return response.json();
    },

    getSeriesStreams: async (imdbId: string, season: number, episode: number): Promise<StreamResponse> => {
        const response = await fetch(`${BASE_URL}/series/${imdbId}/${season}/${episode}`);
        if (!response.ok) {
            throw new Error('Failed to fetch series streams');
        }
        return response.json();
    },

    getPlayableLink: async (streamUrl: string): Promise<PlayableStreamResponse> => {
        const response = await fetch(`${BASE_URL}/stream?url=${encodeURIComponent(streamUrl)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch playable link');
        }
        return response.json();
    }
};
