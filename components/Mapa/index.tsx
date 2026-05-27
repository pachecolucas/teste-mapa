import Signos from "./signos";
import { Casa, Planeta } from "./types";

type Props = {
  casas: Casa[];
  planetas: Planeta[];
  longitude: number;
};

export default function Mapa({ casas, longitude, planetas }: Props) {
  return (
    <div className="bg-slate-50">
      <Signos casas={casas} planetas={planetas} longitude={longitude} />
    </div>
  );
}
