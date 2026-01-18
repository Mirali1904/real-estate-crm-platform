"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AnalyticsScatterChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const raw = localStorage.getItem("loggedUser");
  if (!raw) return;

  const user = JSON.parse(raw);

  fetch(`/api/analytics/scatter?tenantId=${user.tenantId}`)
    .then((res) => res.json())
    .then((res) => setData(Array.isArray(res) ? res : []))
    .catch(() => setData([]))
    .finally(() => setLoading(false));
}, []);


  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          User Activity Analytics
        </h3>
        <span className="text-sm text-gray-500">Last Week</span>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
  <ScatterChart>
    <CartesianGrid />
    <XAxis type="number" dataKey="x" name="Actions" />
   <YAxis
  dataKey="y"
  name="User"
  allowDecimals={false}
/>

    <Tooltip
  formatter={(value, name, props) => {
    if (name === "x") return [`${value} actions`, "Total"];
    return value;
  }}
  labelFormatter={() => ""}
/>

    <Scatter data={data} fill="#2563eb" />
  </ScatterChart>
</ResponsiveContainer>

      </div>
    </div>
  );
}
