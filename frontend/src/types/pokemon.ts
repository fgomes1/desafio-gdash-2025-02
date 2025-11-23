export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
    types: string[];
    sprites: {
        front_default: string;
        front_shiny: string;
        official: string;
    };
    stats: {
        name: string;
        value: number;
    }[];
    abilities: string[];
}

export interface PokemonListItem {
    name: string;
    url: string;
}

export interface PokemonListResponse {
    data: PokemonListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PokemonSuggestion {
    suggestion: {
        reason: string;
        type: string;
        weather: {
            temperature: number;
            condition: string;
        };
    };
    pokemon: Pokemon;
}
