"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Home, Users2, Calendar, TrendingUp, ArrowUpRight, X, Check, Activity } from "lucide-react";
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
  const [serverLoad, setServerLoad] = useState<any>(null);

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

  useEffect(() => {
    if (!user) return;

    fetch(`/api/dashboard/server-load?tenantId=${user.tenantId}`)
      .then((r) => r.json())
      .then(setServerLoad);
  }, [user]);

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

  const deleteTask = async (id: number) => {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    const res = await fetch(`/api/tasks?tenantId=${user.tenantId}`);
    const data = await res.json();
    setTasks(data);
  };

  const usageGB = serverLoad?.usageGB ?? 0;
  const spaceGB = serverLoad?.spaceGB ?? 500;
  const cpuPercent = serverLoad?.cpuPercent ?? 0;

  const statCards = [
    {
      title: "Total Buyers",
      value: buyers.length,
      subtitle: "Customers",
      change: "+8%",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      lightBg: "bg-blue-50",
      onClick: () => router.push("/buyers"),
    },
    {
      title: "Listed Properties",
      value: properties.length,
      subtitle: "Properties",
      change: "+12%",
      icon: Home,
      gradient: "from-emerald-500 to-teal-500",
      lightBg: "bg-emerald-50",
      onClick: () => router.push("/sellers"),
    },
    {
      title: "Active Groups",
      value: groups.length,
      subtitle: "Groups",
      change: "+5%",
      icon: Users2,
      gradient: "from-purple-500 to-pink-500",
      lightBg: "bg-purple-50",
      onClick: () => router.push("/groups"),
    },
    {
      title: "Total Scheduled",
      value: appointments.length,
      subtitle: "Appointments",
      change: "+15%",
      icon: Calendar,
      gradient: "from-orange-500 to-amber-500",
      lightBg: "bg-orange-50",
      onClick: () => router.push("/appointments"),
    },
  ];

  return (
    <main
  className="
    bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30
    px-2 sm:px-3 md:px-4
    pt-2
    pb-4
    max-w-full
    overflow-x-hidden
  "
>


      
      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-slate-900/60 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-100 transform transition-all">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Add New Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-sm
focus:outline-none focus:border-blue-500 focus:ring-0 transition-all"

              />
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-sm
focus:outline-none focus:border-blue-900 focus:ring-0 transition-all"

              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createManualTask}
                className="px-6 py-3 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">

        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className="group relative bg-white rounded-2xl p-4 sm:p-5 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                 <div className={`${card.lightBg} p-4 rounded-2xl`}>
  <Icon className="w-7 h-7 text-gray-700" />
</div>

                  
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-4xl font-extrabold text-gray-900">{card.value}</h3>
                  <p className="text-gray-600 text-sm font-semibold">{card.title}</p>
                  <p className="text-gray-400 text-xs">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 items-stretch">



        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-md
h-full min-h-[420px]
 border border-gray-100 hover:shadow-2xl transition-all duration-300 border border-gray-100">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Activity Overview</h2>
              <p className="text-gray-500 text-sm">Last 7 Days Performance</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-600">+12%</span>
            </div>
          </div>
          <ActivityBarChart />
        </div>

       <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-md
h-full min-h-[420px]
 border border-gray-100 hover:shadow-2xl transition-all duration-300 border border-gray-100">

          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">User Activity Analytics</h2>
              <p className="text-gray-500 text-sm">Weekly Insights</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <TrendingUp className="w-4 h-4 text-blue-900" />
              <span className="text-sm font-bold text-blue-900">+8%</span>
            </div>
          </div>
          <AnalyticsScatterChart />
        </div>
      </div>

      {/* Recent Properties & Server Load */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 items-stretch">


        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
                <p className="text-gray-500 text-sm mt-1">Latest listings</p>
              </div>
              <button
                onClick={() => router.push("/sellers")}
                className="group flex items-center gap-2 text-blue-900 hover:text-blue-700 text-sm font-bold transition-all bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
              >
                View All
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {properties.length > 0 ? (
              <div className="space-y-4">
                {properties.slice(0, 3).map((p, idx) => (
                  <div
                    key={p.id}
                    className=" group relative
  flex flex-col sm:flex-row
  items-start sm:items-center
  gap-4
  p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-emerald-50/20 border-2 border-gray-100 rounded-2xl hover:border-emerald-300 hover:shadow-xl transition-all duration-300"
                    style={{animationDelay: `${idx * 100}ms`}}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Home className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-bold text-lg mb-1 capitalize">{p.property_type}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{p.location}</p>
                    </div>
                    <div className="sm:text-right text-left w-full sm:w-auto">

                      <p className="text-gray-900 font-extrabold text-xl mb-1">₹{p.price}</p>
                      <p className="text-gray-500 text-xs">Listed recently</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No properties available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-emerald-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Server Load</h2>
                <p className="text-gray-500 text-sm mt-1">System status</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-200 px-4 py-2 rounded-xl shadow-sm">
                OPTIMAL
              </span>
            </div>
          </div>
         <div className="p-4 sm:p-6 space-y-6">

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 text-sm font-bold">Storage Usage</span>
                <span className="text-gray-900 font-extrabold text-lg">{usageGB}GB</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3.5 overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-indigo-200/50"></div>
                <div
                  className="relative h-full bg-gradient-to-r from-blue-900 to-indigo-600 rounded-full transition-all duration-700 shadow-lg"
                  style={{ width: `${Math.min((usageGB / spaceGB) * 100, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 text-sm font-bold">Total Space</span>
                <span className="text-gray-900 font-extrabold text-lg">{spaceGB}GB</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3.5 overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/50 to-teal-200/50"></div>
                <div className="relative h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-700 shadow-lg" style={{ width: "100%" }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 text-sm font-bold">CPU Usage</span>
                <span className="text-gray-900 font-extrabold text-lg">{cpuPercent}%</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3.5 overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-200/50 to-amber-200/50"></div>
                <div
                  className="relative h-full bg-gradient-to-r from-orange-600 to-amber-600 rounded-full transition-all duration-700 shadow-lg"
                  style={{ width: `${cpuPercent}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports & Tasks */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">


        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
                <p className="text-gray-500 text-sm mt-1">Latest activity</p>
              </div>
              <button 
                onClick={() => router.push("/buyers")} 
                className="group flex items-center gap-2 text-blue-900 hover:text-blue-700 text-sm font-bold transition-all bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
              >
                See All
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {reports.map((activity, idx) => {
              const iconConfig: any = {
                user: { icon: <Users className="w-5 h-5 text-white" />, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
                home: { icon: <Home className="w-5 h-5 text-white" />, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
                task: { icon: <Calendar className="w-5 h-5 text-white" />, gradient: "from-purple-500 to-pink-500", bg: "bg-purple-50" },
              };
              const config = iconConfig[activity.icon];
              
              return (
                <div
                  key={idx}
                  className="group flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                    <div className={`relative bg-gradient-to-br ${config.gradient} p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                      {config.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-bold text-sm mb-0.5">{activity.title}</h3>
                    <p className="text-gray-500 text-xs truncate">{activity.subtitle}</p>
                  </div>
                  <span className="text-gray-400 text-xs font-semibold whitespace-nowrap flex-shrink-0 bg-gray-100 px-3 py-1.5 rounded-lg">
                    {activity.time}
                  </span>
                </div>
              );
            })}
            {reports.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No reports available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full min-h-[420px] overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-yellow-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tasks to Do</h2>
                <p className="text-gray-500 text-sm mt-1">Pending items</p>
              </div>
              <button 
                onClick={() => setShowTaskModal(true)} 
                className="text-blue-900 hover:text-blue-700 text-sm font-bold transition-all bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
              >
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
                      className="group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-yellow-50/30 border-2 border-gray-100 rounded-2xl hover:border-yellow-300 hover:shadow-lg transition-all duration-300"
                    >
                      <input
                        type="checkbox"
                        onChange={() => deleteTask(task.id)}
                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-900 cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-bold text-sm mb-0.5">{task.title}</h3>
                        <p className="text-gray-500 text-xs">Pending task</p>
                      </div>
                      <span className="text-xs font-bold text-yellow-700 bg-gradient-to-r from-yellow-100 to-amber-100 px-3 py-1.5 rounded-xl whitespace-nowrap flex-shrink-0 shadow-sm">
                        Pending
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">🎉</span>
                <p className="text-gray-900 font-bold text-lg mb-1">All caught up!</p>
                <p className="text-gray-500 text-sm">No pending tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}