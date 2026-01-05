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
      postType,
      title,
      description,
      location,
      budget,
      referenceId,
      sellerId,
    } = body;

    if (
  !groupId ||
  !userId ||
  !tenantId ||
  !postType ||
  !title ||
  (postType === "seller" && !sellerId)
) {

      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ❌ MEMBER CHECK REMOVED (you use group_agencies only)

    const postId = await groupService.createPost(
  groupId,
  userId,
  tenantId,
  {
    postType,
    title,
    description,
    location,
    budget: budget ? Number(budget) : undefined,
    sellerId: postType === "seller" ? sellerId : null, // ✅ ADD
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
