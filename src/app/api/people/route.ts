import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const sort = request.nextUrl.searchParams.get("sort") || "recent";

  let query = supabase.from("people").select("*");

  switch (sort) {
    case "recent":
      query = query.order("last_seen_at", { ascending: false, nullsFirst: false });
      break;
    case "unseen":
      query = query.order("last_seen_at", { ascending: true, nullsFirst: true });
      break;
    case "alpha":
      query = query.order("name", { ascending: true });
      break;
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
