import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";


export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? "placeholder",
      clientSecret: process.env.GITHUB_SECRET ?? "placeholder",
    }),
  ],
});
