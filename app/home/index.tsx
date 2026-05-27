"use client";

import Mapa from "@/components/Mapa";
import { Casa, Planeta } from "@/components/Mapa/types";

type Props = {
  casas: Casa[];
  planetas: Planeta[];
  longitude: number;
};

export default function Index({ casas, longitude, planetas }: Props) {
  return <Mapa casas={casas} planetas={planetas} longitude={longitude} />;
}
