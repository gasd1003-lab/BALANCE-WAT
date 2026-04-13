import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
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
    if (isNaN(value)) return;
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    setBalance(prev => prev + value);
    setHistory(prev => [{ type: "Ingreso", value, date: dateStr }, ...prev]);
    setIncome("");
  };

  const addExpense = () => {
    const value = parseFloat(expense);
    if (isNaN(value)) return;
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const finalCat = category === "Varios" ? (customTitle || "Varios") : category;
    setBalance(prev => prev - value);
    setHistory(prev => [{ type: "Gasto", value, category: finalCat, date: dateStr }, ...prev]);
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

  const getComparisonData = () => {
    let totalIn = 0;
    let totalOut = 0;
    history.forEach(i => {
      if (i.type === "Ingreso") totalIn += i.value;
      if (i.type === "Gasto") totalOut += i.value;
    });
    return [
      { name: "Ingresos", value: totalIn, color: "#10b981" },
      { name: "Gastos", value: totalOut, color: "#ef4444" }
    ];
  };

  // Función de etiqueta personalizada sin líneas y con color dinámico
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, fill }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
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
          <h2 className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Balance Disponible</h2>
          <div className={`text-5xl font-black mt-2 tracking-tighter ${balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ${formatMoney(balance)}
          </div>
        </header>

        <div className="grid gap-3">
          {/* INGRESO */}
          <section className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-[2.5rem]">
            <h3 className="text-emerald-500 text-[10px] font-bold uppercase mb-3 px-1">🟢 Nuevo Ingreso</h3>
            <div className="flex gap-2">
              <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0.00" className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-4 outline-none focus:border-emerald-500" />
              <button onClick={addIncome} className="bg-emerald-600 px-6 rounded-2xl font-bold">Ok</button>
            </div>
          </section>

          {/* GASTO */}
          <section className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-[2.5rem]">
            <h3 className="text-amber-500 text-[10px] font-bold uppercase mb-3 px-1">🔴 Nuevo Gasto</h3>
            <div className="space-y-3">
              <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="0.00" className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-4 outline-none" />
              <div className="flex gap-2">
                <select className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-4 outline-none appearance-none text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option>Comida</option><option>Transporte</option><option>Renta</option><option>Diversión</option><option>Varios</option>
                </select>
                <button onClick={addExpense} className="bg-amber-600 px-5 rounded-2xl font-black text-black uppercase text-[10px]">Gastar</button>
              </div>
            </div>
          </section>
        </div>

        {/* GRÁFICA 1: CATEGORÍAS */}
        {getCategoryData().length > 0 && (
          <section className="bg-slate-800/20 border border-slate-800/50 p-6 rounded-[2.5rem] text-center">
            <h3 className="font-bold text-slate-500 text-[10px] uppercase mb-4">Gastos por Categoría</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getCategoryData()} dataKey="value" innerRadius={45} outerRadius={65} labelLine={false} label={renderLabel}>
                    {getCategoryData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* GRÁFICA 2: COMPARATIVA */}
        {history.length > 0 && (
          <section className="bg-slate-800/20 border border-slate-800/50 p-6 rounded-[2.5rem] text-center">
            <h3 className="font-bold text-slate-500 text-[10px] uppercase mb-4">Ingresos vs Gastos</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getComparisonData()} dataKey="value" innerRadius={45} outerRadius={65} labelLine={false} label={renderLabel}>
                    {getComparisonData().map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* HISTORIAL */}
        <section className="w-full pb-16">
          <h3 className="text-slate-600 font-bold text-[10px] uppercase mb-4 px-3 tracking-widest">Movimientos</h3>
          <div className="space-y-3">
            {history.slice(0, 15).map((item, i) => (
              <div key={i} className="bg-slate-800/20 p-5 rounded-[1.5rem] flex justify-between items-center border border-slate-800/50">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-200">{item.category || item.type}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{item.date}</span>
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
            <p className="text-slate-400 font-bold mb-6 text-xs uppercase tracking-widest">¿Formatear sistema?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {setBalance(0); setHistory([]); setShowConfirm(false); localStorage.clear();}} className="bg-red-500 text-white w-64 py-4 rounded-2xl font-black text-xs">Sí, Borrar</button>
              <button onClick={() => setShowConfirm(false)} className="text-slate-600 text-xs font-bold py-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
