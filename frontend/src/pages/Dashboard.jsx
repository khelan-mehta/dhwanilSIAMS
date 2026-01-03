import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [finance, setFinance] = useState({
    total_revenue: 0,
    total_expenses: 0,
    outstanding_receivables: 0,
    net_profit: 0
  });

  useEffect(() => {
    api.get("/finance")
      .then(res => setFinance(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
      <StatCard title="Total Revenue" value={finance.total_revenue} />
      <StatCard title="Total Expenses" value={finance.total_expenses} />
      <StatCard title="Outstanding" value={finance.outstanding_receivables} />
      <StatCard title="Net Profit" value={finance.net_profit} />
    </div>
  );
}
