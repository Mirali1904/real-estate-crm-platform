// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center">
      <div className="max-w-6xl mx-auto px-4 md:px-0 py-10 grid md:grid-cols-2 gap-10">
        {/* LEFT */}
        <div className="flex flex-col justify-center space-y-6">
          <p className="uppercase tracking-[0.3em] text-xs text-gray-500">
            Real Estate CRM Platform
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Find your{" "}
            <span className="text-[#c89a3b]">dream deals</span> &
            grow your agency.
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-md">
            Manage buyers, sellers and leads in one place. Collaborate
            with other agencies through groups and close more real estate
            deals faster.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="px-6 py-2.5 rounded-full bg-[#c89a3b] text-white text-sm font-medium hover:bg-[#b4882f] transition"
            >
              Get started now
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-full border border-gray-300 text-sm font-medium hover:border-[#c89a3b] hover:text-[#c89a3b] transition"
            >
              I already have an account
            </Link>
          </div>

          
        </div>

        {/* RIGHT */}
        <div className="relative">
          <div className="rounded-3xl bg-white shadow-xl overflow-hidden p-5 md:p-6 lg:p-8 relative">
            <div className="absolute -left-10 top-10 w-20 h-32 bg-[#c89a3b] rounded-xl hidden md:block" />
            <div className="absolute -right-6 bottom-10 w-16 h-24 bg-gray-900 rounded-xl hidden md:block" />

            <div className="relative z-10 grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden h-32 md:h-40 border border-gray-100">
                  <Image
                    src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&w=600"
                    alt="Modern interior"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden h-24 md:h-28 border border-gray-100">
                  <Image
                    src="https://images.pexels.com/photos/259580/pexels-photo-259580.jpeg?auto=compress&w=600"
                    alt="Kitchen"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div className="rounded-2xl overflow-hidden h-24 md:h-28 border border-gray-100">
                  <Image
                    src="https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&w=600"
                    alt="Bedroom"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="rounded-2xl bg-gray-900 text-white p-4 flex flex-col justify-between h-32 md:h-40">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    Starting from
                  </p>
                  <p className="text-2xl font-bold">$140k</p>
                  <p className="text-xs text-gray-400">
                    Match serious buyers & sellers within minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
              <p>Real-time lead pipeline</p>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="w-2 h-2 rounded-full bg-gray-900" />
                <span className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
