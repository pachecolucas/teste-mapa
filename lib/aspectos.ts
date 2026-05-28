/**
 * Aspectos astrológicos — cálculo puro.
 *
 * Um aspecto é uma relação angular entre dois corpos. Aqui modelamos os 5
 * clássicos. A diferença entre os ângulos é invariante quanto à referência
 * usada (absoluta ou relativa ao Ascendente), então o cálculo funciona
 * direto com os `grau` que já normalizamos no page.tsx.
 *
 * Este arquivo é "astrologia", não "tela": não conhece SVG, raios nem cores
 * de Tailwind. Ele só descreve o que é um aspecto e responde "este par de
 * graus forma algum aspecto?".
 */

export type TipoAspecto = "conjuncao" | "oposicao" | "trigono" | "quadratura" | "sextil";

export interface DefinicaoAspecto {
  tipo: TipoAspecto;
  /** Ângulo canônico do aspecto, em graus. */
  angulo: number;
  /** Tolerância (orbe) em graus dentro da qual o aspecto é considerado válido. */
  orbe: number;
  /** Cor em hex para o desenho. */
  cor: string;
  /** Se `false`, o aspecto é detectado nos dados mas não desenha linha. */
  desenhar: boolean;
}

/**
 * Definições dos 5 aspectos clássicos.
 *
 * Convenção de cor: vermelho = tenso (oposição, quadratura),
 * azul = harmônico (trígono, sextil), cinza = neutro (conjunção).
 *
 * A conjunção é detectada mas não desenhada: os dois pontos estão
 * praticamente no mesmo grau, a linha teria comprimento ~zero.
 */
export const DEFS_ASPECTOS: DefinicaoAspecto[] = [
  { tipo: "conjuncao", angulo: 0, orbe: 8, cor: "#6B7280", desenhar: false },
  { tipo: "oposicao", angulo: 180, orbe: 8, cor: "#DC2626", desenhar: true },
  { tipo: "trigono", angulo: 120, orbe: 7, cor: "#2563EB", desenhar: true },
  { tipo: "quadratura", angulo: 90, orbe: 10, cor: "#DC2626", desenhar: true },
  { tipo: "sextil", angulo: 60, orbe: 5, cor: "#2563EB", desenhar: true },
];

/** Menor arco entre dois ângulos no círculo (resolve o wrap em 360°). */
export function menorArco(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

/**
 * Devolve a definição do aspecto formado entre dois graus, ou `null` se
 * eles não formam nenhum aspecto reconhecido. Se duas definições casarem
 * (improvável com os orbes padrão), prevalece a primeira do array.
 */
export function getAspecto(grauA: number, grauB: number): DefinicaoAspecto | null {
  const arco = menorArco(grauA, grauB);
  for (const def of DEFS_ASPECTOS) {
    if (Math.abs(arco - def.angulo) <= def.orbe) return def;
  }
  return null;
}

/** Um par de planetas que forma um aspecto, já com os graus para desenho. */
export interface Aspecto {
  /** ids dos dois planetas (úteis para tooltip / debug). */
  idA: string;
  idB: string;
  tipo: TipoAspecto;
  cor: string;
  /** Graus dos pontos a conectar (relativos ao Ascendente). */
  graus: [number, number];
  /** Se `false`, está nos dados mas não deve desenhar linha. */
  desenhar: boolean;
}

/**
 * Calcula todos os aspectos entre uma lista de corpos.
 * Percorre pares (i < j) para não duplicar.
 */
export function calcularAspectos(corpos: { id: string; grau: number }[]): Aspecto[] {
  const aspectos: Aspecto[] = [];
  for (let i = 0; i < corpos.length; i++) {
    for (let j = i + 1; j < corpos.length; j++) {
      const def = getAspecto(corpos[i].grau, corpos[j].grau);
      if (!def) continue;
      aspectos.push({
        idA: corpos[i].id,
        idB: corpos[j].id,
        tipo: def.tipo,
        cor: def.cor,
        graus: [corpos[i].grau, corpos[j].grau],
        desenhar: def.desenhar,
      });
    }
  }
  return aspectos;
}
