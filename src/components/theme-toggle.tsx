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
    if (lottiePlayer && lottiePlayer.totalFrames > 0) {
      if (resolvedTheme === "dark") {
        // Vai para o final da animação (noite) sem tocar
        lottiePlayer.goToAndStop(lottiePlayer.totalFrames - 1, true);
      } else {
        // Vai para o início da animação (dia) sem tocar
        lottiePlayer.goToAndStop(0, true);
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
        src="https://lottie.host/5470518d-6b17-4230-a015-401929582293/FpI52v2C1L.lottie"
        autoplay={false}
        loop={false}
        lottieRef={(instance: any) => {
          setLottiePlayer(instance);
        }}
      />
    </button>
  );
}