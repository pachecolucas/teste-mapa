import { Aspecto } from "@/lib/aspectos";
import Signos from "./signos";
import { Casa, Planeta } from "./types";

type Props = {
  casas: Casa[];
  planetas: Planeta[];
  aspectos: Aspecto[];
  longitude: number;
};

export default function Mapa({ casas, longitude, planetas, aspectos }: Props) {
  return (
    <div className="bg-slate-50">
      <Signos casas={casas} planetas={planetas} aspectos={aspectos} longitude={longitude} />
    </div>
  );
}
