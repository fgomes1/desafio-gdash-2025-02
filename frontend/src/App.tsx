import { useEffect, useState } from 'react';
import axios from 'axios';
import { CloudRain, Droplets, Thermometer, CalendarClock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Definindo o tipo do dado que vem da API
interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  createdAt: string;
}

function App() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Função que busca os dados
  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Chama sua API NestJS
      const response = await axios.get('http://localhost:3000/weather');
      // Pega os últimos 6 registros e inverte para o mais novo ficar no topo
      setLogs(response.data.reverse().slice(0, 6));
    } catch (error) {
      console.error("Erro ao buscar clima:", error);
    } finally {
      setLoading(false);
    }
  };

  // Busca ao carregar a página e atualiza a cada 10s
  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gdash-dark text-white p-8 font-sans">
      {/* Cabeçalho */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gdash-primary">GDASH</span> Monitor
          </h1>
          <p className="text-gdash-gray mt-1">Monitoramento Climático em Tempo Real</p>
        </div>
        <button 
          onClick={fetchWeather}
          className="flex items-center gap-2 bg-gdash-card hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition-all text-sm font-medium"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </header>

      {/* Grid de Cards */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {logs.map((log) => (
          <div 
            key={log._id} 
            className="bg-gdash-card border-l-4 border-gdash-primary rounded-r-xl p-6 shadow-lg hover:translate-y-[-4px] transition-transform duration-300"
          >
            {/* Data e Hora */}
            <div className="flex items-center gap-2 text-gdash-gray text-xs mb-4 uppercase tracking-wider font-semibold">
              <CalendarClock size={14} />
              {format(new Date(log.createdAt), "dd 'de' MMM 'às' HH:mm:ss", { locale: ptBR })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Temperatura (Destaque) */}
              <div className="col-span-2 flex items-center gap-3 mb-2">
                <div className="p-3 bg-slate-800 rounded-full text-gdash-primary">
                  <Thermometer size={28} />
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Temperatura</span>
                  <div className="text-3xl font-bold text-white">
                    {log.temperature.toFixed(1)}°C
                  </div>
                </div>
              </div>

              {/* Umidade */}
              <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                <Droplets size={18} className="text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Umidade</p>
                  <p className="font-semibold">{log.humidity}%</p>
                </div>
              </div>

              {/* Chuva */}
              <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                <CloudRain size={18} className="text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Precipitação</p>
                  <p className="font-semibold">{log.precipitation}mm</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="col-span-full text-center py-20 text-gdash-gray">
            <p className="text-xl">Aguardando dados do coletor...</p>
            <p className="text-sm mt-2">Verifique se o Python e o Worker Go estão rodando.</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;