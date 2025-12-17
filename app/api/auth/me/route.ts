import { NextResponse } from "next/server";

/* ==============================================
   GET /api/auth/me
   Returns current user info from request headers
   ============================================== */
export async function GET(req: Request) {
  try {
    // 🔥 CLIENT-SIDE SE BHEJA HUA USER DATA HEADERS MEIN MILEGA
    const userId = req.headers.get("x-user-id");
    const tenantId = req.headers.get("x-tenant-id");
    const email = req.headers.get("x-user-email");
    const role = req.headers.get("x-user-role");

    if (!userId || !tenantId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Use localStorage on client-side"
    });
    
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}