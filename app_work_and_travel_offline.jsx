import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#a855f7", "#ec4899"];

const formatMoney = (num) => Number(num || 0).toFixed(2);

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
      setBalance(parsed.balance);
      setHistory(parsed.history);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "wt-data",
      JSON.stringify({ balance, history })
    );
  }, [balance, history]);

  const getToday = () => new Date().toLocaleDateString();

  const addIncome = () => {
    const value = parseFloat(income);
    if (!value) return;
    setBalance(balance + value);
    setHistory([...history, { type: "Ingreso", value, date: getToday() }]);
    setIncome("");
  };

  const addExpense = () => {
    const value = parseFloat(expense);
    if (!value) return;
    const finalCategory = category === "Varios" ? customTitle || "Varios" : category;
    setBalance(balance - value);
    setHistory([
      ...history,
      { type: "Gasto", value, category: finalCategory, date: getToday() }
    ]);
    setExpense("");
    setCustomTitle("");
  };

  const resetAll = () => {
    setBalance(0);
    setHistory([]);
    localStorage.removeItem("wt-data");
    setShowConfirm(false);
  };

  const getCategoryData = () => {
    const categories = {};
    history
      .filter((item) => item.type === "Gasto")
      .forEach((item) => {
        categories[item.category] =
          (categories[item.category] || 0) + item.value;
      });
    return Object.keys(categories).map((key) => ({
      name: key,
      value: Number(categories[key].toFixed(2))
    }));
  };

  const getIncomeExpenseData = () => {
    let totalIncome = 0;
    let totalExpense = 0;
    history.forEach((item) => {
      if (item.type === "Ingreso") totalIncome += item.value;
      if (item.type === "Gasto") totalExpense += item.value;
    });
    return [
      { name: "Ingresos", value: Number(totalIncome.toFixed(2)) },
      { name: "Gastos", value: Number(totalExpense.toFixed(2)) }
    ];
  };

  const renderValueLabel = ({ value }) => `$${formatMoney(value)}`;

  return (
    <div className="p-4 grid gap-4 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white font-sans">
      
      {/* BALANCE CARD */}
      <div className={`p-8 shadow-2xl rounded-3xl text-center relative ${
          balance < 0 ? "bg-gradient-to-r from-red-500 to-red-700" : "bg-gradient-to-r from-green-400 to-emerald-600"
        }`}>
        <h1 className="text-lg font-semibold text-white">Balance total</h1>
        <p className="text-5xl font-extrabold mt-2 text-white">${formatMoney(balance)}</p>
        <button onClick={() => setShowConfirm(true)} className="absolute top-2 right-3 text-sm opacity-70 hover:opacity-100">⚙️</button>
      </div>

      {/* MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-2xl shadow-xl w-80 text-center">
            <h2 className="font-bold text-lg mb-2">¿Estás seguro?</h2>
            <p className="text-sm mb-4">Esto eliminará todos tus datos</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 rounded-xl">Cancelar</button>
              <button onClick={resetAll} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold">Sí, borrar</button>
            </div>
          </div>
        </div>
      )}

      {/* INGRESO SECTION */}
      <div className="p-4 shadow-lg rounded-2xl bg-white text-black grid gap-2">
        <h2 className="font-semibold text-blue-700">💵 Agregar Ingreso</h2>
        <input className="p-2 border rounded-xl" type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Cantidad" />
        <button className="bg-blue-600 text-white p-2 rounded-xl font-bold hover:bg-blue-700" onClick={addIncome}>Agregar</button>
      </div>

      {/* GASTO SECTION */}
      <div className="p-4 shadow-lg rounded-2xl bg-white text-black grid gap-2">
        <h2 className="font-semibold text-red-600">💸 Agregar Gasto</h2>
        <input className="p-2 border rounded-xl" type="number" value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="Cantidad" />
        <select className="p-2 rounded-xl border" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Comida</option>
          <option>Transporte</option>
          <option>Renta</option>
          <option>Diversión</option>
          <option>Varios</option>
        </select>
        {category === "Varios" && (
          <input className="p-2 border rounded-xl" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Título del gasto" />
        )}
        <button className="bg-red-500 text-white p-2 rounded-xl font-bold hover:bg-red-600" onClick={addExpense}>Agregar Gasto</button>
      </div>

      {/* GRAFICA GASTOS */}
      <div className="p-4 shadow-lg rounded-2xl bg-white text-black">
        <h2 className="font-semibold mb-2">📊 Gastos por Categoría</h2>
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={getCategoryData()} dataKey="value" nameKey="name" outerRadius={80} label={renderValueLabel} labelLine={false}>
                {getCategoryData().map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `$${formatMoney(v)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HISTORIAL */}
      <div className="p-4 shadow-lg rounded-2xl bg-white text-black mb-8">
        <h2 className="font-semibold border-b pb-2 mb-2">📜 Historial</h2>
        <div className="max-h-60 overflow-y-auto">
          {history.map((item, index) => (
            <div key={index} className="flex justify-between border-b py-2 text-sm last:border-0">
              <span>
                <span className={item.type === "Ingreso" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {item.type}
                </span> 
                {item.category ? ` (${item.category})` : ""}
                <br />
                <span className="text-gray-400 text-xs">{item.date}</span>
              </span>
              <span className="font-mono font-bold">${formatMoney(item.value)}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-center text-gray-400 py-4">No hay movimientos aún</p>}
        </div>
      </div>
    </div>
  );
}
