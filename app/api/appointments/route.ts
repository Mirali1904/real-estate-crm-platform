import { NextResponse } from "next/server";
import { AppointmentService } from "@/server/service/appointment.service";

const service = new AppointmentService();

/* =========================
   GET APPOINTMENTS
========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = Number(searchParams.get("tenantId"));

    if (!tenantId) {
      return NextResponse.json([], { status: 200 });
    }

    const appointments = await service.getAppointments(tenantId);

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("GET appointments error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

/* =========================
   CREATE APPOINTMENT
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      tenantId,
      userId,
      customerId,
      date,
      time,
      purpose,
    } = body;

    if (!tenantId || !userId || !customerId || !date || !time) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const id = await service.createAppointment({
      tenantId,
      userId,
      customerId,
      date,
      time,
      purpose,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("POST appointment error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
