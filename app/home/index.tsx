import { calcularCasas, type DadosNatais } from "../../lib/casas";

export default async function Home() {
  // Dados EXATOS da imagem (Lucas Pacheco, Tubarão/SC):
  // Sa., 1 December 1984, 9:10 a.m. local — Univ.Time 12:10 (offset -3)
  // 49w00'25 = lon -49.006944 ; 28s28 = lat -28.466667
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

  const r = await calcularCasas(entrada);

  console.log({ r });

  // const f = (p: { signo: string; grau: number; minuto: number; segundo: number }) =>
  //   `${String(p.grau).padStart(2)}° ${p.signo.padEnd(11)} ${String(p.minuto).padStart(2, "0")}'${String(p.segundo).padStart(2, "0")}"`;

  // console.log("JD (UT):", r.jdUT, "\n");

  // // Valores da imagem (arredondados ao minuto) para comparação
  // const esperado: Record<number, string> = {
  //   1: "2 Aqu 50'",
  //   2: "26 Aqu 28'",
  //   3: "23 Pis 58'",
  //   10: "25 Lib 55'",
  //   11: "0 Sag 02'",
  //   12: "2 Cap 49'",
  // };

  // console.log("CASA | CALCULADO                    | IMAGEM");
  // for (const c of r.cuspides) {
  //   const img = esperado[c.casa] ?? "—";
  //   console.log(`  ${String(c.casa).padStart(2)} | ${f(c)}  | ${img}`);
  // }
  // console.log("\nAC  :", f(r.ascendente));
  // console.log("MC  :", f(r.meioCeu));
  // console.log("DC  :", f(r.descendente));
  // console.log("IC  :", f(r.fundoCeu));
  // const armcH = r.armc / 15;
  // const hh = Math.floor(armcH),
  //   mm = Math.floor((armcH - hh) * 60),
  //   ss = Math.round(((armcH - hh) * 60 - mm) * 60);
  // console.log(`Sid.Time (ARMC): ${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}  | imagem: 13:36:06`);

  return <div>Fazer aqui</div>;
}
