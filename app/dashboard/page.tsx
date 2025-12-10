"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


type LoggedUser = {
  id: number;
  tenantId: number;
  role: string;
  name: string;
  email: string;
};

type Tenant = {
  id: number;
  name: string;
  created_at: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // 🔐 Basic auth protection
  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("loggedUser")
        : null;

    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as LoggedUser;
      setUser(parsed);

      // fetch tenant details
      fetch(`/api/tenant/${parsed.tenantId}`)
        .then((res) => res.json())
        .then((data) => {
          setTenant(data.tenant);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error(err);
      localStorage.removeItem("loggedUser");
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) return null; // safety: redirect already happened

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f5f5]">
      <div className="max-w-6xl mx-auto flex py-8 px-4 md:px-0 gap-6">
        {/* SIDEBAR */}
  <aside className="w-56 bg-white rounded-3xl shadow-md p-5 hidden md:flex flex-col justify-between">
  {/* SIDEBAR NAV */}

 

   <nav className="space-y-3 text-sm">
    <p className="text-xs uppercase text-gray-400 tracking-[0.2em] mb-1">
      Menu
    </p>

    <Link href="/users/new">
  <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700">
    Add User / Agent
  </button>
</Link>

<Link href="/users">
      <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700">
        Users / Team
      </button>
    </Link> 

    <Link href="/buyers">
      <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700">
        Buyers
      </button>
    </Link>

    

    <Link href="/sellers">
      <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700">
        Sellers / Properties
      </button>
    </Link>

    <Link href="/leads">
      <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700">
        Leads
      </button>
    </Link>

    <Link href="/groups">
      <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700">
        Groups
      </button>
    </Link>
  </nav>


  {/* LOGOUT */}
  <button
    onClick={handleLogout}
    className="mt-6 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
  >
    Logout
  </button>
</aside>


        {/* MAIN CONTENT */}
        <section className="flex-1">
          {/* TOPBAR inside dashboard */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Overview
              </p>
              <h2 className="text-2xl font-bold">
                Welcome back,{" "}
                <span className="text-[#c89a3b]">{user.name}</span>
              </h2>
              {tenant && (
                <p className="text-xs text-gray-500 mt-1">
                  Tenant:{" "}
                  <span className="font-medium">{tenant.name}</span> (ID{" "}
                  {tenant.id})
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs text-gray-500">
                <p>{user.email}</p>
                <p className="uppercase tracking-[0.2em]">{user.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#c89a3b]/80 flex items-center justify-center text-white text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-3xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 uppercase mb-2 tracking-[0.2em]">
                Enquiries
              </p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500 mt-1">
                New buyer enquiries
              </p>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 uppercase mb-2 tracking-[0.2em]">
                Active Leads
              </p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500 mt-1">
                Leads currently in pipeline
              </p>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 uppercase mb-2 tracking-[0.2em]">
                Closings
              </p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-500 mt-1">
                Deals closed this month
              </p>
            </div>
          </div>

          {/* PLACEHOLDER FOR FUTURE LISTS */}
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Next actions</h3>
            <p className="text-xs text-gray-500">
              Later we will show your latest enquiries, leads, matches and
              group activity here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
