import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function GET(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}

export async function POST(req: Request) {
  await destroySession();
  // Redirecionar mesmo em POST para evitar ver JSON no browser
  return NextResponse.redirect(new URL("/", req.url));
}
