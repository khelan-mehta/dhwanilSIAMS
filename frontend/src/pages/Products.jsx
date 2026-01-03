import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    stock_qty: 0,
    cost_price: 0,
    sell_price: 0
  });

  const loadProducts = () => {
    api.get("/products").then(res => setProducts(res.data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const submit = () => {
    api.post("/products", form).then(() => {
      loadProducts();
      setForm({ name: "", stock_qty: 0, cost_price: 0, sell_price: 0 });
    });
  };

  return (
    <div>
      <h2>Add Product</h2>

      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input type="number" placeholder="Initial Stock" onChange={e => setForm({ ...form, stock_qty: +e.target.value })} />
      <input type="number" placeholder="Cost Price" onChange={e => setForm({ ...form, cost_price: +e.target.value })} />
      <input type="number" placeholder="Sell Price" onChange={e => setForm({ ...form, sell_price: +e.target.value })} />

      <button onClick={submit}>Add Product</button>

      <hr />

      <h3>Product List</h3>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name} | Stock: {p.stock_qty}
          </li>
        ))}
      </ul>
    </div>
  );
}
