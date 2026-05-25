import Signos from "./signos";
import { Casa } from "./types";

type Props = {
  casas: Casa[];
};

export default function Mapa({ casas }: Props) {
  return (
    <div className="bg-slate-50">
      <Signos anguloInicial={57.17} casas={casas} />
    </div>
  );
}
