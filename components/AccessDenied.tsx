"use client";

import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 px-6 pt-20">

      <div className="relative w-full max-w-4xl min-h-[520px] flex items-center">

        
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200
                p-16 text-center w-full min-h-[420px]
                flex flex-col justify-center">

          
          {/* Icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 flex items-center justify-center shadow-inner">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Restricted
          </h1>

          {/* Subtitle */}
          <p className="text-base text-gray-600 max-w-md mx-auto mb-8">
            You don’t have the required permission to access this page.
            Please contact your administrator if you believe this is a mistake.
          </p>

          {/* Divider */}
          <div className="h-px w-full bg-gray-200 mb-8" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-blue-900 text-white text-sm font-semibold
                         hover:bg-blue-800 transition shadow-md"
            >
              Go to Dashboard
            </Link>

            <button
              onClick={() => history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         border border-gray-300 text-gray-700 text-sm font-semibold
                         hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>

        {/* Soft Glow */}
        <div className="absolute -z-10 inset-0 blur-3xl bg-red-100/40 rounded-full" />
      </div>
    </div>
  );
}
