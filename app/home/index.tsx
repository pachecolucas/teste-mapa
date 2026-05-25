"use client";

import Mapa from "@/components/Mapa";
import { Casa } from "@/components/Mapa/types";

type Props = {
  casas: Casa[];
  longitude: number;
};

export default function Index({ casas, longitude }: Props) {
  return <Mapa casas={casas} longitude={longitude} />;
}
