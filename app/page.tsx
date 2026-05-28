import { calcularPlanetas, Planeta as PlanetaBackend } from "@/lib/planetas";
import { calcularAspectos } from "@/lib/aspectos";
import Home from "./home";
import { calcularCasas, DadosNatais, ResultadoCasas } from "@/lib/casas";
import { Casa, Planeta } from "@/components/Mapa/types";

const DADOS_NATAIS: Record<string, DadosNatais> = {
  lucas: {
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
  },
};

export default async function Page() {
  const entrada: DadosNatais = DADOS_NATAIS.lucas;

  const ABREV = ["Ari", "Tou", "Gem", "Can", "Leo", "Vir", "Lib", "Esc", "Sag", "Cap", "Aqu", "Pei"];
  const fmt = (p: { signoIndice: number; grau: number; minuto: number; segundo: number }) =>
    `${String(p.grau).padStart(2)} ${ABREV[p.signoIndice]} ${String(p.minuto).padStart(2, "0")}'${String(p.segundo).padStart(2, "0")}"`;

  const planetasRaw = calcularPlanetas(entrada);
  console.log("=== PLANETAS (calculado | imagem) ===");
  for (const pl of planetasRaw) {
    const flag = pl.retrogrado ? "r" : "d";
    console.log(`${pl.nome.padEnd(16)} ${fmt(pl)} ${flag}}`);
  }

  console.log("\n=== ÂNGULOS (das casas) ===");
  const casas = calcularCasas(entrada);
  console.log("casas", casas);

  const planetas = getPlanetas(planetasRaw, casas);
  const aspectos = calcularAspectos(planetas);

  return (
    <div>
      <Home casas={getCasas(casas)} planetas={planetas} aspectos={aspectos} longitude={getLongitude(casas)} />
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

/**
 * Glifo Unicode de cada corpo. Mantido aqui no page.tsx por enquanto
 * (decisão de visualização, não de cálculo). Mais tarde pode migrar
 * para junto da lista CORPOS no backend, se preferir uma fonte única.
 */
const ICONES_PLANETAS: Record<string, string> = {
  sol: "☉",
  lua: "☽",
  mercurio: "☿",
  venus: "♀",
  marte: "♂",
  jupiter: "♃",
  saturno: "♄",
  urano: "♅",
  netuno: "♆",
  plutao: "♇",
  nodo: "☊",
  quiron: "⚷",
};

/**
 * Cor do glifo de cada corpo, em hex. Hex (e não classe Tailwind) porque
 * Tailwind precisa de classe estática; o atributo SVG `fill` aceita hex direto.
 */
const CORES_PLANETAS: Record<string, string> = {
  sol: "#D4A017", // dourado
  lua: "#9CA3AF", // cinza claro (branco some no fundo claro)
  mercurio: "#F97316", // laranja
  venus: "#EC4899", // rosa
  marte: "#DC2626", // vermelho
  jupiter: "#000000", // preto (não especificado)
  saturno: "#6B7280", // cinza
  urano: "#2563EB", // azul
  netuno: "#60A5FA", // azul claro
  plutao: "#000000", // preto
  nodo: "#000000", // preto (não especificado)
  quiron: "#000000", // preto (não especificado)
};

function getPlanetas(planetas: PlanetaBackend[], casas: ResultadoCasas): Planeta[] {
  const longitudeAC = casas.cuspides[0].longitude;

  function getGrau(longitudePlaneta: number) {
    const result = longitudePlaneta - longitudeAC;
    if (result < 0) return result + 360;
    return result;
  }

  return planetas.map((p) => ({
    id: p.id,
    nome: p.nome,
    icone: ICONES_PLANETAS[p.id] ?? "?",
    cor: CORES_PLANETAS[p.id] ?? "#000000",
    grau: getGrau(p.longitude),
    retrogrado: p.retrogrado,
  }));
}
