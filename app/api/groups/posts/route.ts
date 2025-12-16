import { NextResponse } from "next/server";
import { GroupService } from "@/server/service/group.service";

const groupService = new GroupService();

// GET /api/groups/posts - Get group posts
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
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/groups/posts - Create post in group
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      groupId,
      userId,
      tenantId,
      postType,
      title,
      description,
      location,
      budget,
    } = body;

    if (!groupId || !userId || !tenantId || !postType || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user is member
    const isMember = await groupService.isGroupMember(groupId, userId);
    if (!isMember) {
      return NextResponse.json(
        { error: "Only group members can post" },
        { status: 403 }
      );
    }

    const postId = await groupService.createPost(groupId, userId, tenantId, {
      postType,
      title,
      description,
      location,
      budget: budget ? Number(budget) : undefined,
    });

    return NextResponse.json({
      message: "Post created successfully",
      postId,
    });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}