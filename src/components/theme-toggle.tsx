"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { DotLottiePlayer } from "@dotlottie/react-player";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [lottiePlayer, setLottiePlayer] = React.useState<any | null>(
    null
  );

  // Garante que a animação comece no estado correto (dia ou noite)
  React.useEffect(() => {
    if (lottiePlayer) {
      if (resolvedTheme === "dark") {
        // Vai para o final da animação (noite) sem tocar
        lottiePlayer.setFrame(lottiePlayer.totalFrames - 1);
      } else {
        // Vai para o início da animação (dia) sem tocar
        lottiePlayer.setFrame(0);
      }
    }
  }, [lottiePlayer, resolvedTheme]);

  const handleToggle = () => {
    if (!lottiePlayer) return;

    const newTheme = resolvedTheme === "light" ? "dark" : "light";

    if (newTheme === "dark") {
      lottiePlayer.setDirection(1); // Toca a animação para frente (dia para noite)
    } else {
      lottiePlayer.setDirection(-1); // Toca a animação para trás (noite para dia)
    }

    lottiePlayer.play();
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex h-10 w-20 items-center justify-center rounded-full bg-transparent"
      aria-label="Toggle theme"
    >
      <DotLottiePlayer
        src="https://lottie.host/249998dc-c39b-4e2b-b7b6-9b44857a6a2d/33za2kF72E.lottie"
        autoplay={false}
        loop={false}
        lottieRef={(instance: any) => {
          setLottiePlayer(instance);
        }}
      />
    </button>
  );
}