import { createServerClient } from "@/lib/supabase-server";
import { demo } from "@/lib/demo-data";

export async function POST(request: Request) {
  const { name, where_they_are, freeform } = await request.json();

  if (!name?.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  if (!supabase) {
    // Demo mode: add to in-memory store
    const newPerson = {
      id: `demo-new-${Date.now()}`,
      name: name.trim(),
      aliases: [],
      where_they_are: where_they_are || null,
      first_met_at: new Date().toISOString().split("T")[0],
      last_seen_at: new Date().toISOString(),
      notes_count: freeform ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demo.people.push(newPerson);

    if (freeform) {
      const newNote = {
        id: `demo-note-${Date.now()}`,
        raw_text: freeform,
        structured: null,
        recorded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      demo.notes.push(newNote);
      demo.notePeople.push({ note_id: newNote.id, person_id: newPerson.id });
    }

    return Response.json({ id: newPerson.id });
  }

  const now = new Date().toISOString();

  const { data: person, error } = await supabase
    .from("people")
    .insert({
      name: name.trim(),
      where_they_are: where_they_are || null,
      first_met_at: now.split("T")[0],
      last_seen_at: now,
      notes_count: freeform ? 1 : 0,
    })
    .select()
    .single();

  if (error || !person) {
    return Response.json({ error: "Failed to create person" }, { status: 500 });
  }

  // If there's freeform text, save it as a note
  if (freeform?.trim()) {
    const { data: note } = await supabase
      .from("notes")
      .insert({ raw_text: freeform, recorded_at: now })
      .select()
      .single();

    if (note) {
      await supabase.from("note_people").insert({
        note_id: note.id,
        person_id: person.id,
      });
    }
  }

  return Response.json({ id: person.id });
}
