import { api } from './api';
import type { Pokemon, PokemonListResponse, PokemonSuggestion } from '@/types/pokemon';

export const pokemonService = {
    // Lista pokémons com paginação
    async listPokemon(page: number = 1, limit: number = 20): Promise<PokemonListResponse> {
        const response = await api.get(`/pokemon/list?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Obtém um pokémon por ID ou nome
    async getPokemonById(id: string | number): Promise<Pokemon> {
        const response = await api.get(`/pokemon/${id}`);
        return response.data;
    },

    // Sugestão de pokémon baseado no clima
    async suggestPokemon(): Promise<PokemonSuggestion> {
        const response = await api.get('/pokemon/suggest');
        return response.data;
    },
};
