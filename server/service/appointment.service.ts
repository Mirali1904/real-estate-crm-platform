import { conn } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class AppointmentService {

  async createAppointment(data: {
    tenantId: number;
    userId: number;
    customerId: number;
    date: string;
    time: string;
    purpose: string;
  }) {
    const [res] = await conn.query<ResultSetHeader>(
      `
      INSERT INTO appointments
        (tenant_id, user_id, customer_id, appointment_date, appointment_time, purpose, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW())
      `,
      [
        data.tenantId,
        data.userId,
        data.customerId,
        data.date,
        data.time,
        data.purpose,
      ]
    );

    return res.insertId;
  }

  /* =========================
     GET APPOINTMENTS (FIXED)
  ========================= */
async getAppointments(tenantId: number) {
  const [rows]: any = await conn.query(
    `
    SELECT
      a.id,
      a.user_id,                     -- ✅ ADD THIS
      a.customer_id,
      a.appointment_date,
      a.appointment_time,
      a.purpose,
      a.status,
      b.name AS customer_name,
      u.name AS created_by_name      -- ✅ ADD THIS
    FROM appointments a
    INNER JOIN buyers b ON b.id = a.customer_id
    INNER JOIN users u ON u.id = a.user_id   -- ✅ ADD THIS
    WHERE a.tenant_id = ?
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `,
    [tenantId]
  );

  return rows;
}



 async getNextAppointment(tenantId: number) {
    const [rows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.purpose,
        a.status,
        b.name AS customer_name
      FROM appointments a
      INNER JOIN buyers b ON b.id = a.customer_id
      WHERE a.tenant_id = ?
        AND a.status = 'scheduled'
        AND (
          a.appointment_date > CURDATE()
          OR (
            a.appointment_date = CURDATE()
            AND a.appointment_time >= CURTIME()
          )
        )
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 1
      `,
      [tenantId]
    );

    return rows[0] || null;
  }
  async deleteAppointment(id: number) {
  const [result]: any = await conn.query(
    `DELETE FROM appointments WHERE id = ?`,
    [id]
  );

  return result.affectedRows; // 🔥 VERY IMPORTANT
}
async updateAppointment(
  id: number,
  data: {
    customerId: number;
    date: string;
    time: string;
    purpose?: string;
    status: string;
  }
) {
  await conn.query(
    `
    UPDATE appointments
    SET
      customer_id = ?,
      appointment_date = ?,
      appointment_time = ?,
      purpose = ?,
      status = ?
    WHERE id = ?
    `,
    [
      data.customerId,
      data.date,
      data.time,
      data.purpose || null,
      data.status,
      id,
    ]
  );
}
}
