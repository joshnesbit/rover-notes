# Rover Notes

A personal, mobile-first notebook for tracking the names, gifts, and dreams of your neighbors. Built for a single user practicing a "roving listener" style of community building at the block scale.

The name picks up De'Amon Harges' framing of this work as social banking: gifts as intangible currencies, listening as deposit, connecting as the moment a gift is put to use. The notebook holds what would otherwise be forgotten, so it can be returned to the neighborhood when the moment is right.

## What it does

- **Capture** a note after a conversation — voice-typed into a simple textarea
- **Parse** the note in the background using the Claude API, extracting people, gifts (head / heart / hand / teachable / dream), connections, and follow-ups
- **Browse** all neighbors as a list, sorted by recently seen, longest unseen, or alphabetical
- **View** a person card with their gifts grouped by kind, connections, and full note history
- **Search** across everyone by name, gift text, or raw note content
- **Remember** — a one-tap "what should I remember?" button that returns 2-3 listening-oriented reminders before your next conversation

## The practice

Rover Notes is grounded in the practice of De'Amon Harges, the original "Roving Listener" at Broadway United Methodist Church in Indianapolis. The practice has a three-part loop:

1. **Name** the gifts you discover
2. **Bless** them (celebrate, honor, reflect them back)
3. **Connect** them with others in the neighborhood

Gifts are categorized using John McKnight and Peter Block's framework:

- **Head** — knowledge (history, languages, who lives where)
- **Heart** — passion (children, music, growing things)
- **Hand** — skill (carpentry, cooking, mechanics)
- **Teachable** — something they're willing to teach
- **Dream** — an aspiration or wish

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (Postgres + magic link auth)
- [Anthropic Claude API](https://docs.anthropic.com/) (server-side note parsing and reminders)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) icons
- PWA-installable via manifest

## Setup

### 1. Clone and install

```bash
git clone https://github.com/joshnesbit/rover-notes.git
cd rover-notes
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the SQL Editor and run the migration at `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL, anon key, and service role key

### 3. Set environment variables

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key
- `ANTHROPIC_API_KEY` — your Anthropic API key

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design

The tool should never feel like a database of people. It should feel like a personal notebook full of love.

- Paper-cream background, warm serif headings (Fraunces), handwritten accents (Caveat)
- Terracotta and sage palette, deep brown ink
- Generous spacing, large tap targets, slow gentle transitions
- Empty states that are warm and quiet: "No notes yet. Go take a walk."

## License

MIT
