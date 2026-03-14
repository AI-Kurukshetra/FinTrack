import { NextResponse } from "next/server";

/**
 * GET /api/health - public health check.
 */
export async function GET() {
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}