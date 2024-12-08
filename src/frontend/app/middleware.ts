import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.endsWith(".mid") || pathname.endsWith(".midi")) {
    return new Response(null, {
      headers: {
        "Content-Type": "audio/midi",
      },
    });
  }

  return NextResponse.next();
}
