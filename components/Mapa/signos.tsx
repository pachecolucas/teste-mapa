/**
 * Roda zodiacal — 12 signos por rotação de uma fatia-base.
 *
 * Em vez de recalcular 12 paths, desenhamos UMA fatia-base (Áries, 0°–30°) e a
 * giramos com transform="rotate(-30·i, cx, cy)". O ícone vai DENTRO do mesmo
 * grupo, então herda a rotação: pré-rotacionado para a orientação radial de
 * Áries, ele fica corretamente orientado em todas as posições. Resultado: o
 * "topo" do glifo sempre aponta para fora, e os de baixo ficam de cabeça para
 * baixo (centro de gravidade voltado ao centro da roda).
 *
 * Sentido SVG: rotate(+) é horário (Y para baixo); nossa roda cresce anti-
 * horário, então giramos por -30·i.
 */

import { Casa } from "./types";

const V = 400; // sistema de coordenadas interno (viewBox)
const cx = V / 2;
const cy = V / 2;
const rExterno = V / 2 - 4;
const rCentro = rExterno - 40; // círculo que tampa o miolo
const rSimbolo = (rExterno + rCentro) / 2; // ícone no meio da faixa

const grausParaRad = (g: number): number => (g * Math.PI) / 180;

/** Ponto sobre o círculo: ângulo 0 fica à esquerda (9 h), cresce anti-horário. */
function pos(raio: number, angulo: number) {
  const a = grausParaRad(angulo);
  return { x: cx - raio * Math.cos(a), y: cy + raio * Math.sin(a) };
}

/** Fatia de pizza (do centro à borda) entre dois ângulos. */
function getFatia(anguloInicial: number): string {
  const p1 = pos(rExterno, anguloInicial);
  const p2 = pos(rExterno, anguloInicial + 30);
  return `M ${cx} ${cy} L ${p1.x.toFixed(3)} ${p1.y.toFixed(3)} ` + `A ${rExterno} ${rExterno} 0 0 0 ${p2.x.toFixed(3)} ${p2.y.toFixed(3)} Z`;
}

function getLinhaDecanato(grausDentroDoSigno: number, distanciaDaBordaExterna: number) {
  // ponto inicial: perto da borda externa
  const p1 = pos(rExterno - distanciaDaBordaExterna, grausDentroDoSigno);

  // ponto final: centro absoluto da roda
  const p2 = {
    x: cx,
    y: cy,
  };

  return { p1, p2 };
}

/**
 * Linha radial que sai do centro da roda e para na borda interna da faixa dos
 * signos (rCentro) — ou seja, antes de encontrar a parte periférica colorida.
 * `angulo` posiciona/rotaciona a linha na convenção da roda (0 = 9 h, anti-horário).
 */
function getLinhaCentral(angulo: number) {
  const p1 = { x: cx, y: cy }; // centro da roda
  const p2 = pos(rCentro, angulo); // borda interna da faixa
  return { p1, p2 };
}

// Geometria-base, calculada uma única vez.
const FATIA_BASE = getFatia(0);
const ICONE_BASE = pos(rSimbolo, 15); // meio da fatia de Áries
const ICONE_ROT_BASE = -(90 + 15); // glifo "para cima" apontando radialmente para fora

const signos = [
  { id: 1, nome: "Áries", icone: "♈", fundo: "fill-amber-400" },
  { id: 2, nome: "Touro", icone: "♉", fundo: "fill-red-400" },
  { id: 3, nome: "Gêmeos", icone: "♊", fundo: "fill-blue-400" },
  { id: 4, nome: "Câncer", icone: "♋", fundo: "fill-green-400" },
  { id: 5, nome: "Leão", icone: "♌", fundo: "fill-amber-400" },
  { id: 6, nome: "Virgem", icone: "♍", fundo: "fill-red-400" },
  { id: 7, nome: "Libra", icone: "♎", fundo: "fill-blue-400" },
  { id: 8, nome: "Escorpião", icone: "♏", fundo: "fill-green-400" },
  { id: 9, nome: "Sagitário", icone: "♐", fundo: "fill-amber-400" },
  { id: 10, nome: "Capricórnio", icone: "♑", fundo: "fill-red-400" },
  { id: 11, nome: "Aquário", icone: "♒", fundo: "fill-blue-400" },
  { id: 12, nome: "Peixes", icone: "♓", fundo: "fill-green-400" },
];

interface RodaZodiacoProps {
  /** Classes do container que controlam o tamanho na tela. */
  className?: string;
  /**
   * Ângulo (graus, 0–360) onde Áries começa. Ao crescer, Áries — e todos os
   * demais signos atrás dele — se movem no sentido anti-horário. Padrão 0
   * (Áries em 9 h). Aqui é onde, no futuro, entra a longitude do Ascendente.
   */
  anguloInicial?: number;
  casas: Casa[];
}

export default function RodaZodiaco({ casas, className, anguloInicial = 0 }: RodaZodiacoProps) {
  return (
    <svg viewBox={`0 0 ${V} ${V}`} className={`h-auto w-full select-none ${className ?? ""}`} role="img" aria-label="Roda zodiacal com os doze signos">
      {/* Cada signo: a fatia-base + o ícone, girados juntos.
          O ângulo inicial soma na rotação, empurrando tudo anti-horário. */}
      {signos.map((s, i) => (
        <g key={s.id} transform={`rotate(${-(anguloInicial + 30 * i)} ${cx} ${cy})`}>
          <path d={FATIA_BASE} className={s.fundo} />

          {/* símbolo */}
          <text
            x={ICONE_BASE.x}
            y={ICONE_BASE.y}
            transform={`rotate(${ICONE_ROT_BASE} ${ICONE_BASE.x} ${ICONE_BASE.y})`}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-[18px]"
          >
            {s.icone}
          </text>

          {/* decanatos */}
          {[10, 20].map((g) => {
            const linha = getLinhaDecanato(g, 32);
            return <line key={g} x1={linha.p1.x} y1={linha.p1.y} x2={linha.p2.x} y2={linha.p2.y} className="stroke-white" strokeWidth={0.5} />;
          })}
          {[5, 15, 25].map((g) => {
            const linha = getLinhaDecanato(g, 35);
            return <line key={g} x1={linha.p1.x} y1={linha.p1.y} x2={linha.p2.x} y2={linha.p2.y} className="stroke-white/70" strokeWidth={0.5} />;
          })}
        </g>
      ))}

      {/* Círculo central que cobre os miolos das fatias */}
      <circle cx={cx} cy={cy} r={rCentro} className="fill-white" />

      {/* Casas: do centro até a borda interna da faixa. */}
      {casas.map((c) => {
        const l = getLinhaCentral(c.grau);
        console.log("CASA:", c.numero, c.grau);
        return <line key={c.numero} x1={l.p1.x} y1={l.p1.y} x2={l.p2.x} y2={l.p2.y} className="stroke-neutral-300" strokeWidth={c.nome ? 2 : 1} />;
      })}

      {/* Borda externa */}
      <circle cx={cx} cy={cy} r={rExterno} className="fill-none stroke-neutral-300" strokeWidth={1} />

      {/* Círculo central que cobre os miolos das fatias */}
      <circle cx={cx} cy={cy} r={30} className="fill-white stroke-neutral-300" strokeWidth={1} />
    </svg>
  );
}
