"use client";

import { useState } from "react";
import { BookOpen, Send, Loader2, Check } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Add env vars to .env.local.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-terracotta" strokeWidth={2} />
          <div>
            <h1 className="font-serif text-2xl font-semibold text-ink">
              Outer Sunset
            </h1>
            <p className="font-serif text-lg text-ink-light">
              Neighborhood Gift Bank
            </p>
          </div>
        </div>

        <p className="text-center text-ink-faint text-sm mb-8 leading-relaxed">
          A personal notebook for tracking the gifts, dreams, and passions of your neighbors.
        </p>

        {sent ? (
          <div className="text-center bg-cream rounded-2xl p-6 border border-ink/5">
            <Check className="w-8 h-8 text-sage mx-auto mb-3" strokeWidth={2} />
            <p className="font-serif text-lg text-ink mb-1">Check your email</p>
            <p className="text-sm text-ink-faint">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email"
              autoFocus
              className="w-full bg-cream rounded-xl py-3.5 px-4 text-ink placeholder:text-ink-faint/50 border border-ink/5 text-center"
            />

            {error && (
              <p className="text-sm text-terracotta text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-terracotta text-cream font-medium shadow-[0_2px_8px_rgba(196,105,74,0.3)] active:translate-y-[1px] transition-all disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
              ) : (
                <Send className="w-4 h-4" strokeWidth={2.5} />
              )}
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
