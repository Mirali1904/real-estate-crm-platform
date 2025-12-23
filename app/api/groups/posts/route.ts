import { NextResponse } from "next/server";
import { GroupService } from "@/server/service/group.service";

const groupService = new GroupService();

/* ================= GET GROUP POSTS ================= */
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

    const posts = await groupService.getGroupPosts(groupId);
    return NextResponse.json(posts);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/* ================= CREATE GROUP POST ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      groupId,
      userId,
      tenantId,
      postType,      // "buyer" | "seller"
      title,
      description,
      location,
      budget,
      referenceId,   // buyer_id | seller_id
    } = body;

    if (!groupId || !userId || !tenantId || !postType || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ EXACT NAME AS SERVICE FILE
    const isMember = await groupService.isGroupMember(groupId, userId);
    if (!isMember) {
      return NextResponse.json(
        { error: "Only group members can post" },
        { status: 403 }
      );
    }

    const postId = await groupService.createPost(
      groupId,
      userId,
      tenantId,
      {
        postType, // SAME AS SERVICE
        title,
        description,
        location,
        budget: budget ? Number(budget) : undefined,
        referenceId: referenceId ?? undefined,
      }
    );

    return NextResponse.json({
      success: true,
      postId,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
