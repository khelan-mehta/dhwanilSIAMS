import React from "react";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "products":
        return <Products />;
      case "purchases":
        return <Purchases />;
      case "sales":
        return <Sales />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div style={{ padding: "24px" }}>
        {renderPage()}
      </div>
    </>
  );
}
