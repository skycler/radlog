import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const features = [
  {
    headline: "Your rides, your memory",
    description:
      "Log every ride with distance, elevation, bike, and personal notes. Capture what mattered to you — not what an algorithm decides is interesting.",
    image: "/images/landing/ride-log.png",
    alt: "Radlog ride log view showing a list of logged rides",
  },
  {
    headline: "Know your machine",
    description:
      "Track maintenance per bike — chain swaps, brake bleeds, tire changes. See the full service history at a glance so nothing slips through the cracks.",
    image: "/images/landing/maintenance.png",
    alt: "Radlog bike maintenance history view",
  },
  {
    headline: "See the bigger picture",
    description:
      "Simple, honest charts of your riding over time. Distance, elevation, frequency — no gamification, no guilt trips. Just your data, visualised.",
    image: "/images/landing/dashboard.png",
    alt: "Radlog dashboard with ride statistics plots",
  },
] as const;

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Radlog
        </h1>
        <p className="mt-6 max-w-lg text-lg text-foreground/60">
          A quiet place to keep your ride journal. No auto-sync, no
          leaderboards, no followers — just you and the road.
        </p>
        <div className="mt-10 flex gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-foreground/20 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-2xl px-4 py-14 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          The ride is yours. Keep it that way.
        </h2>
        <p className="mt-6 text-foreground/60 leading-relaxed">
          Somewhere along the way, logging a ride became a performance. Segments,
          KOMs, social feeds, push notifications begging you to come back.
          Radlog is the opposite. It&apos;s a manual journal — you type in what
          you rode, on which bike, and anything you want to remember. No GPS
          required. No audience. Just a clean record of your time on two wheels.
        </p>
      </section>

      {/* Feature highlights */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="flex flex-col gap-16">
          {features.map((feature, i) => (
            <div
              key={feature.headline}
              className={`flex flex-col items-center gap-8 md:flex-row md:gap-12 ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 shrink-0">
                <div className="overflow-hidden rounded-lg border border-foreground/10 shadow-sm">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    width={960}
                    height={600}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold tracking-tight">
                  {feature.headline}
                </h3>
                <p className="mt-3 text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bulk import teaser */}
      <section className="mx-auto max-w-2xl px-4 py-14 text-center">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Already tracking your rides? Bring them with you.
        </h2>
        <p className="mt-4 text-foreground/60 leading-relaxed">
          If you&apos;ve been keeping a spreadsheet, a notebook, or any personal
          log — Radlog has CSV bulk upload so you can import your history in one
          go. No data left behind.
        </p>
      </section>

      {/* Closing CTA */}
      <section className="flex flex-col items-center px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Start your ride journal
        </h2>
        <p className="mt-4 max-w-md text-foreground/60">
          Free, simple, and built for cyclists who just want to ride.
        </p>
        <Link
          href="/signup"
          className="mt-8 rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Sign up for free
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-foreground/10 px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-foreground/40">
          <span>Radlog</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground/60">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground/60">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
