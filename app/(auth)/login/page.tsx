"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <motion.div
      className="w-full max-w-[440px]"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl glow-btn text-sm font-bold animate-float">
          FT
        </div>
        <h1 className="mt-4 text-3xl font-extrabold font-sora grad-text">FinTrack AI</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-500">
          Your Smart Financial Assistant
        </p>
      </motion.div>

      <motion.div variants={item} className="glass-card grad-border p-6 md:p-8">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-sm dark:bg-white/5">
          <Link
            href="/login"
            className={cn(
              "rounded-lg px-3 py-2 text-center font-medium",
              "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white",
            )}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg px-3 py-2 text-center font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Sign Up
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-2"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete="current-password"
              className="mt-2"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="glow-btn w-full rounded-xl py-3.5 text-sm font-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-600">
          Demo: demo@fintrack.ai / demo123
        </p>
      </motion.div>
    </motion.div>
  );
}
