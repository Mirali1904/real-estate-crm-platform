import { NextResponse } from "next/server";
import { AppointmentService } from "@/server/service/appointment.service";

const service = new AppointmentService();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = Number(searchParams.get("tenantId"));

  const appointment = await service.getNextAppointment(tenantId);

  return NextResponse.json(appointment);
}
