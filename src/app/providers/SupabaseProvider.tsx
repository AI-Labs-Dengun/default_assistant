"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// Define the context type
type SupabaseContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; emailExists?: boolean }>;
  signUp: (email: string, password: string, name: string, company?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
};

// Create the context
const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  checkEmailExists: async () => false,
});

// Create a hook to use the context
export const useSupabase = () => useContext(SupabaseContext);

// Provider component
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for user on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if email exists in authentication
  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('default_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Erro ao verificar email:', error);
        return false;
      }

      return data !== null;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      // Primeiro, verifica se o email existe usando resetPassword
      // Esta é uma maneira segura de verificar se o email existe sem expor informações sensíveis
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      // Se houver erro de "User not found", significa que o email não existe
      if (resetError?.message?.includes('User not found')) {
        return { error: { message: 'EMAIL_NOT_FOUND' }, emailExists: false };
      }

      // Se chegou aqui, o email existe, então tenta fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Se houver erro no login, significa que a senha está errada
      if (signInError) {
        return { error: { message: 'INVALID_PASSWORD' }, emailExists: true };
      }

      // Login bem sucedido
      return { error: null, emailExists: true };
    } catch (error) {
      console.error('Erro no processo de login:', error);
      return { error, emailExists: false };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string, company?: string) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company,
          },
        },
      });

      if (signUpError) return { error: signUpError };

      // O perfil será criado automaticamente através de um trigger no banco de dados
      // quando o usuário confirmar o email e fizer login pela primeira vez

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    checkEmailExists,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
} 