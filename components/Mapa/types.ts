export type Casa = {
  numero: number;
  grau: number;
  nome: "AC" | "IC" | "DC" | "MC" | null;
};

export interface Planeta {
  id: string;
  cor: string;
  nome: string;
  icone: string;
  grau: number;
  retrogrado: boolean;
}
