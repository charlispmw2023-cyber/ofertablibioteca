"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { DotLottiePlayer } from "@dotlottie/react-player";
import type { DotLottie } from "@dotlottie/react-player";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [lottiePlayer, setLottiePlayer] = React.useState<DotLottie | null>(
    null
  );

  // Garante que a animação comece no estado correto (sol ou lua)
  React.useEffect(() => {
    if (lottiePlayer) {
      if (resolvedTheme === "dark") {
        // Vai para o final da animação (lua) sem tocar
        lottiePlayer.setFrame(lottiePlayer.totalFrames - 1);
      } else {
        // Vai para o início da animação (sol) sem tocar
        lottiePlayer.setFrame(0);
      }
    }
  }, [lottiePlayer, resolvedTheme]);

  const handleToggle = () => {
    if (!lottiePlayer) return;

    const newTheme = resolvedTheme === "light" ? "dark" : "light";

    if (newTheme === "dark") {
      lottiePlayer.setDirection(1); // Toca a animação para frente (sol para lua)
    } else {
      lottiePlayer.setDirection(-1); // Toca a animação para trás (lua para sol)
    }

    lottiePlayer.play();
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-transparent"
      aria-label="Toggle theme"
    >
      <div className="h-8 w-8">
        <DotLottiePlayer
          src="https://lottie.host/4aac5026-b969-4e69-9283-165506120080/asgITV9Yxm.lottie"
          autoplay={false}
          loop={false}
          dotLottieRef={(instance: DotLottie) => {
            setLottiePlayer(instance);
          }}
        />
      </div>
    </button>
  );
}