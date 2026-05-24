"use server";

import * as sweph from "sweph";

/**
 * PASSO 1 — Cálculo das casas astrológicas.
 *
 * Recebe os dados de nascimento (data, hora local, fuso, coordenadas) e devolve
 * uma estrutura de dados com as 12 cúspides + ângulos (AC, MC, DC, IC, ARMC, Vertex).
 *
 * Engine: Swiss Ephemeris (a mesma usada pela Astrodienst/astro.com).
 * Não há aproximação — os valores batem ao segundo de arco com o astro.com.
 *
 * Convenções de coordenadas (padrão Swiss Ephemeris):
 *   - latitude:  Norte positivo, Sul negativo
 *   - longitude: Leste positivo, Oeste negativo
 */

/** Sistemas de casas suportados pelo Swiss Ephemeris (os mais usados). */
export type SistemaCasas =
  | "P" // Placidus  (padrão astro.com)
  | "K" // Koch
  | "O" // Porfírio
  | "R" // Regiomontanus
  | "C" // Campanus
  | "A" // Casas iguais (Equal)
  | "W"; // Signo inteiro (Whole sign)

export interface DadosNatais {
  ano: number; // ex.: 1984
  mes: number; // 1-12
  dia: number; // 1-31
  hora: number; // hora LOCAL, 0-23
  minuto: number; // 0-59
  segundo?: number; // 0-59 (opcional)
  /** Offset do fuso em horas, onde `local = UT + utcOffset`. Ex.: Brasília = -3. */
  utcOffset: number;
  /** Latitude em graus decimais. Sul negativo. Ex.: 28°28'S → -28.466667 */
  latitude: number;
  /** Longitude em graus decimais. Oeste negativo. Ex.: 49°00'25"W → -49.006944 */
  longitude: number;
  /** Sistema de casas. Padrão: Placidus ('P'). */
  sistemaCasas?: SistemaCasas;
}

/** Uma posição na eclíptica, decomposta em signo/grau/minuto/segundo. */
export interface PosicaoZodiacal {
  /** Longitude eclíptica absoluta, 0-360. */
  longitude: number;
  /** Índice do signo: 0=Áries ... 11=Peixes. */
  signoIndice: number;
  /** Nome do signo em português. */
  signo: string;
  /** Grau dentro do signo, 0-29. */
  grau: number;
  minuto: number;
  segundo: number;
}

export interface Cuspide extends PosicaoZodiacal {
  /** Número da casa, 1-12. */
  casa: number;
}

export interface ResultadoCasas {
  /** Julian Day em Tempo Universal (UT). */
  jdUT: number;
  sistema: SistemaCasas;
  /** As 12 cúspides, em ordem (casa 1 a 12). */
  cuspides: Cuspide[];
  ascendente: PosicaoZodiacal; // = cúspide da casa 1
  meioCeu: PosicaoZodiacal; // = cúspide da casa 10 (MC)
  descendente: PosicaoZodiacal; // = casa 7
  fundoCeu: PosicaoZodiacal; // = casa 4 (IC)
  /** Right Ascension of the Midheaven (ARMC), em graus. */
  armc: number;
  vertex: PosicaoZodiacal;
}

const SIGNOS = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"] as const;

const normalizar = (g: number): number => ((g % 360) + 360) % 360;

/** Decompõe uma longitude eclíptica (0-360) em signo/grau/minuto/segundo. */
function decompor(longitude: number): PosicaoZodiacal {
  const lon = normalizar(longitude);
  let signoIndice = Math.floor(lon / 30);
  const dentroDoSigno = lon - signoIndice * 30; // 0..30

  // Arredonda primeiro para segundos de arco inteiros, depois decompõe.
  // Isso evita os artefatos de "60 segundos" ou "60 minutos" no carry.
  let totalSeg = Math.round(dentroDoSigno * 3600);
  let grau = Math.floor(totalSeg / 3600);
  totalSeg -= grau * 3600;
  const minuto = Math.floor(totalSeg / 60);
  const segundo = totalSeg - minuto * 60;

  // Borda: arredondamento pode empurrar para 30°00'00" → vira 0° do signo seguinte.
  if (grau === 30) {
    grau = 0;
    signoIndice = (signoIndice + 1) % 12;
  }

  return { longitude: lon, signoIndice, signo: SIGNOS[signoIndice], grau, minuto, segundo };
}

/** Calcula as casas astrológicas a partir dos dados de nascimento. */
export async function calcularCasas(dados: DadosNatais): Promise<ResultadoCasas> {
  const sistema = dados.sistemaCasas ?? "P";

  // Converte hora local -> UT. julday aceita horas fora de [0,24): trata o
  // rollover de dia automaticamente, então a subtração simples é segura.
  const horaLocal = dados.hora + dados.minuto / 60 + (dados.segundo ?? 0) / 3600;
  const horaUT = horaLocal - dados.utcOffset;

  const jdUT = sweph.julday(dados.ano, dados.mes, dados.dia, horaUT, sweph.constants.SE_GREG_CAL);

  const res = sweph.houses(jdUT, dados.latitude, dados.longitude, sistema);
  if (res.flag < 0) {
    throw new Error(`Falha no cálculo de casas (sweph.houses retornou flag ${res.flag}).`);
  }

  const houses = res.data.houses; // [casa1, casa2, ..., casa12]
  const points = res.data.points; // [Asc, MC, ARMC, Vertex, ...]

  const cuspides: Cuspide[] = houses.map((lon, i) => ({ casa: i + 1, ...decompor(lon) }));

  return {
    jdUT,
    sistema,
    cuspides,
    ascendente: decompor(points[0]),
    meioCeu: decompor(points[1]),
    descendente: decompor(points[0] + 180),
    fundoCeu: decompor(points[1] + 180),
    armc: normalizar(points[2]),
    vertex: decompor(points[3]),
  };
}
