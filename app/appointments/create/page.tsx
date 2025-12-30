"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAppointmentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    date: "",
    time: "",
    purpose: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("loggedUser") || "{}");

    await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: user.tenantId,
        customer_name: form.customerName,
        appointment_date: form.date,
        appointment_time: form.time,
        purpose: form.purpose,
      }),
    });

    router.push("/dashboard");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-4">Create Appointment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Customer Name"
          className="w-full border p-2 rounded"
          value={form.customerName}
          onChange={(e) =>
            setForm({ ...form, customerName: e.target.value })
          }
          required
        />

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />

        <input
          type="time"
          className="w-full border p-2 rounded"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
        />

        <textarea
          placeholder="Purpose (optional)"
          className="w-full border p-2 rounded"
          value={form.purpose}
          onChange={(e) =>
            setForm({ ...form, purpose: e.target.value })
          }
        />

        <button className="w-full bg-indigo-600 text-white py-2 rounded">
          Save Appointment
        </button>
      </form>
    </div>
  );
}
