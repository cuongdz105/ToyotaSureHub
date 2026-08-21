import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";


const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {

  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    let mounted = true;


    async function initializeAuth() {

      try {

        const {
          data,
          error,
        } =
          await supabase.auth.getSession();


        if (!mounted) {
          return;
        }


        if (error) {

          console.error(
            "Supabase getSession error:",
            error
          );

          setSession(null);

        } else {

          setSession(
            data?.session || null
          );

        }

      } catch (error) {

        console.error(
          "Auth initialization error:",
          error
        );

        if (mounted) {
          setSession(null);
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }


    initializeAuth();


    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {

          if (!mounted) {
            return;
          }

          setSession(
            nextSession || null
          );

          setLoading(false);

        }
      );


    return () => {

      mounted = false;

      subscription?.unsubscribe();

    };

  }, []);


  async function signIn(
    email,
    password
  ) {

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email:
            email.trim(),

          password,
        }
      );


    if (error) {
      throw error;
    }


    /*
     * Không setSession ở đây.
     *
     * Supabase sẽ phát auth event
     * và onAuthStateChange ở trên
     * sẽ cập nhật session.
     */

    return data;

  }


  async function signOut() {

    const {
      error,
    } =
      await supabase.auth.signOut();


    if (error) {
      throw error;
    }

    /*
     * Không setSession thủ công.
     *
     * onAuthStateChange sẽ nhận
     * SIGNED_OUT và cập nhật.
     */

  }


  const value =
    useMemo(
      () => ({

        session,

        user:
          session?.user ||
          null,

        loading,

        isAuthenticated:
          Boolean(session),

        signIn,

        signOut,

      }),
      [
        session,
        loading,
      ]
    );


  return (

    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>

  );

}


export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth phải được dùng bên trong AuthProvider."
    );

  }


  return context;

}