import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    // เช็คว่าคนที่ Login เข้ามาคือ Admin เท่านั้นหรือไม่
    async signIn({ user }) {
      return user.email === process.env.ADMIN_EMAIL;
    },
  },
})