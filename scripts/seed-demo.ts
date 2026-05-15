/**
 * Seed script for Rover Notes demo data.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateStr(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().split("T")[0];
}

async function seed() {
  console.log("Seeding demo data...\n");

  // --- People ---
  const marcus = { id: randomUUID(), name: "Marcus Williams", aliases: ["Marcus"], where_they_are: "30th and Judah, yellow house on the corner", first_met_at: dateStr(120), last_seen_at: daysAgo(3), notes_count: 3 };
  const lila = { id: randomUUID(), name: "Lila Chen", aliases: ["Lila"], where_they_are: "runs the community garden on 31st", first_met_at: dateStr(90), last_seen_at: daysAgo(8), notes_count: 2 };
  const sam = { id: randomUUID(), name: "Sam Torres", aliases: ["Sam", "Sammy"], where_they_are: "above the bodega on Noriega", first_met_at: dateStr(60), last_seen_at: daysAgo(21), notes_count: 2 };
  const dorothy = { id: randomUUID(), name: "Dorothy Washington", aliases: ["Dorothy", "Miss Dorothy"], where_they_are: "been on the block since 1978", first_met_at: dateStr(180), last_seen_at: daysAgo(14), notes_count: 2 };
  const raj = { id: randomUUID(), name: "Raj Patel", aliases: ["Raj"], where_they_are: "owns the corner store on Irving", first_met_at: dateStr(45), last_seen_at: daysAgo(1), notes_count: 1 };
  const maria = { id: randomUUID(), name: "Maria Santos", aliases: ["Maria"], where_they_are: "three doors down from Marcus", first_met_at: dateStr(30), last_seen_at: daysAgo(5), notes_count: 1 };
  const james = { id: randomUUID(), name: "James O'Brien", aliases: ["James", "Jim"], where_they_are: "the blue duplex, ground floor", first_met_at: dateStr(75), last_seen_at: daysAgo(42), notes_count: 1 };

  const people = [marcus, lila, sam, dorothy, raj, maria, james];
  const { error: pErr } = await supabase.from("people").insert(people);
  if (pErr) { console.error("People insert failed:", pErr); return; }
  console.log(`  ${people.length} neighbors added`);

  // --- Notes ---
  const note1 = {
    id: randomUUID(),
    raw_text: "Ran into Marcus at the corner store today. He was buying soil for his backyard. Turns out he used to teach woodworking at the high school before he retired — misses it a lot. Said his kid just left for college and the house feels quiet. He mentioned Lila at the garden might need help building raised beds. I should introduce them.",
    structured: {
      people: [
        { matched_id: marcus.id, name: "Marcus Williams", gifts: [
          { text: "used to teach woodworking at the high school", kind: "hand" },
          { text: "would teach woodworking again", kind: "teachable" },
          { text: "loves teaching, misses it since retirement", kind: "heart" },
        ], pointed_to: ["Lila"] },
      ],
      follow_ups: ["Introduce Marcus to Lila about building raised beds"],
    },
    recorded_at: daysAgo(3),
  };

  const note2 = {
    id: randomUUID(),
    raw_text: "Spent time at the community garden with Lila. She's been running it for four years now, mostly by herself. Grows tomatoes, squash, herbs. She dreams of turning the empty lot next door into a kids' garden where neighborhood children can learn to grow food. She knows everything about who lives on every block between 28th and 33rd.",
    structured: {
      people: [
        { matched_id: lila.id, name: "Lila Chen", gifts: [
          { text: "runs the community garden, four years", kind: "hand" },
          { text: "grows tomatoes, squash, herbs", kind: "hand" },
          { text: "loves growing things and being in the garden", kind: "heart" },
          { text: "knows who lives on every block from 28th to 33rd", kind: "head" },
          { text: "dreams of a kids' garden on the empty lot next door", kind: "dream" },
        ] },
      ],
    },
    recorded_at: daysAgo(8),
  };

  const note3 = {
    id: randomUUID(),
    raw_text: "Sam came by the garden while I was talking to Lila. He's 17, quiet but sharp. He's been teaching himself guitar from YouTube and wants to play at the block party this summer. His mom works nights so he's on his own a lot. Lila said she'd love to have him help out at the garden — he seemed interested.",
    structured: {
      people: [
        { matched_id: sam.id, name: "Sam Torres", gifts: [
          { text: "teaching himself guitar from YouTube", kind: "hand" },
          { text: "wants to play guitar at the block party", kind: "dream" },
          { text: "quiet but sharp, self-directed learner", kind: "head" },
        ] },
        { matched_id: lila.id, name: "Lila Chen", gifts: [], pointed_to: ["Sam"] },
      ],
    },
    recorded_at: daysAgo(21),
  };

  const note4 = {
    id: randomUUID(),
    raw_text: "Miss Dorothy flagged me down from her porch. She wanted to tell me about the pecan pie she used to make for the church bake sale — her grandmother's recipe from Alabama. She said she'd teach anyone who wanted to learn. She also told me stories about what this block was like in the 1980s, who lived where, which houses burned down and got rebuilt. Living history.",
    structured: {
      people: [
        { matched_id: dorothy.id, name: "Dorothy Washington", gifts: [
          { text: "makes pecan pie from her grandmother's Alabama recipe", kind: "hand" },
          { text: "would teach anyone to bake her pecan pie", kind: "teachable" },
          { text: "living history of the block since 1978", kind: "head" },
          { text: "loves telling stories about the neighborhood", kind: "heart" },
        ] },
      ],
    },
    recorded_at: daysAgo(14),
  };

  const note5 = {
    id: randomUUID(),
    raw_text: "Stopped by Raj's store for coffee. He knows every kid on the block by name. He told me he's been thinking about putting a little free library outside the store — has a bunch of kids' books his daughters outgrew. He also mentioned Marcus comes in every morning and they talk about cricket.",
    structured: {
      people: [
        { matched_id: raj.id, name: "Raj Patel", gifts: [
          { text: "knows every kid on the block by name", kind: "head" },
          { text: "wants to start a little free library outside his store", kind: "dream" },
          { text: "loves connecting with the kids and families on the block", kind: "heart" },
        ], pointed_to: ["Marcus"] },
      ],
    },
    recorded_at: daysAgo(1),
  };

  const note6 = {
    id: randomUUID(),
    raw_text: "Maria was out front watering her plants. She moved here from Mexico City two years ago. She's a nurse but between jobs right now. She said she's been making tamales and giving them to neighbors — it's how she meets people. She dreams of starting a small catering business someday. She knows Marcus from church.",
    structured: {
      people: [
        { matched_id: maria.id, name: "Maria Santos", gifts: [
          { text: "nurse by training", kind: "hand" },
          { text: "makes tamales and shares them with neighbors", kind: "hand" },
          { text: "loves feeding people as a way to connect", kind: "heart" },
          { text: "dreams of starting a small catering business", kind: "dream" },
        ] },
      ],
    },
    recorded_at: daysAgo(5),
  };

  const note7 = {
    id: randomUUID(),
    raw_text: "James was sitting on his stoop reading. He's a retired electrician — worked commercial buildings for 30 years. He said he still does small jobs for neighbors when they ask. He seems lonely since his wife passed. He mentioned he used to coach Little League and misses being around kids.",
    structured: {
      people: [
        { matched_id: james.id, name: "James O'Brien", gifts: [
          { text: "retired electrician, 30 years commercial", kind: "hand" },
          { text: "still does small electrical jobs for neighbors", kind: "teachable" },
          { text: "used to coach Little League, misses being around kids", kind: "heart" },
          { text: "would love to coach or mentor kids again", kind: "dream" },
        ] },
      ],
    },
    recorded_at: daysAgo(42),
  };

  const note8 = {
    id: randomUUID(),
    raw_text: "Marcus told me more today — he served in the Navy for 8 years before becoming a teacher. He speaks some Tagalog from his time stationed in the Philippines. He's worried about the empty storefronts on Irving and thinks a neighborhood skills swap could bring people together. He said Dorothy might be interested in teaching pie-making at something like that.",
    structured: {
      people: [
        { matched_id: marcus.id, name: "Marcus Williams", gifts: [
          { text: "served 8 years in the Navy", kind: "head" },
          { text: "speaks some Tagalog", kind: "head" },
          { text: "dreams of a neighborhood skills swap to fill empty storefronts", kind: "dream" },
        ], pointed_to: ["Dorothy"] },
      ],
      follow_ups: ["Talk to Dorothy about teaching pie-making at a skills swap"],
    },
    recorded_at: daysAgo(10),
  };

  const note9 = {
    id: randomUUID(),
    raw_text: "Second visit with Dorothy. She was crocheting on the porch. She makes blankets for new babies on the block — has done it for decades. She told me she's worried about James across the street, says he doesn't come out much anymore. She thinks he and Marcus would get along — they're both veterans.",
    structured: {
      people: [
        { matched_id: dorothy.id, name: "Dorothy Washington", gifts: [
          { text: "crochets blankets for every new baby on the block", kind: "hand" },
          { text: "deeply cares about neighbors' wellbeing", kind: "heart" },
        ], pointed_to: ["James", "Marcus"] },
      ],
      follow_ups: ["Check in on James", "Introduce James and Marcus — both veterans"],
    },
    recorded_at: daysAgo(28),
  };

  const note10 = {
    id: randomUUID(),
    raw_text: "Lila showed me the new compost system she built. She's been talking to the city about getting a water hookup for the garden. She mentioned Sam has been coming by more often and is really good with the younger kids who visit. She thinks he'd be a great garden mentor for the summer program she's dreaming up.",
    structured: {
      people: [
        { matched_id: lila.id, name: "Lila Chen", gifts: [
          { text: "built a compost system for the garden", kind: "hand" },
          { text: "navigating city bureaucracy for water hookup", kind: "head" },
        ], pointed_to: ["Sam"] },
        { matched_id: sam.id, name: "Sam Torres", gifts: [
          { text: "good with younger kids at the garden", kind: "heart" },
        ] },
      ],
      follow_ups: ["Ask Sam if he'd want to mentor kids in a summer garden program"],
    },
    recorded_at: daysAgo(15),
  };

  const notes = [note1, note2, note3, note4, note5, note6, note7, note8, note9, note10];
  const { error: nErr } = await supabase.from("notes").insert(notes);
  if (nErr) { console.error("Notes insert failed:", nErr); return; }
  console.log(`  ${notes.length} notes added`);

  // --- Gifts (extracted from all notes) ---
  const gifts: Array<{ person_id: string; text: string; kind: string; source_note_id: string }> = [];
  for (const note of notes) {
    for (const person of note.structured.people) {
      for (const gift of person.gifts) {
        gifts.push({
          person_id: person.matched_id!,
          text: gift.text,
          kind: gift.kind,
          source_note_id: note.id,
        });
      }
    }
  }
  const { error: gErr } = await supabase.from("gifts").insert(gifts);
  if (gErr) { console.error("Gifts insert failed:", gErr); return; }
  console.log(`  ${gifts.length} gifts added`);

  // --- Note-People join ---
  const notePeople: Array<{ note_id: string; person_id: string }> = [];
  for (const note of notes) {
    const seen = new Set<string>();
    for (const person of note.structured.people) {
      if (person.matched_id && !seen.has(person.matched_id)) {
        notePeople.push({ note_id: note.id, person_id: person.matched_id });
        seen.add(person.matched_id);
      }
    }
  }
  const { error: npErr } = await supabase.from("note_people").insert(notePeople);
  if (npErr) { console.error("Note-people insert failed:", npErr); return; }
  console.log(`  ${notePeople.length} note-person links added`);

  // --- Connections ---
  const connections = [
    { from_person: marcus.id, to_person: lila.id, reason: "Marcus mentioned Lila might need help building raised beds", source_note_id: note1.id, status: "suggested" },
    { from_person: lila.id, to_person: sam.id, reason: "Lila wants Sam to help at the garden", source_note_id: note3.id, status: "introduced" },
    { from_person: raj.id, to_person: marcus.id, reason: "Raj and Marcus talk cricket every morning at the store", source_note_id: note5.id, status: "done" },
    { from_person: marcus.id, to_person: dorothy.id, reason: "Marcus thinks Dorothy would teach pie-making at a skills swap", source_note_id: note8.id, status: "suggested" },
    { from_person: dorothy.id, to_person: james.id, reason: "Dorothy is worried about James, thinks he needs company", source_note_id: note9.id, status: "suggested" },
    { from_person: dorothy.id, to_person: marcus.id, reason: "Dorothy thinks James and Marcus would get along — both veterans", source_note_id: note9.id, status: "suggested" },
    { from_person: lila.id, to_person: sam.id, reason: "Lila thinks Sam would be a great garden mentor for kids", source_note_id: note10.id, status: "suggested" },
  ];
  const { error: cErr } = await supabase.from("connections").insert(connections);
  if (cErr) { console.error("Connections insert failed:", cErr); return; }
  console.log(`  ${connections.length} connections added`);

  console.log("\nDemo data seeded successfully!");
  console.log("7 neighbors, 10 notes, " + gifts.length + " gifts, 7 connections.");
}

seed().catch(console.error);
