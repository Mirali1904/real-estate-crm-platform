import { NextResponse } from "next/server";
import { GroupService } from "@/server/service/group.service";

const groupService = new GroupService();

// GET /api/groups/members - Get group members
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = Number(searchParams.get("groupId"));

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId required" },
        { status: 400 }
      );
    }

    const members = await groupService.getGroupMembers(groupId);
    return NextResponse.json(members);
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST /api/groups/members - Add member to group
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupId, userId, role, requesterId } = body;

    if (!groupId || !userId || !requesterId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if requester is admin
    const isAdmin = await groupService.isGroupAdmin(groupId, requesterId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only group admins can add members" },
        { status: 403 }
      );
    }

    const result = await groupService.addMember(
      groupId,
      userId,
      role || "MEMBER"
    );

    return NextResponse.json({
      message: "Member added successfully",
      memberId: result,
    });
  } catch (error: any) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add member" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/members - Remove member from group
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = Number(searchParams.get("groupId"));
    const userId = Number(searchParams.get("userId"));
    const requesterId = Number(searchParams.get("requesterId"));

    if (!groupId || !userId || !requesterId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check if requester is admin OR removing themselves
    const isAdmin = await groupService.isGroupAdmin(groupId, requesterId);
    if (!isAdmin && requesterId !== userId) {
      return NextResponse.json(
        { error: "Only group admins can remove members" },
        { status: 403 }
      );
    }

    const success = await groupService.removeMember(groupId, userId);

    if (success) {
      return NextResponse.json({ message: "Member removed successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}