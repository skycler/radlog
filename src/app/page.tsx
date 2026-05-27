import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Radlog</h1>
        <p className="max-w-md text-lg text-foreground/60">
          A simple, personal ride journal for passionate cyclists. No auto-sync,
          no social features, no data overload — just you and your rides.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
