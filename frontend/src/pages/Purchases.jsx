import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Purchases() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    supplier: "",
    product_id: "",
    qty: 0,
    purchase_price: 0,
    date: ""
  });

  useEffect(() => {
    api.get("/products").then(res => setProducts(res.data));
  }, []);

  const submit = () => {
    api.post("/purchases", form).then(() => {
      alert("Purchase recorded. Stock updated.");
      setForm({ supplier: "", product_id: "", qty: 0, purchase_price: 0, date: "" });
    });
  };

  return (
    <div>
      <h2>Record Purchase</h2>

      <input placeholder="Supplier" onChange={e => setForm({ ...form, supplier: e.target.value })} />

      <select onChange={e => setForm({ ...form, product_id: +e.target.value })}>
        <option>Select Product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <input type="number" placeholder="Quantity" onChange={e => setForm({ ...form, qty: +e.target.value })} />
      <input type="number" placeholder="Purchase Price" onChange={e => setForm({ ...form, purchase_price: +e.target.value })} />
      <input type="date" onChange={e => setForm({ ...form, date: e.target.value })} />

      <button onClick={submit}>Save Purchase</button>
    </div>
  );
}
