import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AvisService {
  gradients = [
    'linear-gradient(to right, #ff7e5f, #feb47b)',
    'linear-gradient(to right, #6a11cb, #2575fc)',
    'linear-gradient(to right, #00c6ff, #0072ff)',
    'linear-gradient(to right, #ff512f, #dd2476)',
    'linear-gradient(to right, #ffb6c1, #ff69b4)',
    'linear-gradient(to right, #43cea2, #185a9d)',
    'linear-gradient(to right, #f7971e, #ffd200)',
  ];

  avisList: { nom: string; text: string; rating: number; gradient: string }[] = [
    { nom: 'Ahmed, Étudiant IT', text: "Grâce à StageManager, j'ai trouvé mon stage rapidement et facilement.", rating: 5, gradient: this.gradients[0] },
    { nom: 'Sara, Étudiante Génie Logiciel', text: 'Une plateforme claire, simple et très pratique pour suivre mon PFE.', rating: 4, gradient: this.gradients[1] },
    { nom: 'Youssef, Étudiant Réseaux', text: 'Le suivi avec mon encadrant est devenu beaucoup plus organisé.', rating: 5, gradient: this.gradients[2] },
    { nom: 'Lina, Étudiante IT', text: "StageManager m'a permis de postuler et suivre mes candidatures facilement.", rating: 4, gradient: this.gradients[3] },
    { nom: 'Karim, Étudiant Génie Logiciel', text: 'Une interface simple et intuitive pour gérer les stages.', rating: 5, gradient: this.gradients[4] },
  ];

addAvis(nom: string, text: string, rating: number) {
    const gradient = this.gradients[this.avisList.length % this.gradients.length];
    
    // ✅ Check if this person already submitted an avis
    const existingIndex = this.avisList.findIndex(
        a => a.nom.toLowerCase() === nom.toLowerCase()
    );

    if (existingIndex !== -1) {
        // ✅ Update existing avis
        this.avisList[existingIndex] = {
            ...this.avisList[existingIndex],
            text,
            rating
        };
    } else {
        // ✅ Add new avis
        this.avisList.push({ nom, text, rating, gradient });
    }
}
}