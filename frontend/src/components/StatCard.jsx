import React from "react";

export default function StatCard({ title, value }) {
  return (
    <div style={styles.card}>
      <h4 style={styles.title}>{title}</h4>
      <p style={styles.value}>{value}</p>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#f1f5f9",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  title: {
    margin: 0,
    fontSize: "14px",
    color: "#334155"
  },
  value: {
    margin: "8px 0 0",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#0f172a"
  }
};
