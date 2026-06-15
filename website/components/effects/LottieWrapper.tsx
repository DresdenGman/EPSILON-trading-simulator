"use client";

import React from "react";
import Lottie from "lottie-react";

interface LottieWrapperProps {
  animation: object;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  onComplete?: () => void;
}

export default function LottieWrapper({
  animation,
  className = "",
  loop = false,
  autoplay = true,
  onComplete,
}: LottieWrapperProps) {
  return (
    <Lottie
      animationData={animation}
      loop={loop}
      autoplay={autoplay}
      className={className}
      onComplete={onComplete}
      rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
    />
  );
}
