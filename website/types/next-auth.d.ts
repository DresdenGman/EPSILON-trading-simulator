// NextAuth v5 type extensions
// Provides type-safe access to session.user.id

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
