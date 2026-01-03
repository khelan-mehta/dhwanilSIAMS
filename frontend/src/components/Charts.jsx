import { Bar } from "react-chartjs-2";

export default function Charts({ labels, data }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [{
          label: "Sales",
          data
        }]
      }}
    />
  );
}
