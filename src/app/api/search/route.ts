import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return Response.json({ people: [], notes: [] });
  }

  const supabase = createServerClient();
  const tsQuery = q.split(/\s+/).join(" & ");

  // Search people
  const { data: people } = await supabase
    .from("people")
    .select("*")
    .or(`name.ilike.%${q}%,where_they_are.ilike.%${q}%`)
    .limit(20);

  // Also search by full-text on gifts to find people with matching gifts
  const { data: matchingGifts } = await supabase
    .from("gifts")
    .select("person_id, text, kind")
    .ilike("text", `%${q}%`)
    .limit(30);

  // Get unique person IDs from gift matches that aren't already in people results
  const existingIds = new Set(people?.map((p) => p.id) || []);
  const giftPersonIds = new Set<string>();
  matchingGifts?.forEach((g) => {
    if (!existingIds.has(g.person_id)) {
      giftPersonIds.add(g.person_id);
    }
  });

  let giftPeople: typeof people = [];
  if (giftPersonIds.size > 0) {
    const { data } = await supabase
      .from("people")
      .select("*")
      .in("id", Array.from(giftPersonIds));
    giftPeople = data || [];
  }

  // Search notes
  const { data: notes } = await supabase
    .from("notes")
    .select("id, raw_text, recorded_at")
    .ilike("raw_text", `%${q}%`)
    .order("recorded_at", { ascending: false })
    .limit(20);

  return Response.json({
    people: [...(people || []), ...(giftPeople || [])],
    gifts: matchingGifts || [],
    notes: notes || [],
  });
}
