// app/contact/page.tsx
"use client";

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f5f5]">
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Contact <span className="text-[#c89a3b]">Us</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-xl">
            This is a demo CRM project. Use this page as a simple contact form
            where agencies could reach out for support or onboarding help.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
          <form
            className="space-y-4 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              alert(
                "This is a demo form. In a real app you would send this to your backend or email."
              );
            }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-600">
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-600">
                Agency / Tenant name
              </label>
              <input
                className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                placeholder="Your real estate agency"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b] min-h-[120px]"
                placeholder="Tell us what you need help with..."
                required
              />
            </div>

            <button
              type="submit"
              className="bg-[#c89a3b] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#b4882f] transition"
            >
              Send message
            </button>
          </form>

         
        </div>
      </div>
    </div>
  );
}
