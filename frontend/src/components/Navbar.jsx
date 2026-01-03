import React from "react";

export default function Navbar({ currentPage, setCurrentPage }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "products", label: "Products" },
    { key: "purchases", label: "Purchases" },
    { key: "sales", label: "Sales" }
  ];

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>SIAMS</h2>

      <ul style={styles.menu}>
        {navItems.map(item => (
          <li
            key={item.key}
            onClick={() => setCurrentPage(item.key)}
            style={{
              ...styles.menuItem,
              ...(currentPage === item.key ? styles.active : {})
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#1e293b",
    color: "#ffffff"
  },
  logo: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold"
  },
  menu: {
    display: "flex",
    listStyle: "none",
    gap: "20px",
    margin: 0,
    padding: 0
  },
  menuItem: {
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "4px"
  },
  active: {
    backgroundColor: "#334155"
  }
};
