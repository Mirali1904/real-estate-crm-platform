"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ActivityBarChart from "@/components/dashboard/ActivityBarChart";
import AnalyticsScatterChart from "@/components/dashboard/AnalyticsScatterChart";


export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [reports, setReports] = useState<any[]>([]);


  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    setUser(user);

    Promise.all([
      fetch(
        `/api/buyers/list?tenantId=${user.tenantId}&userId=${user.id}`
      ).then((r) => r.json()),

      fetch(
        `/api/sellers/list?tenantId=${user.tenantId}&userId=${user.id}`
      ).then((r) => r.json()),

      fetch("/api/groups/accessible", {
        headers: { "x-tenant-id": String(user.tenantId) },
      })
        .then((r) => r.json())
        .catch(() => ({ groups: [] })),
      
      fetch(`/api/appointments/next?tenantId=${user.tenantId}`)
        .then((r) => r.json())
        .catch(() => null),

      fetch(`/api/tasks?tenantId=${user.tenantId}`)
        .then((r) => r.json())
        .catch(() => []),

      // Fetch all appointments for count
      fetch(`/api/appointments?tenantId=${user.tenantId}`)
        .then((r) => r.json())
        .catch(() => []),
    ])
      .then(
        ([buyersRes, sellersRes, groupsRes, appointmentRes, tasksRes, appointmentsRes]) => {
          setBuyers(Array.isArray(buyersRes) ? buyersRes : []);

          if (sellersRes?.success) {
            setProperties(sellersRes.sellers || []);
          } else if (Array.isArray(sellersRes)) {
            setProperties(sellersRes);
          } else {
            setProperties([]);
          }

          setGroups(Array.isArray(groupsRes?.groups) ? groupsRes.groups : []);
          setNextAppointment(appointmentRes || null);
          setTasks(Array.isArray(tasksRes) ? tasksRes : []);
          setAppointments(Array.isArray(appointmentsRes) ? appointmentsRes : []);

          // ✅ GENERATE REPORTS FROM REAL DATA
const generatedReports = [
  ...buyersRes.slice(0, 2).map((b: any) => ({
    title: `${b.name} added as buyer`,
    subtitle: b.email,
    time: "Recently",
    icon: "👤",
    bgColor: "bg-purple-50",
  })),

  ...(Array.isArray(sellersRes)
    ? sellersRes.slice(0, 1).map((p: any) => ({
        title: "New property listed",
        subtitle: p.location,
        time: "Recently",
        icon: "🏠",
        bgColor: "bg-blue-50",
      }))
    : []),

  ...tasksRes.slice(0, 1).map((t: any) => ({
    title: "Task created",
    subtitle: t.title,
    time: "Recently",
    icon: "✅",
    bgColor: "bg-green-50",
  })),
];

setReports(generatedReports);

          setLoading(false);
        }
      )
      .catch(() => {
        setBuyers([]);
        setProperties([]);
        setGroups([]);
        setNextAppointment(null);
        setTasks([]);
        setAppointments([]);
        setLoading(false);

        
      });
  }, []);

  if (!user || loading) return null;

  const createManualTask = async () => {
    if (!newTaskTitle.trim()) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: user.tenantId,
        title: newTaskTitle,
        dueDate: newTaskDueDate || null,
      }),
    });

    setNewTaskTitle("");
    setNewTaskDueDate("");
    setShowTaskModal(false);

    const res = await fetch(`/api/tasks?tenantId=${user.tenantId}`);
    const data = await res.json();
    setTasks(data);
  };

  const markTaskDone = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: "PUT" });
    const res = await fetch(`/api/tasks?tenantId=${user.tenantId}`);
    const data = await res.json();
    setTasks(data);
  };

  // ✅ SERVER LOAD CALCULATIONS (DERIVED ANALYTICS)
const usageGB = buyers.length * 10 + properties.length * 25;
const spaceGB = 320;
const cpuPercent = Math.min(30 + tasks.length * 5, 95);

const serverBars = [
  buyers.length * 5,
  properties.length * 8,
  tasks.length * 6,
  appointments.length * 7,
  40,
  55,
  cpuPercent,
];


  return (
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">DASHBOARD</h1>
      </div>

      {/* TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Add Task
            </h3>

            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={createManualTask}
                className="bg-indigo-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS ROW - DYNAMIC DATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="CUSTOMERS"
          value={buyers.length}
          subtext="Total Buyers"
          icon="👥"
          color="bg-purple-50"
          onClick={() => router.push("/buyers")}
        />
        <StatCard
          label="PROPERTIES"
          value={properties.length}
          subtext="Listed Properties"
          icon="🏘️"
          color="bg-blue-50"
          onClick={() => router.push("/sellers")}
        />
        <StatCard
          label="GROUPS"
          value={groups.length}
          subtext="Active Groups"
          icon="👥"
          color="bg-yellow-50"
          onClick={() => router.push("/groups")}
        />
        <StatCard
          label="APPOINTMENTS"
          value={appointments.length}
          subtext="Total Scheduled"
          icon="📅"
          color="bg-green-50"
          onClick={() => router.push("/appointments")}
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REPORTS SECTION */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">REPORTS</h3>
            <button 
              onClick={() => router.push("/buyers")}
              className="text-sm text-indigo-600 hover:underline"
            >
              SEE ALL
            </button>
          </div>

         <div className="space-y-4">
  {reports.map((r, i) => (
    <ReportItem
      key={i}
      icon={r.icon}
      title={r.title}
      subtitle={r.subtitle}
      time={r.time}
      bgColor={r.bgColor}
    />
  ))}

  {reports.length === 0 && (
    <div className="text-center py-8 text-gray-400">
      No reports available
    </div>
  )}
</div>

        </div>

        {/* SERVER LOAD */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              SERVER LOAD
            </h3>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              OPTIMAL
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
             <div className="text-2xl font-bold text-gray-900">{usageGB}GB</div>
              <div className="text-xs text-gray-500 mt-1">Usage</div>
            </div>
            <div className="text-center">
             <div className="text-2xl font-bold text-gray-900">{spaceGB}GB</div>
              <div className="text-xs text-gray-500 mt-1">Space</div>
            </div>
            <div className="text-center">
             <div className="text-2xl font-bold text-gray-900">{cpuPercent}%</div>
              <div className="text-xs text-gray-500 mt-1">CPU</div>
            </div>
          </div>

          <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-end px-2 pb-2">
  {serverBars.map((val, i) => (
    <div
      key={i}
      className="flex-1 bg-indigo-500 mx-0.5 rounded-t"
      style={{ height: `${val}%` }}
    />
  ))}
</div>



        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
  <ActivityBarChart />
  <AnalyticsScatterChart />
</div>


      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* PROPERTIES */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              RECENT PROPERTIES
            </h3>
            <button
              onClick={() => router.push("/sellers")}
              className="text-sm text-indigo-600 hover:underline"
            >
              View All
            </button>
          </div>

          {properties.length > 0 && (
           <div className="space-y-4">
  {properties.slice(0, 3).map((p) => (
    <div
      key={p.id}
      className="group flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md transition"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
          🏠
        </div>

        {/* Info */}
        <div>
          <div className="font-semibold text-gray-900 capitalize">
            {p.property_type}
          </div>
          <div className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-md">
            {p.location}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        <div className="text-lg font-bold text-indigo-600">
          ₹{p.price}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Listed recently
        </div>
      </div>
    </div>
  ))}
</div>

          )}

          {properties.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No properties available
            </div>
          )}
        </div>

        {/* TASKS */}
        <div className="bg-white rounded-xl shadow-sm p-6">
  {/* Header */}
  <div className="flex justify-between items-center mb-5">
    <h3 className="text-base font-semibold text-gray-900 tracking-wide">
      TASKS TO DO
    </h3>
    <button
      onClick={() => setShowTaskModal(true)}
      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
    >
      + Add Task
    </button>
  </div>

  {/* Empty State */}
  {tasks.filter((t) => t.status === "pending").length === 0 && (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <span className="text-2xl mb-2">🎉</span>
      <span className="text-sm">You're all caught up!</span>
    </div>
  )}

  {/* Task List */}
  <div className="space-y-3">
    {tasks
      .filter((task) => task.status === "pending")
      .slice(0, 5)
      .map((task) => (
        <div
          key={task.id}
          className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm hover:border-indigo-300 transition"
        >
          {/* Checkbox */}
          <input
            type="checkbox"
            onChange={() => markTaskDone(task.id)}
            className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
          />

          {/* Task Content */}
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {task.title}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Pending task
            </div>
          </div>

          {/* Status Badge */}
          <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
            Pending
          </span>
        </div>
      ))}
  </div>
</div>

      </div>
    </div>
  );
}

/* STAT CARD */
function StatCard({ label, value, subtext, icon, color, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-gray-500 tracking-wide">
          {label}
        </div>
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-lg`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtext}</div>
    </div>
  );
}

/* REPORT ITEM */
function ReportItem({ icon, title, subtitle, time, bgColor }: any) {
  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div
        className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center text-xl flex-shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 mb-1">{title}</div>
        <div className="text-sm text-gray-500 line-clamp-2">{subtitle}</div>
      </div>
      <div className="text-xs text-gray-400 flex-shrink-0">{time}</div>
    </div>
  );
}