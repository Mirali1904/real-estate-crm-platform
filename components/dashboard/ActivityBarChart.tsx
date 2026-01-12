"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function ActivityBarChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const raw = localStorage.getItem("loggedUser");
  if (!raw) return;

  const user = JSON.parse(raw);

  fetch(`/api/analytics/activity?tenantId=${user.tenantId}`)
    .then((res) => res.json())
    .then((res) => setData(Array.isArray(res) ? res : []))
    .catch(() => setData([]))
    .finally(() => setLoading(false));
}, []);


  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        Loading activity chart...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Activity Overview
        </h3>
        <span className="text-sm text-gray-500">Last 7 Days</span>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* GROUPED / STACKED */}
            <Bar dataKey="tasks" fill="#6366f1" stackId="a" />
            <Bar dataKey="followUps" fill="#22c55e" stackId="a" />
            <Bar dataKey="appointments" fill="#f59e0b" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
