import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Contraseña", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) return null;

                const passwordOk = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!passwordOk) return null;

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user && user.id) {
                token.id = user.id;
            } else if (!token.id && token.sub) {
                token.id = token.sub;
            }

            if (!token.id) return token;

            const userId = token.id as string;

            // 🔥 Actualizar token si hay cambios (para cuando el usuario cambia su perfil)
            if (trigger === "update" && session) {
                // Manejar actualizaciones manuales si es necesario
            }

            const dbUser = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    name: true,
                    role: true,
                    image: true,
                    email: true,
                    phone: true,
                }
            });

            if (!dbUser) return token;

            token.role = dbUser.role;
            token.name = dbUser.name;
            token.image = dbUser.image;
            token.phone = dbUser.phone;

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email as string;
                session.user.role = token.role;
                session.user.name = token.name;
                session.user.image = token.image as string | null;
                session.user.phone = token.phone;
            }
            return session;
        },
    },
});

