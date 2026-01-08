import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =========================
   DELETE LOAN
========================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const loanId = Number(id);

    if (!loanId || isNaN(loanId)) {
      return NextResponse.json(
        { error: "Invalid loan id" },
        { status: 400 }
      );
    }

    await conn.query(
      "DELETE FROM loans WHERE id = ?",
      [loanId]
    );

    return NextResponse.json({
      success: true,
      message: "Loan deleted successfully",
    });
  } catch (error) {
    console.error("DELETE LOAN ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete loan" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE LOAN (EDIT + STATUS)
========================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const loanId = Number(id);

    if (!loanId || isNaN(loanId)) {
      return NextResponse.json(
        { error: "Invalid loan id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      loan_type,
      bank_name,
      loan_amount,
      interest_rate,
      tenure_years,
      status,
      remarks,
    } = body;

    // 🔥 SAFE DYNAMIC UPDATE
    const updates: string[] = [];
    const values: any[] = [];

    if (loan_type !== undefined) {
      updates.push("loan_type = ?");
      values.push(loan_type);
    }
    if (bank_name !== undefined) {
      updates.push("bank_name = ?");
      values.push(bank_name);
    }
    if (loan_amount !== undefined) {
      updates.push("loan_amount = ?");
      values.push(loan_amount);
    }
    if (interest_rate !== undefined) {
      updates.push("interest_rate = ?");
      values.push(interest_rate);
    }
    if (tenure_years !== undefined) {
      updates.push("tenure_years = ?");
      values.push(tenure_years);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (remarks !== undefined) {
      updates.push("remarks = ?");
      values.push(remarks);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(loanId);

    await conn.query(
      `UPDATE loans SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: "Loan updated successfully",
    });
  } catch (error) {
    console.error("UPDATE LOAN ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update loan" },
      { status: 500 }
    );
  }
}
