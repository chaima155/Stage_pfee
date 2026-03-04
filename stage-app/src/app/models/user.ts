export interface UserProfile {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    sexes: string;
    photo: string | null;
    role: string;
}
