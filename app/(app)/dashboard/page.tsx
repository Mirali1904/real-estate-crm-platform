"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Home, Users2, Calendar, TrendingUp, ArrowUpRight } from "lucide-react";
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
      fetch(`/api/buyers/list?tenantId=${user.tenantId}&userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/sellers/list?tenantId=${user.tenantId}&userId=${user.id}`).then((r) => r.json()),
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
      fetch(`/api/appointments?tenantId=${user.tenantId}`)
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([buyersRes, sellersRes, groupsRes, appointmentRes, tasksRes, appointmentsRes]) => {
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

      const generatedReports = [
        ...buyersRes.slice(0, 2).map((b: any) => ({
          title: `${b.name} added as buyer`,
          subtitle: b.email,
          time: "Recently",
          icon: "user",
        })),
        ...(Array.isArray(sellersRes)
          ? sellersRes.slice(0, 1).map((p: any) => ({
              title: "New property listed",
              subtitle: p.location,
              time: "Recently",
              icon: "home",
            }))
          : []),
        ...tasksRes.slice(0, 1).map((t: any) => ({
          title: "Task created",
          subtitle: t.title,
          time: "Recently",
          icon: "task",
        })),
      ];

      setReports(generatedReports);
      setLoading(false);
    }).catch(() => {
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

  const usageGB = buyers.length * 10 + properties.length * 25;
  const spaceGB = 320;
  const cpuPercent = Math.min(30 + tasks.length * 5, 95);

  const statCards = [
    {
      title: "Total Buyers",
      value: buyers.length,
      subtitle: "Customers",
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      onClick: () => router.push("/buyers"),
    },
    {
      title: "Listed Properties",
      value: properties.length,
      subtitle: "Properties",
      icon: Home,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      onClick: () => router.push("/sellers"),
    },
    {
      title: "Active Groups",
      value: groups.length,
      subtitle: "Groups",
      icon: Users2,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      onClick: () => router.push("/groups"),
    },
    {
      title: "Total Scheduled",
      value: appointments.length,
      subtitle: "Appointments",
      icon: Calendar,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      onClick: () => router.push("/appointments"),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-6 pt-3 pb-6 md:px-8 md:pt-4 md:pb-8">

      

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Add Task</h3>
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-sm text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={createManualTask}
                className="bg-blue-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${card.bgColor} p-4 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">{card.value}</h3>
                <p className="text-slate-600 text-sm font-medium">{card.title}</p>
                <p className="text-slate-500 text-xs mt-2">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Activity Overview</h2>
                <p className="text-slate-500 text-sm">Last 7 Days</p>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+12%</span>
              </div>
            </div>
          </div>
          <ActivityBarChart />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">User Activity Analytics</h2>
                <p className="text-slate-500 text-sm">Last Week</p>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-semibold">+8%</span>
              </div>
            </div>
          </div>
          <AnalyticsScatterChart />
        </div>
      </div>

      {/* Recent Properties & Server Load */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent Properties</h2>
              <button
                onClick={() => router.push("/sellers")}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="p-6">
            {properties.length > 0 ? (
              <div className="space-y-4">
                {properties.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="group bg-gradient-to-br from-slate-50 to-white hover:from-blue-50 hover:to-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg p-5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                        <Home className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-900 font-semibold mb-1 capitalize">{p.property_type}</h3>
                        <p className="text-slate-600 text-sm line-clamp-2">{p.location}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-900 font-bold text-lg">₹{p.price}</p>
                        <p className="text-slate-500 text-xs">Listed recently</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">No properties available</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Server Load</h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">OPTIMAL</span>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 text-sm font-semibold">Usage</span>
                <span className="text-slate-900 font-bold">{usageGB}GB</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((usageGB / spaceGB) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 text-sm font-semibold">Space</span>
                <span className="text-slate-900 font-bold">{spaceGB}GB</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all duration-500" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 text-sm font-semibold">CPU</span>
                <span className="text-slate-900 font-bold">{cpuPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${cpuPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Reports</h2>
              <button onClick={() => router.push("/buyers")} className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors">
                See All →
              </button>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {reports.map((activity, idx) => {
              const iconMap: any = {
                user: <Users className="w-5 h-5 text-blue-600" />,
                home: <Home className="w-5 h-5 text-blue-600" />,
                task: <Calendar className="w-5 h-5 text-blue-600" />,
              };
              return (
                <div
                  key={idx}
                  className="group bg-gradient-to-br from-slate-50 to-white hover:from-blue-50 hover:to-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2.5 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                      {iconMap[activity.icon]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 font-semibold text-sm">{activity.title}</h3>
                      <p className="text-slate-600 text-xs truncate">{activity.subtitle}</p>
                    </div>
                    <span className="text-slate-500 text-xs whitespace-nowrap flex-shrink-0">{activity.time}</span>
                  </div>
                </div>
              );
            })}
            {reports.length === 0 && <div className="text-center py-8 text-slate-400">No reports available</div>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Tasks to Do</h2>
              <button onClick={() => setShowTaskModal(true)} className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors">
                + Add
              </button>
            </div>
          </div>
          <div className="p-6">
            {tasks.filter((t) => t.status === "pending").length > 0 ? (
              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === "pending")
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="group bg-gradient-to-br from-slate-50 to-white hover:from-yellow-50 hover:to-slate-50 border border-slate-200 hover:border-yellow-300 rounded-lg p-4 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          onChange={() => markTaskDone(task.id)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-slate-900 font-semibold text-sm">{task.title}</h3>
                          <p className="text-slate-600 text-xs">Pending task</p>
                        </div>
                        <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <span className="text-2xl mb-2 block">🎉</span>
                <span className="text-sm">You're all caught up!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}