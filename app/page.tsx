import { calcularPlanetas } from "@/lib/planetas";
import Home from "./home";
import { calcularCasas, DadosNatais, ResultadoCasas } from "@/lib/casas";
import { Casa } from "@/components/Mapa/types";

export default async function Page() {
  const entrada: DadosNatais = {
    ano: 1984,
    mes: 12,
    dia: 1,
    hora: 9,
    minuto: 10,
    segundo: 0,
    utcOffset: -3,
    latitude: -(28 + 28 / 60),
    longitude: -(49 + 0 / 60 + 25 / 3600),
    sistemaCasas: "P",
  };

  const ABREV = ["Ari", "Tou", "Gem", "Can", "Leo", "Vir", "Lib", "Esc", "Sag", "Cap", "Aqu", "Pei"];
  const fmt = (p: { signoIndice: number; grau: number; minuto: number; segundo: number }) =>
    `${String(p.grau).padStart(2)} ${ABREV[p.signoIndice]} ${String(p.minuto).padStart(2, "0")}'${String(p.segundo).padStart(2, "0")}"`;

  const esperado: Record<string, string> = {
    Sol: "9 Sag 29'31",
    Lua: "22 Pei 19'32",
    Mercúrio: "29 Sag 54'42",
    Vênus: "20 Cap 58'04",
    Marte: "11 Aqu 52'42",
    Júpiter: "14 Cap 39'05",
    Saturno: "21 Esc 27'59",
    Urano: "13 Sag 32'03",
    Netuno: "0 Cap 20'46",
    Plutão: "3 Esc 29'55",
    "Nodo Verdadeiro": "27 Tou 22'36 d",
    Quíron: "5 Gem 42'23 r",
  };

  console.log("=== PLANETAS (calculado | imagem) ===");
  for (const pl of calcularPlanetas(entrada)) {
    const flag = pl.retrogrado ? "r" : "d";
    console.log(`${pl.nome.padEnd(16)} ${fmt(pl)} ${flag}  | ${esperado[pl.nome] ?? "—"}`);
  }

  console.log("\n=== ÂNGULOS (das casas) ===");
  const casas = calcularCasas(entrada);
  console.log("casas", casas);

  return (
    <div>
      <Home casas={getCasas(casas)} longitude={getLongitude(casas)} />
    </div>
  );
}

function getLongitude(casas: ResultadoCasas) {
  const ascendente = casas.cuspides[0];
  return 360 - ascendente.longitude;
}

function getCasas(casas: ResultadoCasas): Casa[] {
  const casa1 = casas.cuspides[0];
  const longitudeCasa1 = casa1.longitude;

  function getNome(numeroDaCasa: number) {
    if (numeroDaCasa == 1) return "AC";
    if (numeroDaCasa == 4) return "IC";
    if (numeroDaCasa == 7) return "DC";
    if (numeroDaCasa == 10) return "MC";
    return null;
  }

  function getGrau(longitudeDaCasa: number) {
    const result = longitudeDaCasa - longitudeCasa1;
    if (result < 0) return result + 360;
    return result;
  }

  return casas.cuspides.map((c) => {
    return {
      numero: c.casa,
      grau: getGrau(c.longitude),
      nome: getNome(c.casa),
    };
  });
}
