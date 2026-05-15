import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { NoteStructured } from "@/lib/database.types";

export async function POST(request: NextRequest) {
  const { note_id, structured } = (await request.json()) as {
    note_id: string;
    structured: NoteStructured;
  };

  if (!note_id || !structured) {
    return Response.json({ error: "Missing note_id or structured data" }, { status: 400 });
  }

  const supabase = createServerClient();
  const now = new Date().toISOString();

  for (const person of structured.people) {
    let personId = person.matched_id;

    if (!personId) {
      // Create new person
      const { data: newPerson, error } = await supabase
        .from("people")
        .insert({
          name: person.name,
          where_they_are: person.where_they_are || null,
          first_met_at: new Date().toISOString().split("T")[0],
          last_seen_at: now,
          notes_count: 1,
        })
        .select()
        .single();

      if (error || !newPerson) {
        console.error("Failed to create person:", error);
        continue;
      }
      personId = newPerson.id;
    } else {
      // Update existing person
      const { data: existing } = await supabase
        .from("people")
        .select("notes_count, where_they_are")
        .eq("id", personId)
        .single();

      const updates: Record<string, unknown> = {
        last_seen_at: now,
        notes_count: (existing?.notes_count || 0) + 1,
      };

      if (person.where_they_are && !existing?.where_they_are) {
        updates.where_they_are = person.where_they_are;
      }

      await supabase.from("people").update(updates).eq("id", personId);
    }

    // Link person to note
    await supabase.from("note_people").insert({
      note_id,
      person_id: personId,
    });

    // Create gifts
    if (person.gifts.length > 0) {
      await supabase.from("gifts").insert(
        person.gifts.map((g) => ({
          person_id: personId!,
          text: g.text,
          kind: g.kind,
          source_note_id: note_id,
        }))
      );
    }

    // Create connections from pointed_to
    if (person.pointed_to && person.pointed_to.length > 0) {
      for (const targetName of person.pointed_to) {
        // Try to find the target person
        const { data: targets } = await supabase
          .from("people")
          .select("id")
          .ilike("name", `%${targetName}%`)
          .limit(1);

        let targetId = targets?.[0]?.id;

        if (!targetId) {
          // Create the target person as a stub
          const { data: newTarget } = await supabase
            .from("people")
            .insert({ name: targetName })
            .select()
            .single();
          targetId = newTarget?.id;
        }

        if (targetId && personId) {
          await supabase.from("connections").insert({
            from_person: personId,
            to_person: targetId,
            reason: `${person.name} pointed toward ${targetName}`,
            source_note_id: note_id,
            status: "suggested",
          });
        }
      }
    }
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const noteId = request.nextUrl.searchParams.get("id");
  if (!noteId) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerClient();
  await supabase.from("notes").delete().eq("id", noteId);

  return Response.json({ ok: true });
}
