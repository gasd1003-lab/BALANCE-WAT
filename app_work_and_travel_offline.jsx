import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  Utensils, Car, Home, Gamepad2, Layers, 
  PlusCircle, MinusCircle, Calendar, Edit2, Check
} from "lucide-react";

const COLORS = ["#60a5fa", "#fbbf24", "#a78bfa", "#f472b6"];

const formatMoney = (num) => Number(num || 0).toLocaleString('en-US', { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
});

const getCategoryIcon = (cat, type) => {
  if (type === "Ingreso") return <PlusCircle className="text-emerald-500" size={16} />;
  switch (cat) {
    case "Comida": return <Utensils className="text-blue-400" size={16} />;
    case "Transporte": return <Car className="text-amber-400" size={16} />;
    case "Renta": return <Home className="text-purple-400" size={16} />;
    case "Diversión": return <Gamepad2 className="text-pink-400" size={16} />;
    default: return <Layers className="text-slate-400" size={16} />;
  }
};

export default function WorkTravelApp() {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [category, setCategory] = useState("Comida");
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("Todo");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
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
      id: Date.now(), // ID único para editar
      type,
      value: num,
      category: type === "Gasto" ? cat : "Ingreso",
      date: now.toLocaleDateString(),
      timestamp: now.getTime()
    };
    setBalance(prev => type === "Ingreso" ? prev + num : prev - num);
    setHistory(prev => [newMovement, ...prev]);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.value.toString());
  };

  const saveEdit = (id) => {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue)) return;

    const newHistory = history.map(item => {
      if (item.id === id) {
        // Ajustamos el balance global restando el viejo y sumando el nuevo
        const diff = item.type === "Ingreso" ? (newValue - item.value) : (item.value - newValue);
        setBalance(prev => prev + diff);
        return { ...item, value: newValue };
      }
      return item;
    });

    setHistory(newHistory);
    setEditingId(null);
  };

  const filteredHistory = history.filter(item => {
    if (filter === "Todo") return true;
    const itemDate = new Date(item.timestamp || 0);
    const now = new Date();
    if (filter === "Mes") return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    if (filter === "Semana") return (item.timestamp || 0) > (now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return true;
  });

  const categoryData = () => {
    const cats = {};
    filteredHistory.filter(i => i.type === "Gasto").forEach(i => {
      cats[i.category] = (cats[i.category] || 0) + i.value;
    });
    return Object.keys(cats).map(k => ({ name: k, value: cats[k] }));
  };

  const comparisonData = () => {
    let inc = 0, exp = 0;
    filteredHistory.forEach(i => i.type === "Ingreso" ? inc += i.value : exp += i.value);
    return [
      { name: "Ingresos", value: inc, color: "#10b981" },
      { name: "Gastos", value: exp, color: "#ef4444" }
    ];
  };

  const renderLabel = ({ cx, cy, midAngle, outerRadius, value, name, fill }) => {
    const RADIAN = Math.PI / 180;
    const x = cx + (outerRadius * 1.3) * Math.cos(-midAngle * RADIAN);
    const y = cy + (outerRadius * 1.3) * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
        {`${name}: $${value.toFixed(2)}`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        
        <header className="text-center pt-6">
          <h2 className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">Balance Disponible</h2>
          <div className={`text-5xl font-black mt-2 ${balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ${formatMoney(balance)}
          </div>
        </header>

        {/* FILTROS */}
        <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
          {["Todo", "Semana", "Mes"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl ${filter === f ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* INPUTS */}
        <div className="grid gap-3">
          <div className="bg-slate-800/40 p-5 rounded-[2rem] border border-slate-700/50 flex gap-2">
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Nuevo Ingreso" className="w-full bg-transparent outline-none text-lg" />
            <button onClick={() => { addMovement("Ingreso", income); setIncome(""); }} className="text-emerald-500"><PlusCircle size={28}/></button>
          </div>

          <div className="bg-slate-800/40 p-5 rounded-[2rem] border border-slate-700/50 space-y-3">
            <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="Nuevo Gasto" className="w-full bg-transparent outline-none text-lg" />
            <div className="flex gap-2">
              <select className="w-full bg-slate-900/50 p-3 rounded-xl outline-none text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Comida</option><option>Transporte</option><option>Renta</option><option>Diversión</option><option>Varios</option>
              </select>
              <button onClick={() => { addMovement("Gasto", expense, category); setExpense(""); }} className="text-red-400 px-2"><MinusCircle size={28}/></button>
            </div>
          </div>
        </div>

        {/* GRÁFICA 1: CATEGORÍAS */}
        {categoryData().length > 0 && (
          <section className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-800/50 text-center">
            <h3 className="text-[10px] uppercase font-bold text-slate-500 mb-4">Gastos por Categoría</h3>
            <div className="h-60"><ResponsiveContainer><PieChart><Pie data={categoryData()} dataKey="value" innerRadius={40} outerRadius={55} labelLine={false} label={renderLabel}>{categoryData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none"/>)}</Pie></PieChart></ResponsiveContainer></div>
          </section>
        )}

        {/* GRÁFICA 2: COMPARATIVA (RECUPERADA) */}
        {filteredHistory.length > 0 && (
          <section className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-800/50 text-center">
            <h3 className="text-[10px] uppercase font-bold text-slate-500 mb-4">Ingresos vs Gastos ({filter})</h3>
            <div className="h-60"><ResponsiveContainer><PieChart><Pie data={comparisonData()} dataKey="value" innerRadius={40} outerRadius={55} labelLine={false} label={renderLabel}>{comparisonData().map((entry, i) => <Cell key={i} fill={entry.color} stroke="none"/>)}</Pie></PieChart></ResponsiveContainer></div>
          </section>
        )}

        {/* HISTORIAL CON EDICIÓN */}
        <section className="pb-20 space-y-3">
          <h3 className="text-slate-600 text-[10px] uppercase font-bold px-3 tracking-widest">Historial</h3>
          {filteredHistory.slice(0, 15).map((item) => (
            <div key={item.id} className="bg-slate-800/20 p-4 rounded-[1.5rem] flex justify-between items-center border border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900/50 p-3 rounded-xl">{getCategoryIcon(item.category, item.type)}</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{item.category}</span>
                  <span className="text-[10px] text-slate-500">{item.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-20 bg-slate-900 border border-slate-700 rounded-lg p-1 text-sm outline-none text-right" />
                    <button onClick={() => saveEdit(item.id)} className="text-emerald-400"><Check size={18}/></button>
                  </div>
                ) : (
                  <>
                    <span className={`font-mono font-bold ${item.type === 'Ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${formatMoney(item.value)}
                    </span>
                    <button onClick={() => startEdit(item)} className="text-slate-600 hover:text-slate-400 ml-1"><Edit2 size={14}/></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
