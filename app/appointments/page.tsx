"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, List, Edit2, Trash2, Plus } from "lucide-react";
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
      scheduled: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
      confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
      completed: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
    };

    return colors[status?.toLowerCase()] || "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
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

          {/* View Toggle & Search Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            
            {/* View Toggle Buttons */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  view === "list"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  view === "calendar"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-blue-600 hover:text-blue-600"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
            </div>

            {/* Search & New Button */}
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or purpose..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                onClick={() => {
                  setEditAppointment(null);
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Appointment
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* LIST VIEW */}
            {view === "list" && (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-200">
                  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</div>
                  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</div>
                  <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</div>
                  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                    Actions
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {loading && (
                    <div className="px-6 py-16 text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-900 mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading appointments...</p>
                    </div>
                  )}

                  {!loading && appointments.length === 0 && (
                    <div className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">No appointments found</p>
                      <p className="text-sm text-gray-500">Create your first appointment to get started</p>
                    </div>
                  )}

                  {!loading &&
                    appointments.map((a) => (
                      <div key={a.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="col-span-2 font-medium text-gray-900">{a.customer_name}</div>

                        <div className="col-span-2 text-sm text-gray-600">
                          {new Date(a.appointment_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </div>

                        <div className="col-span-1 text-sm text-gray-600">{a.appointment_time}</div>

                        <div className="col-span-3 text-sm text-gray-600">{a.purpose || "—"}</div>

                        <div className="col-span-1">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(a.status)}`}>
                            {a.status}
                          </span>
                        </div>

                        <div className="col-span-2 text-sm text-gray-600">
                          {a.created_by_name}
                        </div>

                        <div className="col-span-1 flex justify-end gap-1">
                          {user.id === a.user_id && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditAppointment(a);
                                  setShowModal(true);
                                }}
                                className="p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(a.id);
                                }}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
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