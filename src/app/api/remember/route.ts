import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase-server";
import { GIFT_LABELS } from "@/lib/helpers";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const { person_id } = await request.json();

  if (!person_id) {
    return Response.json({ error: "Missing person_id" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Get person details
  const { data: person } = await supabase
    .from("people")
    .select("*")
    .eq("id", person_id)
    .single();

  if (!person) {
    return Response.json({ error: "Person not found" }, { status: 404 });
  }

  // Get gifts
  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("person_id", person_id);

  // Get recent notes
  const { data: notePeople } = await supabase
    .from("note_people")
    .select("note_id")
    .eq("person_id", person_id);

  const noteIds = notePeople?.map((np) => np.note_id) || [];
  let recentNotes: Array<{ raw_text: string; recorded_at: string }> = [];

  if (noteIds.length > 0) {
    const { data: noteData } = await supabase
      .from("notes")
      .select("raw_text, recorded_at")
      .in("id", noteIds)
      .order("recorded_at", { ascending: false })
      .limit(3);
    recentNotes = noteData || [];
  }

  // Build the compact summary
  const giftsByKind: Record<string, string[]> = {};
  (gifts || []).forEach((g) => {
    if (!giftsByKind[g.kind]) giftsByKind[g.kind] = [];
    giftsByKind[g.kind].push(g.text);
  });

  const giftSummary = Object.entries(giftsByKind)
    .map(([kind, texts]) => `${GIFT_LABELS[kind] || kind}: ${texts.join(", ")}`)
    .join("\n");

  const notesSummary = recentNotes
    .map((n) => `[${new Date(n.recorded_at).toLocaleDateString()}] ${n.raw_text}`)
    .join("\n\n");

  const prompt = `Here is what I know about ${person.name}:

${person.where_they_are ? `Where: ${person.where_they_are}` : ""}
${giftSummary ? `\nGifts:\n${giftSummary}` : ""}
${notesSummary ? `\nRecent notes:\n${notesSummary}` : ""}

I am about to have a conversation with them. Give me 2-3 short things to keep in mind, oriented toward listening well (not toward what I should say). Be specific. Skip anything generic. Output as a plain list, no preamble.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return Response.json({ reminders: text });
  } catch (err) {
    console.error("Claude API error:", err);
    return Response.json({ error: "Failed to generate reminders" }, { status: 500 });
  }
}
