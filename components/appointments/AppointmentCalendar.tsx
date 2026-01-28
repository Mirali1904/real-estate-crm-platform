"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function AppointmentCalendar({
  appointments,
  onEventClick,
}: any) {

  /* ================= STATUS COLORS ================= */
  const statusColorMap: any = {
    scheduled: "#2563eb", // blue-600
    completed: "#16a34a", // green-600
    cancelled: "#dc2626", // red-600
  };

  /* ================= EVENTS ================= */
  const events = appointments.map((a: any) => ({
    id: String(a.id),
    title: `${a.customer_name} • ${a.created_by_name}`,

    start: `${a.appointment_date.split("T")[0]}T${a.appointment_time}`,
    backgroundColor: statusColorMap[a.status] || "#2563eb",
    borderColor: statusColorMap[a.status] || "#2563eb",
    textColor: "#ffffff",
    extendedProps: {
      appointment: a,
    },
  }));

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}

        /* ===== HEADER ===== */
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}

        /* ===== INTERACTION ===== */
        eventClick={(info) => {
          const found = appointments.find(
            (a: any) => String(a.id) === info.event.id
          );
          if (found) onEventClick(found);
        }}

        /* ===== UI POLISH ===== */
        dayMaxEventRows={3}
        eventDisplay="block"
        nowIndicator
        selectable

        /* ===== THEME ===== */
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}

        /* ===== CUSTOM STYLES ===== */
        eventClassNames={() =>
          "rounded-lg px-2 py-1 text-xs font-semibold shadow-sm"
        }

        dayHeaderClassNames={() =>
          "text-gray-600 font-semibold uppercase text-xs"
        }

        titleFormat={{ year: "numeric", month: "long" }}
      />
    </div>
  );
}
