import { useEffect, useState } from 'react';
import axios from 'axios';
import { CloudRain, Droplets, Thermometer, CalendarClock, RefreshCw, Wind, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx'; // <--- Importando a biblioteca de Excel

// Definindo o tipo do dado que vem da API
interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  createdAt: string;
}

function App() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv"); // <--- Estado do Select

  // 1. Busca apenas os números (Rápido & Recorrente)
  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/weather');
      setLogs(response.data.reverse().slice(0, 6));
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    }
  };

  // 2. Busca apenas a IA (Lento & Pontual)
  const fetchInsight = async () => {
    try {
      const aiResponse = await axios.get('http://localhost:3000/weather/insight');
      setInsight(aiResponse.data.text);
    } catch (error) {
      console.error("Erro ao buscar IA:", error);
    }
  };

  // 3. Busca TUDO
  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchLogs(), fetchInsight()]);
    setLoading(false);
  };

  // --- Lógica de Exportação ---
  const handleExport = () => {
    if (logs.length === 0) return alert("Sem dados para exportar!");

    if (exportFormat === 'csv') {
      downloadCSV();
    } else {
      downloadXLSX();
    }
  };

  const downloadCSV = () => {
    const headers = ["Data", "Temperatura (C)", "Umidade (%)", "Vento (km/h)", "Chuva (mm)"];
    const csvRows = [
      headers.join(","),
      ...logs.map(log => [
        new Date(log.createdAt).toLocaleString('pt-BR'),
        log.temperature,
        log.humidity,
        log.windSpeed,
        log.precipitation
      ].join(","))
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gdash_relatorio_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadXLSX = () => {
    // 1. Formata os dados para o Excel (Array de Objetos fica bonito na planilha)
    const dadosFormatados = logs.map(log => ({
      "Data/Hora": new Date(log.createdAt).toLocaleString('pt-BR'),
      "Temperatura (°C)": log.temperature,
      "Umidade (%)": log.humidity,
      "Vento (km/h)": log.windSpeed,
      "Chuva (mm)": log.precipitation
    }));

    // 2. Cria uma planilha (Worksheet)
    const ws = XLSX.utils.json_to_sheet(dadosFormatados);

    // 3. Cria um arquivo (Workbook) e adiciona a planilha
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Climático");

    // 4. Baixa o arquivo
    XLSX.writeFile(wb, `gdash_relatorio_${Date.now()}.xlsx`);
  };
  // ----------------------------

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gdash-dark text-white p-8 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gdash-primary">GDASH</span> Monitor
          </h1>
          <p className="text-gdash-gray mt-1">Monitoramento Climático em Tempo Real</p>
        </div>

        <div className="flex gap-3 items-center">

          {/* Grupo de Exportação (Select + Botão) */}
          <div className="flex bg-emerald-900/30 rounded-lg border border-emerald-500/50 p-1">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as "csv" | "xlsx")}
              className="bg-transparent text-emerald-100 text-sm px-2 py-1 rounded focus:outline-none cursor-pointer hover:text-white"
            >
              <option value="csv" className="bg-slate-800">CSV</option>
              <option value="xlsx" className="bg-slate-800">XLSX</option>
            </select>

            <div className="w-px bg-emerald-500/50 mx-1"></div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Download size={16} />
              Baixar
            </button>
          </div>

          {/* Botão Atualizar */}
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 bg-gdash-card hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition-all text-sm font-medium h-[42px]"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </header>

      {/* Card de IA */}
      {insight && (
        <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-gdash-dark to-slate-900 border border-gdash-primary/30 rounded-xl p-6 shadow-lg flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-gdash-primary/10 p-3 rounded-full text-gdash-primary shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
          </div>
          <div>
            <h3 className="text-gdash-primary font-bold text-lg mb-1">Insight da IA</h3>
            <p className="text-slate-300 leading-relaxed">{insight}</p>
          </div>
        </div>
      )}

      {/* Grid de Cards */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logs.map((log) => (
          <div key={log._id} className="bg-gdash-card border-l-4 border-gdash-primary rounded-r-xl p-6 shadow-lg hover:translate-y-[-4px] transition-transform duration-300">
            <div className="flex items-center gap-2 text-gdash-gray text-xs mb-4 uppercase tracking-wider font-semibold">
              <CalendarClock size={14} />
              {format(new Date(log.createdAt), "dd 'de' MMM 'às' HH:mm:ss", { locale: ptBR })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center gap-3 mb-2">
                <div className="p-3 bg-slate-800 rounded-full text-gdash-primary">
                  <Thermometer size={28} />
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Temperatura</span>
                  <div className="text-3xl font-bold text-white">{log.temperature.toFixed(1)}°C</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                <Droplets size={18} className="text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Umidade</p>
                  <p className="font-semibold">{log.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                <CloudRain size={18} className="text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Precipitação</p>
                  <p className="font-semibold">{log.precipitation}mm</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg col-span-2 mt-2">
                <Wind size={18} className="text-gdash-primary" />
                <div className="flex justify-between w-full items-center">
                  <p className="text-xs text-slate-400">Vento</p>
                  <p className="font-semibold">{log.windSpeed} km/h</p>
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