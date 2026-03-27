import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { queue?: unknown[] };
  return NextResponse.json({
    ok: true,
    flushed: body.queue?.length ?? 0,
    mode: "stubbed-server-flush",
  });
}
