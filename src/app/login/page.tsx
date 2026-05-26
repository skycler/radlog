import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Log in to Radlog</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Welcome back, cyclist.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-foreground/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground underline hover:no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
