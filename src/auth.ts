import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { isAdminEmail } from "@/lib/admin-email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    /**
     * Only the configured admin account may complete sign-in. This is a
     * convenience gate for the UI; every mutation independently re-checks
     * authorization in `src/app/admin/actions.ts`.
     */
    async signIn({ user }) {
      return isAdminEmail(user.email);
    },
  },
});
