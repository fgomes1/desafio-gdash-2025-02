import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuggestionResponse {
    suggestion: {
        reason: string;
        type: string;
        weather: {
            temperature: number;
            condition: string;
        };
    };
    pokemon: {
        id: number;
        name: string;
        sprites: {
            official: string;
            front_default: string;
        };
        types: string[];
    };
}

export function PokemonInsight() {
    const [data, setData] = useState<SuggestionResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSuggestion();
    }, []);

    const loadSuggestion = async () => {
        try {
            const response = await api.get('/pokemon/suggest');
            setData(response.data);
        } catch (error) {
            console.error('Erro ao carregar sugestão:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gdash-card border border-slate-700 rounded-xl p-6 h-full animate-pulse">
                <div className="h-6 w-32 bg-slate-700 rounded mb-4"></div>
                <div className="h-20 bg-slate-700 rounded mb-4"></div>
                <div className="h-32 bg-slate-700 rounded mx-auto w-32"></div>
            </div>
        );
    }

    if (!data) return null;

    // Cores baseadas no tipo
    const typeColors: Record<string, string> = {
        fire: 'from-orange-500 to-red-600',
        water: 'from-blue-500 to-cyan-600',
        grass: 'from-green-500 to-emerald-600',
        electric: 'from-yellow-400 to-amber-500',
        ice: 'from-cyan-300 to-blue-400',
        psychic: 'from-pink-500 to-purple-600',
        dragon: 'from-indigo-500 to-purple-700',
        dark: 'from-slate-700 to-black',
        fairy: 'from-pink-300 to-rose-400',
        normal: 'from-slate-400 to-slate-500',
        fighting: 'from-red-700 to-orange-800',
        flying: 'from-sky-400 to-blue-500',
        poison: 'from-purple-500 to-fuchsia-700',
        ground: 'from-amber-600 to-yellow-800',
        rock: 'from-stone-500 to-stone-700',
        bug: 'from-lime-500 to-green-700',
        ghost: 'from-violet-800 to-indigo-900',
        steel: 'from-slate-400 to-zinc-500',
    };

    const gradient = typeColors[data.suggestion.type] || 'from-slate-500 to-slate-700';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gdash-card border border-slate-700 rounded-xl p-6 h-full relative overflow-hidden group"
        >
            {/* Background Gradient Effect */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-10 blur-3xl rounded-full -mr-16 -mt-16 transition-opacity group-hover:opacity-20`}></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Insight do Dia</h3>
                </div>

                <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                    {data.suggestion.reason}
                </p>

                <div className="flex flex-col items-center">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-2xl opacity-30 rounded-full`}></div>
                        <img
                            src={data.pokemon.sprites.official || data.pokemon.sprites.front_default}
                            alt={data.pokemon.name}
                            className="w-40 h-40 object-contain relative z-10 drop-shadow-xl"
                        />
                    </motion.div>

                    <h4 className="text-xl font-bold text-white mt-4 capitalize">
                        {data.pokemon.name}
                    </h4>

                    <div className="flex gap-2 mt-2">
                        {data.pokemon.types.map(type => (
                            <span key={type} className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-600 text-slate-300 uppercase tracking-wider">
                                {type}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
