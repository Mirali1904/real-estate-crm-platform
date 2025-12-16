import { NextResponse } from "next/server";
import { GroupService } from "@/server/service/group.service";

const groupService = new GroupService();

// GET /api/groups/posts/responses?postId=1
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = Number(searchParams.get("postId"));

    if (!postId) {
      return NextResponse.json(
        { error: "postId required" },
        { status: 400 }
      );
    }

    const responses = await groupService.getPostResponses(postId);
    return NextResponse.json(responses);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch responses" },
      { status: 500 }
    );
  }
}

// POST /api/groups/posts/responses
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, userId, message } = body;

    if (!postId || !userId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = await groupService.addPostResponse(postId, userId, message);

    return NextResponse.json({
      message: "Response added successfully",
      id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add response" },
      { status: 500 }
    );
  }
}
