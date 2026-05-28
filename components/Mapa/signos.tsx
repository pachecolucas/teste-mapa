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

import { Casa, Planeta } from "./types";
import type { Aspecto } from "@/lib/aspectos";

const V = 400; // sistema de coordenadas interno (viewBox)
const cx = V / 2;
const cy = V / 2;
const rExterno = V / 2 - 4;
const rCentro = rExterno - 40; // círculo que tampa o miolo
const rSimbolo = (rExterno + rCentro) / 2; // ícone no meio da faixa
const rPlaneta = 138; // raio onde o glifo do planeta é desenhado
const rLinhaExternaIni = rCentro; // 156 — borda interna da faixa dos signos
const rLinhaExternaFim = 148; // pára antes do glifo (gap de 10)
const rLinhaInternaIni = 128; // começa depois do glifo (gap de 10)
const rLinhaInternaFim = 118; // ponto-âncora p/ aspectos no futuro

const grausParaRad = (g: number): number => (g * Math.PI) / 180;

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
  casas: Casa[];
  planetas: Planeta[];
  aspectos: Aspecto[];
  longitude: number;
}

export default function RodaZodiaco({ casas, planetas, aspectos, className, longitude }: RodaZodiacoProps) {
  return (
    <svg viewBox={`0 0 ${V} ${V}`} className={`h-auto w-full select-none ${className ?? ""}`} role="img" aria-label="Roda zodiacal com os doze signos">
      {/* Cada signo: a fatia-base + o ícone, girados juntos.
          O ângulo inicial soma na rotação, empurrando tudo anti-horário. */}
      {signos.map((s, i) => (
        <g key={s.id} transform={`rotate(${-(longitude + 30 * i)} ${cx} ${cy})`}>
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

      {/* Números das casas, no meio de cada casa, junto ao centro */}
      {casas.map((c, i) => {
        const p = pos(37, meioDaCasa(casas, i));
        return (
          <text key={`num-${c.numero}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="fill-neutral-500 text-[8px]">
            {c.numero}
          </text>
        );
      })}

      {/* Aspectos: linhas no miolo conectando os pontos-âncora dos planetas
          (ponta interna das linhas-marcador). Desenhados antes dos glifos
          para que os planetas fiquem por cima. */}
      {aspectos
        .filter((a) => a.desenhar)
        .map((a, i) => {
          const p1 = pos(rLinhaInternaFim, a.graus[0]);
          const p2 = pos(rLinhaInternaFim, a.graus[1]);
          return <line key={`asp-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={a.cor} strokeWidth={0.8} />;
        })}

      {/* Planetas: glifo no anel interno (rPlaneta), sem rotação radial.
          Cada planeta vem com duas linhas-marcador radiais (externa e interna)
          na mesma cor, indicando o grau exato e ladeando o glifo. */}
      {planetas.map((p) => {
        const pt = pos(rPlaneta, p.grau);
        const linhaExt = getSegmentoRadial(p.grau, rLinhaExternaIni, rLinhaExternaFim);
        const linhaInt = getSegmentoRadial(p.grau, rLinhaInternaIni, rLinhaInternaFim);
        return (
          <g key={`pl-${p.id}`}>
            <line x1={linhaExt.p1.x} y1={linhaExt.p1.y} x2={linhaExt.p2.x} y2={linhaExt.p2.y} stroke={p.cor} strokeWidth={1} />
            <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="central" fill={p.cor} className="text-[14px]">
              {p.icone}
            </text>
            <line x1={linhaInt.p1.x} y1={linhaInt.p1.y} x2={linhaInt.p2.x} y2={linhaInt.p2.y} stroke={p.cor} strokeWidth={1} />
          </g>
        );
      })}

      {/* Borda externa */}
      <circle cx={cx} cy={cy} r={rExterno} className="fill-none stroke-neutral-300" strokeWidth={1} />

      {/* Círculo central que cobre os miolos das fatias */}
      <circle cx={cx} cy={cy} r={30} className="fill-white stroke-neutral-300" strokeWidth={1} />
    </svg>
  );
}

/** Ponto sobre o círculo: ângulo 0 fica à esquerda (9 h), cresce anti-horário.
 *  Arredonda para 3 casas: evita hydration mismatch (servidor e navegador
 *  arredondam o último bit de cos/sin de forma levemente diferente). */
function pos(raio: number, angulo: number) {
  const a = grausParaRad(angulo);
  const arredonda = (n: number) => Math.round(n * 1000) / 1000;
  return { x: arredonda(cx - raio * Math.cos(a)), y: arredonda(cy + raio * Math.sin(a)) };
}

/** Fatia de pizza (do centro à borda) entre dois ângulos. */
function getFatia(longitude: number): string {
  const p1 = pos(rExterno, longitude);
  const p2 = pos(rExterno, longitude + 30);
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

/**
 * Segmento radial entre dois raios no mesmo ângulo. Como ambos os pontos
 * compartilham o ângulo, o segmento é perfeitamente radial (aponta para o
 * centro). Usado para as linhas-marcador dos planetas: uma do signo até
 * antes do glifo, outra depois do glifo descendo em direção ao centro.
 */
function getSegmentoRadial(angulo: number, r1: number, r2: number) {
  return { p1: pos(r1, angulo), p2: pos(r2, angulo) };
}

/** Ângulo do meio da casa i (entre sua cúspide e a da próxima), tratando o wrap dos 360°. */
function meioDaCasa(casas: Casa[], i: number): number {
  const a1 = casas[i].grau;
  let a2 = casas[(i + 1) % casas.length].grau;
  if (a2 < a1) a2 += 360; // desfaz o wrap (a casa 12 vai de ~330 até ~360/0)
  return ((a1 + a2) / 2) % 360;
}
