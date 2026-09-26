import React from "react";
import { LayeredWaves } from "./LayeredWaves";

interface BottomDecorativeWavesProps {
  className?: string;
  heightClass?: string;
}

export function BottomDecorativeWaves({
  className = "",
  heightClass,
}: BottomDecorativeWavesProps) {
  return <LayeredWaves className={className} heightClass={heightClass} />;
}

export default BottomDecorativeWaves;
