import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase-server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are helping a roving listener track their conversations with neighbors. The listener is in the tradition of De'Amon Harges: listening for gifts, passions, and dreams (not needs).

When you parse a note, categorize gifts as:
- head: knowledge a person carries (history, languages, who lives where)
- heart: a passion or love (children, music, growing things)
- hand: a practical skill (carpentry, cooking, mechanics)
- teachable: something they are willing to teach others
- dream: an aspiration or wish

A single statement can produce multiple gifts. "Marcus used to teach woodworking and misses it" produces a hand gift (woodworking skill), a teachable (would teach woodworking), and a heart (loves teaching).

Match people against the provided list when you can; only mark a person as new if no plausible match exists. Be conservative about creating new people from passing mentions.

Do not infer needs or problems. Only extract what was actually heard.`;

const TOOL_SCHEMA = {
  name: "record_note_extraction",
  description: "Extract people, gifts, and connections from a roving listener's note.",
  input_schema: {
    type: "object" as const,
    properties: {
      people: {
        type: "array",
        items: {
          type: "object",
          properties: {
            matched_id: {
              type: ["string", "null"],
              description: "ID from the provided people list if this is an existing person, null if new",
            },
            name: { type: "string" },
            where_they_are: { type: ["string", "null"] },
            gifts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  kind: {
                    type: "string",
                    enum: ["head", "heart", "hand", "teachable", "dream"],
                  },
                },
                required: ["text", "kind"],
              },
            },
            pointed_to: {
              type: "array",
              items: { type: "string" },
              description: "Names of other people this person mentioned",
            },
          },
          required: ["name", "gifts"],
        },
      },
      follow_ups: {
        type: "array",
        items: { type: "string" },
        description: "Things the listener said they would do (e.g. 'introduce Marcus to Lila')",
      },
    },
    required: ["people"],
  },
};

export async function POST(request: Request) {
  const { raw_text } = await request.json();

  if (!raw_text?.trim()) {
    return Response.json({ error: "No text provided" }, { status: 400 });
  }

  const supabase = createServerClient();
  if (!supabase) return Response.json({ error: "Not configured" }, { status: 503 });

  // Save the raw note first
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .insert({ raw_text, recorded_at: new Date().toISOString() })
    .select()
    .single();

  if (noteError || !note) {
    return Response.json({ error: "Failed to save note" }, { status: 500 });
  }

  // Get existing people for matching
  const { data: existingPeople } = await supabase
    .from("people")
    .select("id, name, aliases");

  const peopleContext = (existingPeople || []).map((p) => ({
    id: p.id,
    name: p.name,
    aliases: p.aliases,
  }));

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [TOOL_SCHEMA],
      tool_choice: { type: "tool", name: "record_note_extraction" },
      messages: [
        {
          role: "user",
          content: `Existing people in my notebook:\n${JSON.stringify(peopleContext)}\n\nNew note:\n${raw_text}`,
        },
      ],
    });

    // Extract the tool use result
    const toolUse = message.content.find((block) => block.type === "tool_use");
    const structured = toolUse ? toolUse.input : { people: [], follow_ups: [] };

    // Update the note with structured data
    await supabase
      .from("notes")
      .update({ structured })
      .eq("id", note.id);

    return Response.json({ note_id: note.id, structured });
  } catch (err) {
    console.error("Claude API error:", err);
    return Response.json(
      { note_id: note.id, structured: null, error: "Failed to parse note" },
      { status: 200 }
    );
  }
}
