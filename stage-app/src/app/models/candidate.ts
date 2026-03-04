export interface Candidate {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    sexes: string;
    universite: string;
    diplome: string;
    anneeDiplome: string;
    informations: string;
    dateNaissance: string | Date;
    telephone: string;
    paysResidence: string;
    photo?: string | null;
    role?: string;
    CV?: string;
}
