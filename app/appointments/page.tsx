"use client";

import { useEffect, useState } from "react";
import BackButton from "@/components/BackButton";
import CreateAppointmentModal from "@/components/appointments/CreateAppointmentModal";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState<any>(null); // ✅ EDIT
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  /* ================= LOAD USER + LIST ================= */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const u = JSON.parse(raw);
    setUser(u);
    fetchAppointments(u.tenantId);
  }, []);

  /* ================= FETCH ALL ================= */
  const fetchAppointments = async (tenantId: number) => {
    setLoading(true);
    const res = await fetch(`/api/appointments?tenantId=${tenantId}`);
    const data = await res.json();
    setAppointments(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!user) return;

    if (!search.trim()) {
      fetchAppointments(user.tenantId);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(
        `/api/appointments/search?tenantId=${user.tenantId}&q=${search}`
      );
      const data = await res.json();
      setAppointments(data.results || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, user]);

  if (!user) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* BACK */}
      <BackButton />

      {/* HEADER */}
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Appointments
        </h1>

        <button
          onClick={() => {
            setEditAppointment(null);
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-2 rounded-full text-sm"
        >
          + New Appointment
        </button>
      </div>

      {/* SEARCH */}
      <div className="mt-5">
        <input
          placeholder="Search by name or purpose"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full max-w-sm
            px-4 py-2
            border border-gray-200
            rounded-full
            text-sm
            bg-white
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500
          "
        />
      </div>

      {/* TABLE */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* TABLE HEADER */}
        <div className="grid grid-cols-6 px-6 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">
          <div>Name</div>
          <div>Date</div>
          <div>Time</div>
          <div>Purpose</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* TABLE BODY */}
        {loading && (
          <div className="px-6 py-4 text-sm text-gray-500">
            Loading...
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <div className="px-6 py-4 text-sm text-gray-400">
            No appointments found
          </div>
        )}

        {!loading &&
          appointments.map((a) => (
            <div
              key={a.id}
              className="
                grid grid-cols-6
                px-6 py-4
                text-sm
                text-gray-800
                border-b border-gray-100
                hover:bg-gray-50
              "
            >
              {/* NAME */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold uppercase">
                  {a.customer_name?.[0]}
                </div>
                <span className="font-medium capitalize">
                  {a.customer_name}
                </span>
              </div>

              {/* DATE */}
              <div>
                {new Date(a.appointment_date).toLocaleDateString()}
              </div>

              {/* TIME */}
              <div>{a.appointment_time}</div>

              {/* PURPOSE */}
              <div className="text-gray-600">
                {a.purpose || "-"}
              </div>

              {/* STATUS */}
              <div>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  {a.status}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditAppointment(a);
                    setShowModal(true);
                  }}
                  className="text-indigo-600 text-sm hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={async () => {
                    if (!confirm("Delete this appointment?")) return;
                    await fetch(`/api/appointments/${a.id}`, {
                      method: "DELETE",
                    });
                    fetchAppointments(user.tenantId);
                  }}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL */}
      <CreateAppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
        appointment={editAppointment}   // ✅ EDIT MODE
        onCreated={() => fetchAppointments(user.tenantId)}
      />
    </div>
  );
}
