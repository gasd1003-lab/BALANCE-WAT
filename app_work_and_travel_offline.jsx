import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="p-4 grid gap-4 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* BALANCE */}
      <Card
        className={`shadow-2xl rounded-3xl text-center ${
          balance < 0
            ? "bg-gradient-to-r from-red-500 to-red-700"
            : "bg-gradient-to-r from-green-400 to-emerald-600"
        }`}
      >
        <CardContent className="py-8 relative">
          <h1 className="text-lg font-semibold text-white">Balance total</h1>
          <p className="text-5xl font-extrabold mt-2 text-white">
            ${formatMoney(balance)}
          </p>

          <button
            onClick={() => setShowConfirm(true)}
            className="absolute top-2 right-3 text-sm opacity-70 hover:opacity-100 text-white"
          >
            ⚙️
          </button>
        </CardContent>
      </Card>

      {/* MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-2xl shadow-xl w-80 text-center">
            <h2 className="font-bold text-lg mb-2">¿Estás seguro?</h2>
            <p className="text-sm mb-4">Esto eliminará todos tus datos</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setShowConfirm(false)} className="bg-gray-300 text-black">
                Cancelar
              </Button>
              <Button onClick={resetAll} className="bg-red-500 text-white">
                Sí, borrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* INGRESO */}
      <Card className="shadow-lg rounded-2xl bg-white text-black">
        <CardContent className="grid gap-2">
          <h2 className="font-semibold">💵 Agregar Ingreso</h2>
          <Input value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Cantidad" />
          <Button onClick={addIncome}>Agregar</Button>
        </CardContent>
      </Card>

      {/* GASTO */}
      <Card className="shadow-lg rounded-2xl bg-white text-black">
        <CardContent className="grid gap-2">
          <h2 className="font-semibold">💸 Agregar Gasto</h2>
          <Input value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="Cantidad" />

          <select
            className="p-2 rounded-xl border"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Comida</option>
            <option>Transporte</option>
            <option>Renta</option>
            <option>Diversión</option>
            <option>Varios</option>
          </select>

          {category === "Varios" && (
            <Input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Título del gasto"
            />
          )}

          <Button onClick={addExpense}>Agregar</Button>
        </CardContent>
      </Card>

      {/* GRAFICA GASTOS */}
      <Card className="shadow-lg rounded-2xl bg-white text-black">
        <CardContent>
          <h2 className="font-semibold mb-2">📊 Gastos por Categoría</h2>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={renderValueLabel}
                  labelLine={false}
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${formatMoney(v)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* GRAFICA INGRESOS VS GASTOS */}
      <Card className="shadow-lg rounded-2xl bg-white text-black">
        <CardContent>
          <h2 className="font-semibold mb-2">📊 Ingresos vs Gastos</h2>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={getIncomeExpenseData()}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={renderValueLabel}
                  labelLine={false}
                >
                  {getIncomeExpenseData().map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.name === "Ingresos" ? "#22c55e" : "#ef4444"}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${formatMoney(v)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* HISTORIAL */}
      <Card className="shadow-lg rounded-2xl bg-white text-black">
        <CardContent>
          <h2 className="font-semibold">📜 Historial</h2>
          {history.map((item, index) => (
            <div key={index} className="flex justify-between border-b py-1 text-sm">
              <span>
                {item.type} {item.category ? `(${item.category})` : ""}
                <br />
                <span className="text-gray-500 text-xs">{item.date}</span>
              </span>
              <span>${formatMoney(item.value)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
