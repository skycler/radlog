import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Start logging your rides.
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-foreground/60">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline hover:no-underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
