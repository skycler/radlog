"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../actions";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else if (result?.success) {
      setConfirmedEmail(result.email);
      setPending(false);
    }
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
            placeholder="At least 6 characters"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Sign up"}
        </button>
      </form>

      {/* Confirmation dialog */}
      {confirmedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-lg border border-foreground/10 bg-background p-6 shadow-xl text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-accent mx-auto mb-4"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13 2 4" />
            </svg>
            <h3 className="text-lg font-bold mb-2">Check your email</h3>
            <p className="text-sm text-foreground/60 mb-1">
              We sent a confirmation link to
            </p>
            <p className="text-sm font-mono font-medium mb-4">
              {confirmedEmail}
            </p>
            <p className="text-xs text-foreground/40 mb-6">
              Click the link in the email to activate your account, then log in.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Go to login
            </button>
          </div>
        </div>
      )}
    </>
  );
}
