import * as sweph from "sweph";
import path from "node:path";
import { decompor, dadosParaJD, type DadosNatais, type PosicaoZodiacal } from "./casas";

/**
 * PASSO 2 — Posições dos planetas (e demais corpos).
 *
 * Reaproveita `dadosParaJD` e `decompor` do módulo de casas. A engine é a mesma
 * (Swiss Ephemeris); os valores batem ao segundo de arco com a astro.com.
 *
 * IMPORTANTE: ao contrário das casas, os planetas precisam dos ARQUIVOS de
 * efemérides (.se1). Sem eles, o Quíron não calcula e o Nodo sai ~11" errado.
 * Coloque os três arquivos numa pasta `ephe/` na raiz do projeto:
 *   sepl_18.se1  (planetas)   semo_18.se1  (Lua)   seas_18.se1  (asteroides/Quíron)
 * Cobrem os anos 1800–2399. Caminho configurável via env SWEPH_PATH.
 */

/** Corpos calculados, na ordem tradicional do mapa. */
export const CORPOS = [
  { id: "sol", ipl: sweph.constants.SE_SUN, nome: "Sol" },
  { id: "lua", ipl: sweph.constants.SE_MOON, nome: "Lua" },
  { id: "mercurio", ipl: sweph.constants.SE_MERCURY, nome: "Mercúrio" },
  { id: "venus", ipl: sweph.constants.SE_VENUS, nome: "Vênus" },
  { id: "marte", ipl: sweph.constants.SE_MARS, nome: "Marte" },
  { id: "jupiter", ipl: sweph.constants.SE_JUPITER, nome: "Júpiter" },
  { id: "saturno", ipl: sweph.constants.SE_SATURN, nome: "Saturno" },
  { id: "urano", ipl: sweph.constants.SE_URANUS, nome: "Urano" },
  { id: "netuno", ipl: sweph.constants.SE_NEPTUNE, nome: "Netuno" },
  { id: "plutao", ipl: sweph.constants.SE_PLUTO, nome: "Plutão" },
  { id: "nodo", ipl: sweph.constants.SE_TRUE_NODE, nome: "Nodo Verdadeiro" },
  { id: "quiron", ipl: sweph.constants.SE_CHIRON, nome: "Quíron" },
] as const;

export interface Planeta extends PosicaoZodiacal {
  /** Identificador estável, ex.: 'sol', 'lua'. */
  id: string;
  nome: string;
  /** Velocidade em longitude, em graus/dia. Negativa = retrógrado. */
  velocidade: number;
  retrogrado: boolean;
  /** Latitude eclíptica em graus. */
  latitude: number;
  /** Distância à Terra em UA. */
  distancia: number;
}

// set_ephe_path só precisa ser chamado uma vez por processo.
let efemeridesInicializadas = false;
function garantirEfemerides(): void {
  if (efemeridesInicializadas) return;
  const pasta = process.env.SWEPH_PATH ?? path.join(process.cwd(), "ephe");
  sweph.set_ephe_path(pasta);
  efemeridesInicializadas = true;
}

/** Calcula as posições de todos os corpos em CORPOS para os dados de nascimento. */
export function calcularPlanetas(dados: DadosNatais): Planeta[] {
  garantirEfemerides();
  const jdUT = dadosParaJD(dados);
  // SWIEPH = usa os arquivos .se1 ; SPEED = também retorna velocidades (p/ retrógrado).
  // Sem flags extras, a posição é geocêntrica aparente no zodíaco tropical — igual à astro.com.
  const flags = sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;

  return CORPOS.map(({ id, ipl, nome }) => {
    const r = sweph.calc_ut(jdUT, ipl, flags);
    if (r.flag < 0) {
      throw new Error(`Falha ao calcular ${nome}: ${r.error}`);
    }
    const [longitude, latitude, distancia, velocidade] = r.data;
    return {
      id,
      nome,
      ...decompor(longitude),
      latitude,
      distancia,
      velocidade,
      retrogrado: velocidade < 0,
    };
  });
}
