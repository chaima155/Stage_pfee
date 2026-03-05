export class SujetStage {
  id?: number;          // ? car optionnel lors de la création
  titre!: string;
  description!: string;
  motsCles!: string;
  nbrStagiaires!: number;
  niveau!: string;
  duree!: number;
  technologies!: string;
  dateposte?: string;
  entretien?: { id: number; date: string }[];
}
