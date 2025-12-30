import { NextRequest, NextResponse } from "next/server";
import { AppointmentService } from "@/server/service/appointment.service";

const service = new AppointmentService();

/* ================= UPDATE ================= */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const appointmentId = Number(id);

  if (isNaN(appointmentId)) {
    return NextResponse.json(
      { success: false, error: "Invalid appointment id" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { customerId, date, time, purpose, status } = body;

  await service.updateAppointment(appointmentId, {
    customerId,
    date,
    time,
    purpose,
    status,
  });

  return NextResponse.json({ success: true });
}

/* ================= DELETE ================= */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const appointmentId = Number(id);

  if (isNaN(appointmentId)) {
    return NextResponse.json(
      { success: false, error: "Invalid appointment id" },
      { status: 400 }
    );
  }

  const deleted = await service.deleteAppointment(appointmentId);

  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Appointment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
