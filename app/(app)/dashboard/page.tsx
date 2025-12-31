"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]); // ✅ ADDED
  const [loading, setLoading] = useState(true);
  // ✅ ADD TASK (ONLY THIS)
const [showTaskModal, setShowTaskModal] = useState(false);
const [newTaskTitle, setNewTaskTitle] = useState("");
const [newTaskDueDate, setNewTaskDueDate] = useState("");


  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    setUser(user);

    Promise.all([
     fetch(
  `/api/buyers/list?tenantId=${user.tenantId}&userId=${user.id}`
).then((r) => r.json()),

      fetch(`/api/sellers/tenant/${user.tenantId}`).then((r) => r.json()),
      fetch("/api/groups/accessible", {
        headers: { "x-tenant-id": String(user.tenantId) },
      })
        .then((r) => r.json())
        .catch(() => ({ groups: [] })),
      fetch(`/api/appointments/next?tenantId=${user.tenantId}`)
        .then((r) => r.json())
        .catch(() => null),

      // ✅ TASKS FETCH
      fetch(`/api/tasks?tenantId=${user.tenantId}`)
        .then((r) => r.json())
        .catch(() => []),
    ])
      .then(
        ([
          buyersRes,
          sellersRes,
          groupsRes,
          appointmentRes,
          tasksRes,
        ]) => {
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
          setTasks(Array.isArray(tasksRes) ? tasksRes : []); // ✅
          setLoading(false);
        }
      )
      .catch(() => {
        setBuyers([]);
        setProperties([]);
        setGroups([]);
        setNextAppointment(null);
        setTasks([]);
        setLoading(false);
      });
  }, []);

  if (!user || loading) return null;

  // ✅ CREATE MANUAL TASK
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


  // ✅ MARK TASK DONE
  const markTaskDone = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: "PUT" });
    const res = await fetch(`/api/tasks?tenantId=${user.tenantId}`);
    const data = await res.json();
    setTasks(data);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {user.name}
        </p>
      </div>
          {showTaskModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-sm p-6">
          <h3 className="font-semibold mb-4">Add Task</h3>

          <input
            type="text"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm mb-3"
          />

          <input
            type="date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm mb-4"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowTaskModal(false)}
              className="text-sm text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={createManualTask}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md"
            >
              Save Task
            </button>
          </div>
        </div>
      </div>
    )}


      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat
          label="Customers"
          value={buyers.length}
          onClick={() => router.push("/buyers")}
        />
        <Stat
          label="Properties"
          value={properties.length}
          onClick={() => router.push("/sellers")}
        />
        <Stat
          label="Groups"
          value={groups.length}
          onClick={() => router.push("/groups")}
        />

        {/* CUSTOMERS MINI LIST */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Customers</h3>
            <span
              className="text-sm text-indigo-600 cursor-pointer"
              onClick={() => router.push("/buyers")}
            >
              View All
            </span>
          </div>

          <div className="space-y-4">
            {buyers.slice(0, 2).map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                  {b.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.email}</div>
                </div>
              </div>
            ))}
          </div>  
        </div>
      </div>

      {/* APPOINTMENT + RECENT BUYERS */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* NEXT APPOINTMENT — UNCHANGED */}
        <div
          onClick={() => router.push("/appointments")}
          className="bg-indigo-600 text-white rounded-xl shadow-sm p-5 cursor-pointer hover:opacity-95 transition"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-indigo-100">
              Next Appointment
            </h3>
            <span className="h-2 w-2 rounded-full bg-indigo-300"></span>
          </div>

          {!nextAppointment && (
            <div className="mt-6 text-sm text-indigo-100">
              No upcoming appointments
            </div>
          )}

          {nextAppointment && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold uppercase">
                  {nextAppointment.customer_name?.[0]}
                </div>
                <div>
                  <div className="font-medium capitalize">
                    {nextAppointment.customer_name}
                  </div>
                  <div className="text-xs text-indigo-100">
                    Upcoming meeting
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-indigo-100">
                <span>📅</span>
                <span>
                  {new Date(
                    nextAppointment.appointment_date
                  ).toLocaleDateString()}
                  {" • "}
                  {nextAppointment.appointment_time}
                </span>
              </div>

              {nextAppointment.purpose && (
                <div className="text-sm text-indigo-100 line-clamp-2">
                  {nextAppointment.purpose}
                </div>
              )}

              <div className="pt-2 text-xs text-indigo-100 opacity-90">
                Click to view all appointments →
              </div>
            </div>
          )}
        </div>

        {/* RECENT BUYERS — UNCHANGED */}
       {/* RECENT BUYERS */}
<div className="xl:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
  <div className="flex justify-between mb-4">
    <h3 className="font-semibold">Recent Buyers</h3>
    <span
      className="text-sm text-indigo-600 cursor-pointer"
      onClick={() => router.push("/buyers")}
    >
      View All
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {buyers.slice(0, 2).map((b) => (
      <div
        key={b.id}
        className="border rounded-xl p-4 hover:shadow-sm transition"
      >
        <div className="font-medium">{b.name}</div>
        <div className="text-sm text-gray-500">{b.email}</div>

        {b.phone && (
          <div className="text-sm text-gray-600 mt-2">
            📞 {b.phone}
          </div>
        )}
      </div>
    ))}
  </div>
</div>

      </div>

      {/* PROPERTIES + TASKS */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Recent Properties</h3>
            <span
              className="text-sm text-indigo-600 cursor-pointer"
              onClick={() => router.push("/sellers")}
            >
              View All
            </span>
          </div>

          {properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.slice(0, 4).map((p) => (
                <div key={p.id} className="border rounded-xl p-4">
                  <div className="font-medium">{p.property_type}</div>
                  <div className="text-sm text-gray-500">{p.location}</div>
                  <div className="mt-2 font-semibold">₹{p.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ TASKS TO DO — IMPLEMENTED */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
         <div className="flex justify-between items-center mb-4">
  <h3 className="font-semibold">Tasks To Do</h3>
  <button
    onClick={() => setShowTaskModal(true)}
    className="text-sm text-indigo-600 hover:underline"
  >
    + Add Task
  </button>
</div>


          {tasks.length === 0 && (
            <div className="text-sm text-gray-400">
              🎉 You're all caught up!
            </div>
          )}

          <div className="space-y-3">
            {tasks
  .filter((task) => task.status === "pending")
  .slice(0, 5)
  .map((task) => (
    <div key={task.id} className="flex items-center gap-3">
      <input
        type="checkbox"
        defaultChecked={task.status === "done"}
        onClick={() => markTaskDone(task.id)}
      />
      <div className="text-sm">
        {task.title}
      </div>
    </div>
  ))}

          </div>
        </div>
      </div>
    </div>
  );
}

/* STAT CARD */
function Stat({ label, value, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}
