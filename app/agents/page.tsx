// app/agents/page.tsx

export default function AgentsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f5f5]">
      <div className="max-w-5xl mx-auto py-12 px-4">
        {/* Title + small description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Agents & <span className="text-[#c89a3b]">Teams</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl">
            RealEstateCRM is built for real estate agencies that work with
            multiple agents and teams. Create users under your agency, assign
            roles, and track buyers, sellers and deals in one shared workspace.
          </p>
        </div>

        {/* 3 cards explaining features */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
              Team Management
            </p>
            <h2 className="font-semibold mb-2 text-sm">
              Add agents under your agency
            </h2>
            <p className="text-xs text-gray-500">
              Create logins for every agent with their own email and password.
              Keep all buyer and seller activity linked to your agency.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
              Roles & Access
            </p>
            <h2 className="font-semibold mb-2 text-sm">
              Admin vs Agent roles
            </h2>
            <p className="text-xs text-gray-500">
              Use admin accounts to manage the agency and invite new users. Use
              agent accounts to work on buyers, sellers and leads.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
              Collaboration
            </p>
            <h2 className="font-semibold mb-2 text-sm">
              Work together on deals
            </h2>
            <p className="text-xs text-gray-500">
              In future modules you&apos;ll be able to create groups, share
              leads between agencies and track joint closings.
            </p>
          </div>
        </div>

        {/* Small CTA section */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold mb-1">
              Ready to add your first agent?
            </h2>
            <p className="text-xs text-gray-500 max-w-md">
              From the dashboard menu, go to <b>Users / Team</b> to view your
              team and use <b>Add User / Agent</b> to invite more members under
              your tenant.
            </p>
          </div>
          <a
            href="/users"
            className="bg-[#c89a3b] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#b4882f] transition"
          >
            Go to Users / Team
          </a>
        </div>
      </div>
    </div>
  );
}
