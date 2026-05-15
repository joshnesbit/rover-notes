import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  // Get person
  const { data: person, error } = await supabase
    .from("people")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !person) {
    return Response.json({ error: "Person not found" }, { status: 404 });
  }

  // Get gifts
  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("person_id", id)
    .order("created_at", { ascending: false });

  // Get connections (both directions)
  const { data: connectionsFrom } = await supabase
    .from("connections")
    .select("*")
    .eq("from_person", id);

  const { data: connectionsTo } = await supabase
    .from("connections")
    .select("*")
    .eq("to_person", id);

  // Resolve names for connections
  const connectionPersonIds = new Set<string>();
  connectionsFrom?.forEach((c) => connectionPersonIds.add(c.to_person));
  connectionsTo?.forEach((c) => connectionPersonIds.add(c.from_person));

  const { data: connectionPeople } = await supabase
    .from("people")
    .select("id, name")
    .in("id", Array.from(connectionPersonIds));

  const nameMap = new Map(connectionPeople?.map((p) => [p.id, p.name]) || []);

  // Get notes for this person
  const { data: notePeople } = await supabase
    .from("note_people")
    .select("note_id")
    .eq("person_id", id);

  const noteIds = notePeople?.map((np) => np.note_id) || [];
  let notes: Array<{ id: string; raw_text: string; recorded_at: string; created_at: string }> = [];

  if (noteIds.length > 0) {
    const { data: noteData } = await supabase
      .from("notes")
      .select("id, raw_text, recorded_at, created_at")
      .in("id", noteIds)
      .order("recorded_at", { ascending: false });
    notes = noteData || [];
  }

  return Response.json({
    ...person,
    gifts: gifts || [],
    connections_from: (connectionsFrom || []).map((c) => ({
      ...c,
      to_person_name: nameMap.get(c.to_person),
    })),
    connections_to: (connectionsTo || []).map((c) => ({
      ...c,
      from_person_name: nameMap.get(c.from_person),
    })),
    notes,
  });
}
