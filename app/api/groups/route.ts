import { NextResponse } from "next/server";
import { GroupService } from "@/server/service/group.service";

const groupService = new GroupService();

// ============================
// GET /api/groups
// ============================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = Number(searchParams.get("tenantId"));
    const userId = Number(searchParams.get("userId"));

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: "tenantId and userId required" },
        { status: 400 }
      );
    }

    const groups = await groupService.getGroupsForTenant(tenantId, userId);
    return NextResponse.json(groups);
  } catch (error: any) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// ============================
// POST /api/groups  ✅ FIXED
// ============================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tenantId,
      name,
      description,
      createdBy,
      selectedTenantIds, // ✅ NEW
    } = body;

    if (!tenantId || !name || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Create group
    const groupId = await groupService.createGroup(
      tenantId,
      name,
      description || "",
      createdBy
    );

    // 2️⃣ Add creator as member
    await groupService.addAgencyToGroup(groupId, tenantId);

    // 3️⃣ Add selected agencies
    if (Array.isArray(selectedTenantIds)) {
      for (const tid of selectedTenantIds) {
        if (tid !== tenantId) {
          await groupService.addAgencyToGroup(groupId, tid);
        }
      }
    }

    return NextResponse.json({
      groupId,
      message: "Group created successfully",
    });
  } catch (error: any) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create group" },
      { status: 500 }
    );
  }
}

// ============================
// PUT /api/groups
// ============================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { groupId, tenantId, name, description, userId } = body;

    if (!groupId || !tenantId || !name || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isAdmin = await groupService.isGroupAdmin(groupId, userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only group admins can update group" },
        { status: 403 }
      );
    }

    const success = await groupService.updateGroup(
      groupId,
      tenantId,
      name,
      description
    );

    return success
      ? NextResponse.json({ message: "Group updated successfully" })
      : NextResponse.json({ error: "Failed to update group" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update group" },
      { status: 500 }
    );
  }
}

// ============================
// DELETE /api/groups
// ============================
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = Number(searchParams.get("groupId"));
    const tenantId = Number(searchParams.get("tenantId"));
    const userId = Number(searchParams.get("userId"));

    if (!groupId || !tenantId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const isAdmin = await groupService.isGroupAdmin(groupId, userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only group creator can delete this group" },
        { status: 403 }
      );
    }

    const success = await groupService.deleteGroup(groupId, tenantId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete group" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete group" },
      { status: 500 }
    );
  }
}
