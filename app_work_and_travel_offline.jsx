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

  // Función para etiquetas blancas y visibles
  const renderCustomLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* BALANCE */}
        <header className="text-center pt-4">
          <h2 className="text-slate-400 uppercase tracking-widest text-xs font-bold">Balance Disponible</h2>
          <div className={`text-5xl font-black mt-2 ${balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ${formatMoney(balance)}
          </div>
        </header>

        {/* INPUTS */}
        <div className="grid gap-4">
          <section className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl">
            <h3 className="text-emerald-400 font-bold mb-3">🟢 Ingreso</h3>
            <div className="flex gap-2">
              <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              <button onClick={addIncome} className="bg-emerald-600 px-6 rounded-2xl font-bold">Ok</button>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl">
            <h3 className="text-amber-400 font-bold mb-3">🔴 Gasto</h3>
            <div className="space-y-3">
              <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="0.00" className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 outline-none" />
              <div className="flex gap-2">
                <select className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option>Comida</option><option>Transporte</option><option>Renta</option><option>Diversión</option><option>Varios</option>
                </select>
                <button onClick={addExpense} className="bg-amber-600 px-4 rounded-2xl font-bold text-black font-black">Gastar</button>
              </div>
            </div>
          </section>
        </div>

        {/* GRÁFICA 1: CATEGORÍAS */}
        {getCategoryData().length > 0 && (
          <section className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl text-center">
            <h3 className="font-bold text-slate-400 mb-2">Gastos por Categoría</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={getCategoryData()} dataKey="value" innerRadius={50} outerRadius={70} label={{fill: '#cbd5e1', fontSize: 12}}>
                    {getCategoryData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* GRÁFICA 2: INGRESOS VS GASTOS */}
        {history.length > 0 && (
          <section className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl text-center">
            <h3 className="font-bold text-slate-400 mb-2">Ingresos vs Gastos</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={getComparisonData()} dataKey="value" innerRadius={50} outerRadius={70} label={{fill: '#f8fafc', fontSize: 12}}>
                    {getComparisonData().map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '10px'}} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* HISTORIAL */}
        <section className="w-full pb-10">
          <h3 className="text-slate-500 font-bold mb-4 px-2">Historial</h3>
          <div className="space-y-2">
            {history.slice(0, 10).map((item, i) => (
              <div key={i} className="bg-slate-800/30 p-4 rounded-2xl flex justify-between items-center border border-slate-800">
                <span className="text-sm font-bold">{item.category || item.type}</span>
                <span className={`font-mono font-bold ${item.type === 'Ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${formatMoney(item.value)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <button onClick={() => setShowConfirm(true)} className="w-full py-4 text-slate-600 text-xs">Reset Datos ⚙️</button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center">
            <p className="mb-6">¿Borrar todo el historial?</p>
            <button onClick={() => {setBalance(0); setHistory([]); setShowConfirm(false); localStorage.clear();}} className="bg-red-500 w-full py-3 rounded-2xl font-bold mb-2">Confirmar</button>
            <button onClick={() => setShowConfirm(false)} className="text-slate-500">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
