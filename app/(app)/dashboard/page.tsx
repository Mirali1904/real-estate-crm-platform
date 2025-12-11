// app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-xs uppercase text-gray-400 mb-2">Overview</div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Welcome back, <span className="text-[#c89a3b]">mirali</span></h2>
            <div className="text-sm text-gray-500 mt-1">Tenant: Mirali's Dream Home (ID 1)</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">mirali123@gmail.com</div>
            <div className="text-xs text-gray-400 mt-1">ADMIN</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl bg-gray-50 p-6">
            <div className="text-xs uppercase text-gray-400 mb-2">Enquiries</div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-sm text-gray-500 mt-2">New buyer enquiries</div>
          </div>

          <div className="rounded-xl bg-gray-50 p-6">
            <div className="text-xs uppercase text-gray-400 mb-2">Active Leads</div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-sm text-gray-500 mt-2">Leads currently in pipeline</div>
          </div>

          <div className="rounded-xl bg-gray-50 p-6">
            <div className="text-xs uppercase text-gray-400 mb-2">Closings</div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-sm text-gray-500 mt-2">Deals closed this month</div>
          </div>
        </div>

        <div className="mt-6 p-6 bg-white border rounded-xl">
          <h3 className="font-semibold mb-2">Next actions</h3>
          <p className="text-sm text-gray-500">Later we will show your latest enquiries, leads, matches and group activity here.</p>
        </div>
      </section>
    </div>
  );
}
