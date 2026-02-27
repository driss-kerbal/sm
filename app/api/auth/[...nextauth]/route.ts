import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { initializeDatabase, query } from "@/lib/db";
import bcrypt from "bcryptjs";

// Initialize database on startup
(async () => {
  try {
    await initializeDatabase();
    console.log("✅ PostgreSQL database initialized on NextAuth startup");
  } catch (error) {
    console.error("⚠️ Database initialization warning (will retry on first auth attempt):", error);
  }
})();

// Verify required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is not set");
}

if (!process.env.NEXTAUTH_URL) {
  console.error("❌ NEXTAUTH_URL is not set");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Ensure database is initialized
          await initializeDatabase();

          if (!credentials?.email || !credentials?.password) {
            console.warn("❌ Missing email or password");
            return null;
          }

          const result = await query("SELECT * FROM users WHERE email = $1", [credentials.email]);
          const user = result.rows[0];

          if (!user) {
            console.warn(`❌ User not found: ${credentials.email}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.warn(`❌ Invalid password for user: ${credentials.email}`);
            return null;
          }

          console.log(`✅ User authenticated: ${credentials.email}`);
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
