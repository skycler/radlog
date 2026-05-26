"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { createClient } from "@/lib/supabase/client";

export function AppHeader({ email }: { email: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return <Header user={{ email }} onLogout={handleLogout} />;
}
