import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    customer: "",
    product_id: "",
    qty: 0,
    selling_price: 0,
    paid: true,
    date: ""
  });

  useEffect(() => {
    api.get("/products").then(res => setProducts(res.data));
  }, []);

  const submit = () => {
    api.post("/sales", form).then(() => {
      alert("Sale recorded. Stock & profit updated.");
      setForm({ customer: "", product_id: "", qty: 0, selling_price: 0, paid: true, date: "" });
    });
  };

  return (
    <div>
      <h2>Record Sale</h2>

      <input placeholder="Customer" onChange={e => setForm({ ...form, customer: e.target.value })} />

      <select onChange={e => setForm({ ...form, product_id: +e.target.value })}>
        <option>Select Product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <input type="number" placeholder="Quantity" onChange={e => setForm({ ...form, qty: +e.target.value })} />
      <input type="number" placeholder="Selling Price" onChange={e => setForm({ ...form, selling_price: +e.target.value })} />

      <label>
        Paid?
        <input type="checkbox" checked={form.paid} onChange={e => setForm({ ...form, paid: e.target.checked })} />
      </label>

      <input type="date" onChange={e => setForm({ ...form, date: e.target.value })} />

      <button onClick={submit}>Save Sale</button>
    </div>
  );
}
