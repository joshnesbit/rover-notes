import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const supabase = createServerClient();
    if (supabase) {
      await supabase.auth.verifyOtp({ token_hash, type: type as "email" });
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
