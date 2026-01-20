import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      
      const supabase = createServerSupabaseClient();
      
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (!existingUser) {
        await supabase.from('users').insert({
          email: user.email,
          name: user.name,
          image: user.image,
        });
      }
      
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const supabase = createServerSupabaseClient();
        const { data: dbUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single();
        
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
  },
});
