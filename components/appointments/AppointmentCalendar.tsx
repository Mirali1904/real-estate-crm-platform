"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function AppointmentCalendar({
  appointments,
  onEventClick,
}: any) {
 const statusColorMap: any = {
  scheduled: "#4f46e5", // indigo
  completed: "#16a34a", // green
  cancelled: "#dc2626", // red
};

const events = appointments.map((a: any) => ({
  id: String(a.id),
  title: a.customer_name,
  start: `${a.appointment_date.split("T")[0]}T${a.appointment_time}`,
  backgroundColor: statusColorMap[a.status] || "#4f46e5",
  borderColor: statusColorMap[a.status] || "#4f46e5",
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
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        eventClick={(info) => {
          const found = appointments.find(
            (a: any) => String(a.id) === info.event.id
          );
          if (found) onEventClick(found);
        }}
        dayMaxEventRows={3}
        eventDisplay="block"
        nowIndicator
      />
    </div>
  );
}
