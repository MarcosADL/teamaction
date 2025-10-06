// auth.ts (raiz do projeto)
import NextAuth, { type User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // credentials.* é unknown -> normalizar para string
        const email = String(credentials?.email ?? '');
        const password = String(credentials?.password ?? '');

        if (!email || !password) return null;

        // TODO: validação real (DB). Aqui é só um stub.
        const user: User = {
          id: '1',
          name: email,
          email,
          // image: undefined
        };

        return user;
      },
    }),
  ],
});
