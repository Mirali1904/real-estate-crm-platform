"use client";

import { useEffect, useState } from "react";

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  user,
  onCreated,
  appointment,
}: any) {
  const isEdit = Boolean(appointment);

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    date: "",
    time: "",
    purpose: "",
    status: "scheduled",
  });

  /* ================= PREFILL (EDIT) ================= */
  useEffect(() => {
    if (appointment) {
      setForm({
        customerId: appointment.customer_id?.toString() || "",
        date: appointment.appointment_date
          ? appointment.appointment_date.split("T")[0]
          : "",
        time: appointment.appointment_time || "",
        purpose: appointment.purpose || "",
        status: appointment.status || "scheduled",
      });
    }
  }, [appointment]);

  /* ================= LOAD CUSTOMERS ================= */
  useEffect(() => {
    if (!isOpen || !user?.tenantId) return;

    fetch(`/api/buyers/tenant/${user.tenantId}`)
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]));
  }, [isOpen, user]);

  if (!isOpen) return null;

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!form.customerId || !form.date || !form.time) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    const url = isEdit
      ? `/api/appointments/${appointment.id}`
      : "/api/appointments";

    const method = isEdit ? "PUT" : "POST";

    const body = isEdit
      ? {
          customerId: Number(form.customerId),
          date: form.date,
          time: form.time,
          purpose: form.purpose,
          status: form.status,
        }
      : {
          tenantId: user.tenantId,
          userId: user.id,
          customerId: Number(form.customerId),
          date: form.date,
          time: form.time,
          purpose: form.purpose,
        };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Save failed");
      return;
    }

    onClose();
    onCreated(); // 🔥 REFRESH LIST
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="font-semibold text-lg">
          {isEdit ? "Edit Appointment" : "Create Appointment"}
        </h2>

        <select
          className="w-full border rounded p-2"
          value={form.customerId}
          onChange={(e) =>
            setForm({ ...form, customerId: e.target.value })
          }
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="w-full border rounded p-2"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <input
          type="time"
          className="w-full border rounded p-2"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />

        <textarea
          placeholder="Purpose"
          className="w-full border rounded p-2"
          value={form.purpose}
          onChange={(e) =>
            setForm({ ...form, purpose: e.target.value })
          }
        />

        {isEdit && (
          <select
            className="w-full border rounded p-2"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
