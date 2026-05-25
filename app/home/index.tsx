"use client";

import Mapa from "@/components/Mapa";
import { Casa } from "@/components/Mapa/types";

type Props = {
  casas: Casa[];
};

export default function Index({ casas }: Props) {
  return <Mapa casas={casas} />;
}
