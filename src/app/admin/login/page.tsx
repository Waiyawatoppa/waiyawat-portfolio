import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="min-h-dvh bg-surface-raised grid place-items-center px-6 py-24">
      <div className="w-full max-w-sm bg-surface rounded-3xl p-8 shadow-sm border border-line text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Admin sign in</h1>
        <p className="text-sm text-ink-secondary mb-8">
          Restricted to the site owner&rsquo;s Google account.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-ink text-surface font-bold hover:bg-ink/90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Continue with Google
          </button>
        </form>

        <Link
          href="/"
          className="inline-block mt-6 text-sm text-ink-secondary hover:text-accent transition rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
