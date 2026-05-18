"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Loader2, Sparkles } from "lucide-react";

export default function NewPersonPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [where, setWhere] = useState("");
  const [freeform, setFreeform] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/people/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          where_they_are: where.trim() || null,
          freeform: freeform.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          router.push(`/person/${data.id}`);
        } else {
          router.push("/");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center gap-3 px-5 pt-6 pb-2">
        <button
          onClick={() => router.push("/")}
          className="p-2 -m-2 text-ink-faint hover:text-ink"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <h1 className="font-serif text-xl text-ink">add a neighbor</h1>
      </header>

      <div className="flex-1 px-5 py-4 space-y-4">
        <div>
          <label className="text-sm text-ink-light mb-1 block">name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marcus Williams"
            autoFocus
            className="w-full bg-cream rounded-xl py-3 px-4 text-ink placeholder:text-ink-faint/50 border border-ink/5"
          />
        </div>

        <div>
          <label className="text-sm text-ink-light mb-1 block">where you know them</label>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="30th and Judah, yellow house on the corner"
            className="w-full bg-cream rounded-xl py-3 px-4 text-ink placeholder:text-ink-faint/50 border border-ink/5"
          />
        </div>

        <div>
          <label className="text-sm text-ink-light mb-1 block">
            anything else?
            <span className="text-ink-faint ml-1.5 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" strokeWidth={2} />
              AI will extract gifts & dreams
            </span>
          </label>
          <textarea
            value={freeform}
            onChange={(e) => setFreeform(e.target.value)}
            placeholder="Tell me anything about them — what they love, what they know, what they dream about..."
            className="w-full bg-cream rounded-xl py-3 px-4 text-ink placeholder:text-ink-faint/50 border border-ink/5 resize-none min-h-[120px] leading-relaxed"
          />
        </div>
      </div>

      <div className="px-5 pb-8 pt-2">
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sage text-cream text-base font-medium shadow-[0_2px_8px_rgba(122,155,109,0.3)] active:translate-y-[1px] transition-all disabled:opacity-40 disabled:shadow-none"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
          ) : (
            <UserPlus className="w-5 h-5" strokeWidth={2.5} />
          )}
          Add Neighbor
        </button>
      </div>
    </div>
  );
}
