import Signos from "./signos";
import { Casa } from "./types";

type Props = {
  casas: Casa[];
  longitude: number;
};

export default function Mapa({ casas, longitude }: Props) {
  return (
    <div className="bg-slate-50">
      <Signos casas={casas} longitude={longitude} />
    </div>
  );
}
