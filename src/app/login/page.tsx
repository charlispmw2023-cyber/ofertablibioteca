"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Bem-vindo à sua Biblioteca de Ofertas
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: "Endereço de e-mail",
                password_label: "Sua senha",
                email_input_placeholder: "Seu endereço de e-mail",
                password_input_placeholder: "Sua senha",
                button_label: "Entrar",
                social_provider_text: "Entrar com {{provider}}",
                link_text: "Já tem uma conta? Entre",
              },
              sign_up: {
                email_label: "Endereço de e-mail",
                password_label: "Crie uma senha",
                email_input_placeholder: "Seu endereço de e-mail",
                password_input_placeholder: "Crie uma senha",
                button_label: "Registrar",
                social_provider_text: "Registrar com {{provider}}",
                link_text: "Não tem uma conta? Registre-se",
              },
              forgotten_password: {
                email_label: "Endereço de e-mail",
                email_input_placeholder: "Seu endereço de e-mail",
                button_label: "Enviar instruções de recuperação",
                link_text: "Esqueceu sua senha?",
              },
            },
          }}
        />
      </div>
    </div>
  );
}