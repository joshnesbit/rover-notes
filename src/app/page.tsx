"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  LogIn,
  LogOut,
  UserPlus,
  MessageSquarePlus,
  Link2,
} from "lucide-react";
import { PersonRow } from "@/components/person-row";
import { useAuth } from "@/components/auth-provider";
import type { Person } from "@/lib/database.types";

type SortMode = "recent" | "past" | "alpha";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, configured, signOut } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("recent");
  const [quickSearch, setQuickSearch] = useState("");

  const fetchPeople = useCallback(async () => {
    try {
      const res = await fetch(`/api/people?sort=${sort}`);
      if (res.ok) {
        const data = await res.json();
        setPeople(data);
      }
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const filtered = useMemo(() => {
    if (!quickSearch.trim()) return people;
    const q = quickSearch.toLowerCase();
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.where_they_are && p.where_they_are.toLowerCase().includes(q))
    );
  }, [people, quickSearch]);

  // Auth gate
  if (!authLoading && !user && configured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-8">
        <div className="w-full max-w-sm text-center">
          <BookOpen className="w-10 h-10 text-terracotta mx-auto mb-4" strokeWidth={2} />
          <h1 className="font-serif text-2xl font-semibold text-ink mb-1">
            Outer Sunset
          </h1>
          <h2 className="font-serif text-lg text-ink-light mb-6">
            Neighborhood Gift Bank
          </h2>
          <p className="text-ink-faint text-sm mb-8 leading-relaxed">
            A personal notebook for tracking the gifts, dreams, and passions of
            your neighbors.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-terracotta text-cream font-medium shadow-[0_2px_8px_rgba(196,105,74,0.3)] active:translate-y-[1px] transition-all"
          >
            <LogIn className="w-5 h-5" strokeWidth={2.5} />
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-ink-faint text-lg animate-pulse">
          opening the notebook...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-5 pt-6 pb-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-semibold text-ink flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-terracotta" strokeWidth={2.5} />
              Outer Sunset
            </h1>
            <p className="text-sm text-ink-light ml-7">Neighborhood Gift Bank</p>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-ink-faint hover:text-ink transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Action buttons — primary actions grouped */}
      <div className="px-5 pt-4 pb-2 space-y-3">
        {/* New Note — still the primary action */}
        <button
          onClick={() => router.push("/note/new")}
          className="w-full flex items-center justify-center gap-3 bg-terracotta text-cream rounded-2xl py-3.5 px-6 text-base font-medium shadow-[0_2px_8px_rgba(196,105,74,0.3)] active:shadow-[0_1px_4px_rgba(196,105,74,0.2)] active:translate-y-[1px] transition-all duration-200"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          New Note
        </button>

        {/* Secondary actions row */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/person/new")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cream border border-ink/8 text-sm text-ink font-medium hover:bg-paper-dark transition-colors"
          >
            <UserPlus className="w-4 h-4 text-sage" strokeWidth={2.5} />
            Add Person
          </button>
          <button
            onClick={() => router.push("/note/new?type=about")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cream border border-ink/8 text-sm text-ink font-medium hover:bg-paper-dark transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4 text-terracotta" strokeWidth={2.5} />
            About Someone
          </button>
          <button
            onClick={() => router.push("/note/new?type=connection")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cream border border-ink/8 text-sm text-ink font-medium hover:bg-paper-dark transition-colors"
          >
            <Link2 className="w-4 h-4 text-ink-light" strokeWidth={2.5} />
            Connection
          </button>
        </div>
      </div>

      {/* Inline search */}
      <div className="px-5 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" strokeWidth={2.5} />
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="find a neighbor..."
            className="w-full bg-cream rounded-xl py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint/50 border border-ink/5"
          />
          {quickSearch && (
            <button
              onClick={() => setQuickSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-xs"
            >
              clear
            </button>
          )}
        </div>
        {quickSearch && (
          <p className="text-xs text-ink-faint mt-1.5 ml-1">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"}
            {" · "}
            <Link href={`/search?q=${encodeURIComponent(quickSearch)}`} className="text-terracotta underline">
              full search
            </Link>
          </p>
        )}
      </div>

      {/* Neighbors list */}
      <div className="flex-1 px-5 pt-3 pb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-ink-faint">
            {people.length} {people.length === 1 ? "neighbor" : "neighbors"}
          </p>
          <div className="flex gap-1">
            {(["recent", "past", "alpha"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSort(mode)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                  sort === mode
                    ? "bg-ink text-paper"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                {mode === "recent"
                  ? "recent"
                  : mode === "past"
                    ? "past"
                    : "a–z"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-ink-faint text-base animate-pulse">
              opening the notebook...
            </p>
          </div>
        ) : filtered.length === 0 && quickSearch ? (
          <div className="text-center py-8">
            <p className="text-ink-faint text-base">
              no one matching &ldquo;{quickSearch}&rdquo;
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-faint text-lg mb-2">
              No notes yet.
            </p>
            <p className="text-ink-faint text-sm">Go take a walk.</p>
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {filtered.map((person) => (
              <PersonRow key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
