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
}

export default function RodaZodiaco({ className, anguloInicial = 0 }: RodaZodiacoProps) {
  return (
    <svg viewBox={`0 0 ${V} ${V}`} className={`h-auto w-full select-none ${className ?? ""}`} role="img" aria-label="Roda zodiacal com os doze signos">
      {/* Cada signo: a fatia-base + o ícone, girados juntos.
          O ângulo inicial soma na rotação, empurrando tudo anti-horário. */}
      {signos.map((s, i) => (
        <g key={s.id} transform={`rotate(${-(anguloInicial + 30 * i)} ${cx} ${cy})`}>
          <path d={FATIA_BASE} className={s.fundo} />
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
        </g>
      ))}

      {/* Círculo central que cobre os miolos das fatias */}
      <circle cx={cx} cy={cy} r={rCentro} className="fill-white" />

      {/* Borda externa */}
      <circle cx={cx} cy={cy} r={rExterno} className="fill-none stroke-neutral-300" strokeWidth={1} />
    </svg>
  );
}
