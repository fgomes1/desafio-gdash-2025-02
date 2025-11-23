import { useState, useEffect } from 'react';
import { pokemonService } from '@/services/pokemonService';

const typeColors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
};

export function Pokemon() {
    const [pokemons, setPokemons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 20;

    useEffect(() => {
        loadPokemonList(currentPage);
    }, [currentPage]);

    const loadPokemonList = (page: number) => {
        setLoading(true);
        pokemonService.listPokemon(page, itemsPerPage)
            .then(response => {
                setPokemons(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotal(response.pagination.total);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleSelectPokemon = async (name: string) => {
        try {
            setLoadingDetails(true);
            const pokemon = await pokemonService.getPokemonById(name);
            setSelectedPokemon(pokemon);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const getPokemonId = (url: string) => {
        const matches = url.match(/\/(\d+)\//);
        return matches ? matches[1] : '1';
    };

    const getPokemonImage = (url: string) => {
        const id = getPokemonId(url);
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gdash-primary mx-auto mb-4"></div>
                    <p className="text-slate-400">Carregando pokémons...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    🎮 <span className="text-gdash-primary">Pokédex</span>
                </h1>
                <p className="text-slate-400">Explore e descubra pokémons incríveis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {pokemons.map((pokemon) => {
                    const pokemonId = getPokemonId(pokemon.url);
                    const imageUrl = getPokemonImage(pokemon.url);

                    return (
                        <div
                            key={pokemon.name}
                            onClick={() => handleSelectPokemon(pokemon.name)}
                            className="bg-gdash-card border border-slate-700 rounded-xl p-6 cursor-pointer 
                         transition-all duration-300 hover:scale-105 hover:border-gdash-primary 
                         hover:shadow-xl hover:shadow-gdash-primary/20 group"
                        >
                            <div className="relative">
                                <div className="absolute top-0 right-0 bg-slate-800 rounded-full px-3 py-1 text-xs font-bold text-slate-400">
                                    #{pokemonId.padStart(3, '0')}
                                </div>

                                <div className="flex justify-center mb-4 h-32">
                                    <img
                                        src={imageUrl}
                                        alt={pokemon.name}
                                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
                                        }}
                                    />
                                </div>

                                <h3 className="text-xl font-bold text-white capitalize text-center group-hover:text-gdash-primary transition-colors">
                                    {pokemon.name}
                                </h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controles de Paginação */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gdash-card border border-slate-700 rounded-xl p-6">
                <div className="text-slate-400">
                    Mostrando <span className="text-white font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                    <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, total)}</span> de{' '}
                    <span className="text-gdash-primary font-bold">{total}</span> pokémons
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-800 text-white hover:bg-slate-700 hover:border-gdash-primary border border-slate-700'
                            }`}
                    >
                        ««
                    </button>

                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-800 text-white hover:bg-slate-700 hover:border-gdash-primary border border-slate-700'
                            }`}
                    >
                        ‹ Anterior
                    </button>

                    <div className="px-4 py-2 bg-gdash-primary text-gdash-dark font-bold rounded-lg">
                        {currentPage} / {totalPages}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-800 text-white hover:bg-slate-700 hover:border-gdash-primary border border-slate-700'
                            }`}
                    >
                        Próximo ›
                    </button>

                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-800 text-white hover:bg-slate-700 hover:border-gdash-primary border border-slate-700'
                            }`}
                    >
                        »»
                    </button>
                </div>
            </div>

            {/* Modal para detalhes do pokémon */}
            {selectedPokemon && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedPokemon(null)}
                >
                    <div
                        className="bg-gdash-card border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {loadingDetails ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gdash-primary mx-auto mb-4"></div>
                                <p className="text-slate-400">Carregando detalhes...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-4xl font-bold text-white capitalize mb-2">
                                            {selectedPokemon.name}
                                        </h2>
                                        <div className="flex gap-2">
                                            {selectedPokemon.types?.map((type: string) => (
                                                <span
                                                    key={type}
                                                    className="px-4 py-1 rounded-full text-white font-semibold text-sm"
                                                    style={{ backgroundColor: typeColors[type] || '#68A090' }}
                                                >
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPokemon(null)}
                                        className="text-slate-400 hover:text-white text-3xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="flex justify-center mb-6">
                                    <img
                                        src={selectedPokemon.sprites?.official || selectedPokemon.sprites?.front_default}
                                        alt={selectedPokemon.name}
                                        className="w-64 h-64 object-contain"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <p className="text-slate-400 text-sm mb-1">Altura</p>
                                        <p className="text-2xl font-bold text-white">{(selectedPokemon.height / 10).toFixed(1)}m</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <p className="text-slate-400 text-sm mb-1">Peso</p>
                                        <p className="text-2xl font-bold text-white">{(selectedPokemon.weight / 10).toFixed(1)}kg</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-white mb-3">Estatísticas</h3>
                                    <div className="space-y-3">
                                        {selectedPokemon.stats?.map((stat: any) => (
                                            <div key={stat.name}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-slate-400 capitalize text-sm">{stat.name}</span>
                                                    <span className="text-white font-bold">{stat.value}</span>
                                                </div>
                                                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-gdash-primary to-emerald-400 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min((stat.value / 255) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3">Habilidades</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedPokemon.abilities?.map((ability: string) => (
                                            <span
                                                key={ability}
                                                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 capitalize"
                                            >
                                                {ability.replace('-', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
