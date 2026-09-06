import { NextRequest, NextResponse } from "next/server";
import { readAndMaybeConsume } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const paste = readAndMaybeConsume(id);

  if (!paste) {
    return NextResponse.json(
      { error: "This slip has expired or was already read." },
      { status: 404 }
    );
  }

  return new NextResponse(paste.content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
