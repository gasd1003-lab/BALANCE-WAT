import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// Importamos iconos para mejorar la interfaz
import { 
  Utensils, 
  Car, 
  Home, 
  Gamepad2, 
  Layers, 
  PlusCircle, 
  MinusCircle, 
  Calendar,
  Download
} from "lucide-react";

const COLORS = ["#60a5fa", "#fbbf24", "#a78bfa", "#f472b6"];

const formatMoney = (num) => Number(num || 0).toLocaleString('en-US', { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
});

// Mapeo de iconos por categoría
const getCategoryIcon = (cat, type) => {
  if (type === "Ingreso") return <PlusCircle className="text-emerald-500" size={18} />;
  switch (cat) {
    case "Comida": return <Utensils className="text-blue-400" size={18} />;
    case "Transporte": return <Car className="text-amber-400" size={18} />;
    case "Renta": return <Home className="text-purple-400" size={18} />;
    case "Diversión": return <Gamepad2 className="text-pink-400" size={18} />;
    default: return <Layers className="text-slate-400" size={18} />;
  }
};

export default function WorkTravelApp() {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [category, setCategory] = useState("Comida");
  const [customTitle, setCustomTitle] = useState("");
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("Todo"); // Estado para el filtro
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("wt-data");
    if (data) {
      const parsed = JSON.parse(data);
      setBalance(parsed.balance || 0);
      setHistory(parsed.history || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wt-data", JSON.stringify({ balance, history }));
  }, [balance, history]);

  const addMovement = (type, val, cat) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    const now = new Date();
    const newMovement = {
      type,
      value: num,
      category: type === "Gasto" ? cat : "Salario/Otros",
      date: now.toLocaleDateString(),
      timestamp: now.getTime() // Guardamos timestamp para filtrar mejor
    };
    setBalance(prev => type === "Ingreso" ? prev + num : prev - num);
    setHistory(prev => [newMovement, ...prev]);
  };

  // Lógica de Filtrado
  const filteredHistory = history.filter(item => {
    if (filter === "Todo") return true;
    const itemDate = new Date(item.timestamp || 0);
    const now = new Date();
    if (filter === "Mes") return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    if (filter === "Semana") {
      const oneWeekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
      return (item.timestamp || 0) > oneWeekAgo;
    }
    return true;
  });

  const getCategoryData = () => {
    const categories = {};
    filteredHistory.filter(i => i.type === "Gasto").forEach(i => {
      categories[i.category] = (categories[i.category] || 0) + i.value;
    });
    return Object.keys(categories).map(key => ({ name: key, value: categories[key] }));
  };

  const getComparisonData = () => {
    let inTotal = 0, outTotal = 0;
    filteredHistory.forEach(i => {
      if (i.type === "Ingreso") inTotal += i.value;
      else outTotal += i.value;
    });
    return [
      { name: "Ingresos", value: inTotal, color: "#10b981" },
      { name: "Gastos", value: outTotal, color: "#ef4444" }
    ];
  };

  const renderLabel = ({ cx, cy, midAngle, outerRadius, value, name, fill }) => {
    const RADIAN = Math.PI / 180;
    const x = cx + (outerRadius * 1.25) * Math.cos(-midAngle * RADIAN);
    const y = cy + (outerRadius * 1.25) * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
        {`${name}: $${value.toFixed(2)}`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        
        <header className="text-center pt-6">
          <h2 className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Balance Global</h2>
          <div className={`text-5xl font-black mt-2 tracking-tighter ${balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ${formatMoney(balance)}
          </div>
        </header>

        {/* SELECTOR DE FILTRO */}
        <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
          {["Todo", "Semana", "Mes"].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${filter === f ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* FORMULARIOS */}
        <div className="grid gap-3">
          <section className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-[2rem]">
            <div className="flex gap-2">
              <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Nuevo Ingreso" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 outline-none focus:border-emerald-500" />
              <button onClick={() => { addMovement("Ingreso", income); setIncome(""); }} className="bg-emerald-600 px-5 rounded-xl font-bold"><PlusCircle size={20}/></button>
            </div>
          </section>

          <section className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-[2rem] space-y-3">
            <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="Nuevo Gasto" className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 outline-none focus:border-red-500" />
            <div className="flex gap-2">
              <select className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 outline-none text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Comida</option><option>Transporte</option><option>Renta</option><option>Diversión</option><option>Varios</option>
              </select>
              <button onClick={() => { addMovement("Gasto", expense, category); setExpense(""); }} className="bg-red-500 px-5 rounded-xl font-bold text-white"><MinusCircle size={20}/></button>
            </div>
          </section>
        </div>

        {/* GRÁFICAS (Se actualizan según el filtro) */}
        {getCategoryData().length > 0 && (
          <section className="bg-slate-800/20 border border-slate-800/50 p-6 rounded-[2.5rem] text-center">
            <h3 className="font-bold text-slate-500 text-[10px] uppercase mb-4 flex items-center justify-center gap-2">
              <Calendar size={12}/> Gastos ({filter})
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getCategoryData()} dataKey="value" innerRadius={45} outerRadius={60} labelLine={false} label={renderLabel}>
                    {getCategoryData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* HISTORIAL CON ICONOS */}
        <section className="w-full pb-16">
          <h3 className="text-slate-600 font-bold text-[10px] uppercase mb-4 px-3 tracking-widest">Movimientos Recientes</h3>
          <div className="space-y-3">
            {filteredHistory.slice(0, 15).map((item, i) => (
              <div key={i} className="bg-slate-800/20 p-4 rounded-[1.5rem] flex justify-between items-center border border-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
                    {getCategoryIcon(item.category, item.type)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">{item.category || item.type}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{item.date}</span>
                  </div>
                </div>
                <span className={`font-mono font-bold text-lg ${item.type === 'Ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.type === 'Ingreso' ? '+' : '-'}${formatMoney(item.value)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <button onClick={() => setShowConfirm(true)} className="w-full py-6 text-slate-700 text-[9px] uppercase font-black">Reset ⚙️</button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-10 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] text-center shadow-2xl">
            <p className="text-slate-400 font-bold mb-6 text-xs uppercase tracking-widest">¿Borrar base de datos?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {setBalance(0); setHistory([]); setShowConfirm(false); localStorage.clear();}} className="bg-red-500 text-white w-64 py-4 rounded-2xl font-black text-xs">Confirmar</button>
              <button onClick={() => setShowConfirm(false)} className="text-slate-600 text-xs font-bold py-2 text-center w-full">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
