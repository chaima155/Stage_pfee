import { Candidate } from './candidate';
import { SujetStage } from './sujet-stage';

export interface Candidature {
    id?: number;
    statut: string;
    typeEntretien: string;
    commentaireAI?: string;
    scoreAI?: number;
    candidate: Candidate;
    sujetStage: SujetStage;
}
