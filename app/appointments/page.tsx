"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, List, Edit2, Trash2 } from "lucide-react";
import CreateAppointmentModal from "@/components/appointments/CreateAppointmentModal";
import AppointmentCalendar from "@/components/appointments/AppointmentCalendar";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";


export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAppointment, setEditAppointment] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"calendar" | "list">("list");

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const u = JSON.parse(raw);
    setUser(u);
    fetchAppointments(u.tenantId);
  }, []);

  /* ================= FETCH ================= */
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

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this appointment?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    fetchAppointments(user.tenantId);
  };

  const getStatusColor = (status: string) => {
  const colors: any = {
    scheduled: "bg-blue-100 text-blue-700",
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-purple-100 text-purple-700",
  };

  return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
};


  if (!user) return null;

  return (
  <div className="flex min-h-screen bg-gray-50">

    {/* SIDEBAR */}
    <Sidebar />

    {/* RIGHT SIDE */}
    <div className="flex-1 ml-56">

      {/* HEADER */}
      <Header />

       <div className="w-full px-8 pt-3 pb-6">


   
      
      {/* View Toggle Buttons */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            view === "list"
              ? "bg-white text-gray-900 shadow-md"
              : "bg-transparent text-gray-600 hover:bg-white/50"
          }`}
        >
          <List className="w-4 h-4" />
          List View
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            view === "calendar"
              ? "bg-white text-gray-900 shadow-md"
              : "bg-transparent text-gray-600 hover:bg-white/50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendar
        </button>
      </div>

      {/* SEARCH + NEW APPOINTMENT */}
<div className="flex items-center gap-4 mb-6">

  {/* SEARCH – FULL WIDTH */}
  <div className="relative flex-1">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search by name or purpose..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        w-full
        pl-12 pr-4 py-3
        bg-white
        border border-gray-200
        rounded-lg
        text-sm
        focus:outline-none
        focus:ring-2 focus:ring-blue-500
      "
    />
  </div>

  {/* NEW APPOINTMENT BUTTON */}
  <button
    onClick={() => {
      setEditAppointment(null);
      setShowModal(true);
    }}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium whitespace-nowrap"
  >
    + New Appointment
  </button>

</div>


      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* LIST VIEW */}
        {view === "list" && (
          <>
            {/* Table Header */}
           <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
  <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">Name</div>
  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase">Date</div>
  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase">Time</div>
  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase">Purpose</div>
  <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase">Status</div>
  <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase">Create By</div>
  <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-right">
    Actions
  </div>
</div>


            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {loading && (
                <div className="px-6 py-12 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
                  <p className="mt-3">Loading appointments...</p>
                </div>
              )}

              {!loading && appointments.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900 mb-1">No appointments found</p>
                  <p className="text-sm text-gray-500">Create your first appointment to get started</p>
                </div>
              )}

              {!loading &&
                appointments.map((a) => (
                 <div key={a.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50">
  <div className="col-span-3 font-medium">{a.customer_name}</div>

  <div className="col-span-2">
    {new Date(a.appointment_date).toLocaleDateString()}
  </div>

  <div className="col-span-2">{a.appointment_time}</div>

  <div className="col-span-2">{a.purpose || "-"}</div>

  <div className="col-span-1">
    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(a.status)}`}>
      {a.status}
    </span>
  </div>

  <div className="col-span-1 text-sm text-gray-700">
    {a.created_by_name}
  </div>

  <div className="col-span-1 flex justify-end gap-2 relative z-10">
  {user.id === a.user_id && (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditAppointment(a);
          setShowModal(true);
        }}
        className="p-1 rounded hover:bg-blue-50"
        title="Edit"
      >
        <Edit2 className="w-4 h-4 text-blue-600" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(a.id);
        }}
        className="p-1 rounded hover:bg-red-50"
        title="Delete"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </>
  )}
</div>

</div>

                ))}
            </div>
          </>
        )}

        {/* CALENDAR VIEW */}
        {view === "calendar" && (
          <div className="p-6">
            <AppointmentCalendar
              appointments={appointments}
              onEventClick={(appointment: any) => {
                setEditAppointment(appointment);
                setShowModal(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateAppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
        appointment={editAppointment}
        onCreated={() => fetchAppointments(user.tenantId)}
      />
    </div>
    </div>
    </div>
  );
}