import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ["#60a5fa", "#fbbf24", "#a78bfa", "#f472b6"];
const formatMoney = (num) => Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function WorkTravelApp() {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [category, setCategory] = useState("Comida");
  const [customTitle, setCustomTitle] = useState("");
  const [history, setHistory] = useState([]);
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

  const addIncome = () => {
    const value = parseFloat(income);
    if (!value) return;
    setBalance(prev => prev + value);
    setHistory(prev => [{ type: "Ingreso", value, date: new Date().toLocaleDateString() }, ...prev]);
    setIncome("");
  };

  const addExpense = () => {
    const value = parseFloat(expense);
    if (!value) return;
    const finalCat = category === "Varios" ? (customTitle || "Varios") : category;
    setBalance(prev => prev - value);
    setHistory(prev => [{ type: "Gasto", value, category: finalCat, date: new Date().toLocaleDateString() }, ...prev]);
    setExpense("");
    setCustomTitle("");
  };

  const getCategoryData = () => {
    const categories = {};
    history.filter(i => i.type === "Gasto").forEach(i => {
      categories[i.category] = (categories[i.category] || 0) + i.value;
    });
    return Object.keys(categories).map(key => ({ name: key, value: categories[key] }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* HEADER & BALANCE */}
        <header className="text-center pt-4">
          <h2 className="text-slate-400 uppercase tracking-widest text-xs font-bold">Balance Disponible</h2>
          <div className={`text-5xl font-black mt-2 transition-colors ${balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ${formatMoney(balance)}
          </div>
        </header>

        {/* ACCIONES RÁPIDAS */}
        <div className="grid grid-cols-1 gap-4">
          {/* CARD INGRESO */}
          <section className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl backdrop-blur-sm">
            <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">🟢 Nuevo Ingreso</h3>
            <div className="flex gap-2">
              <input 
                type="number" value={income} onChange={(e) => setIncome(e.target.value)}
                placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button onClick={addIncome} className="bg-emerald-600 hover:bg-emerald-500 px-6 rounded-2xl font-bold transition-all">Añadir</button>
            </div>
          </section>

          {/* CARD GASTO */}
          <section className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl backdrop-blur-sm">
            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">🔴 Registrar Gasto</h3>
            <div className="space-y-3">
              <input 
                type="number" value={expense} onChange={(e) => setExpense(e.target.value)}
                placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2">
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 outline-none"
                  value={category} onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Comida</option><option>Transporte</option><option>Renta</option><option>Diversión</option><option>Varios</option>
                </select>
                <button onClick={addExpense} className="bg-amber-600 hover:bg-amber-500 px-6 rounded-2xl font-bold transition-all text-black">Gastar</button>
              </div>
              {category === "Varios" && (
                <input 
                  value={customTitle} onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="¿En qué?" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 focus:outline-none"
                />
              )}
            </div>
          </section>
        </div>

        {/* GRÁFICA */}
        {getCategoryData().length > 0 && (
          <section className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl">
            <h3 className="text-center font-bold text-slate-400 mb-4">Distribución de Gastos</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getCategoryData()} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {getCategoryData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* HISTORIAL */}
        <section className="w-full pb-10">
          <h3 className="text-slate-500 font-bold mb-4 px-2">Movimientos Recientes</h3>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} className="bg-slate-800/30 p-4 rounded-2xl flex justify-between items-center border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">{item.category || item.type}</div>
                  <div className="text-xs text-slate-500">{item.date}</div>
                </div>
                <div className={`font-mono font-bold ${item.type === 'Ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.type === 'Ingreso' ? '+' : '-'}${formatMoney(item.value)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTÓN RESET */}
        <button 
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 text-slate-600 text-sm hover:text-red-400 transition-colors"
        >
          Reiniciar aplicación ⚙️
        </button>
      </div>

      {/* MODAL CONFIRMACIÓN */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2rem] max-w-xs w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black mb-2">¿Borrar todo?</h2>
            <p className="text-slate-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {setBalance(0); setHistory([]); setShowConfirm(false); localStorage.clear();}} className="bg-red-500 text-white font-bold py-3 rounded-2xl">Sí, borrar datos</button>
              <button onClick={() => setShowConfirm(false)} className="text-slate-400 py-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
