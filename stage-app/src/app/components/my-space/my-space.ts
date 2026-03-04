import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Candidate as UserProfile } from '../../models/candidate';
import { take } from 'rxjs/internal/operators/take';

@Component({
    selector: 'app-my-space',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './my-space.html',
    styleUrls: ['./my-space.css'],
})
export class MySpaceComponent implements OnInit {
    user: UserProfile | null = null;
    isEditing = false;
    isLoading = true;
    isSaving = false;
    successMessage = '';
    errorMessage = '';

    editNom = '';
    editPrenom = '';
    editEmail = '';
    editTelephone = '';
    editUniversite = '';
    editDiplome = '';
    editAnneeDiplome = '';
    editInformations = '';
    editPaysResidence = '';
    selectedPhoto: File | null = null;
    photoPreview: string | null = null;
    selectedCv: File | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.authService.currentUser$.pipe(take(1)).subscribe(user => { 
            if (!user) {
                this.router.navigate(['/login']);
                return;
            }
            this.user = user;
            this.isLoading = false;

            this.authService.getUserById(user.id!).subscribe({
                next: (freshUser) => {
                    if (this.authService.isLoggedIn()) {
                        this.user = freshUser;
                        this.authService.updateUserSession(freshUser);
                    }
                },
                error: () => { }
            }); 
        });
    }

    getCvUrl(): string {
        return this.user?.CV ? this.authService.getCvUrl(this.user.CV) : '';
    }
    getPhotoUrl(): string {
        if (this.photoPreview) return this.photoPreview;
        if (this.user?.photo) return this.authService.getPhotoUrl(this.user.photo);
        return '';
    }

    hasPhoto(): boolean {
        return !!this.photoPreview || !!this.user?.photo;
    }

    getInitials(): string {
        if (!this.user) return '?';
        const first = this.user.prenom?.charAt(0) || '';
        const last = this.user.nom?.charAt(0) || '';
        return (first + last).toUpperCase();
    }

    startEditing() {
        if (this.user) {
            this.editNom = this.user.nom || '';
            this.editPrenom = this.user.prenom || '';
            this.editEmail = this.user.email || '';
            this.editTelephone = this.user.telephone || '';
            this.editUniversite = this.user.universite || '';
            this.editDiplome = this.user.diplome || '';
            this.editAnneeDiplome = this.user.anneeDiplome || '';
            this.editInformations = this.user.informations || '';
            this.editPaysResidence = this.user.paysResidence || '';
            this.selectedPhoto = null;
            this.photoPreview = null;
            this.selectedCv = null;
            this.successMessage = '';
            this.errorMessage = '';
        }
        this.isEditing = true;
    }

    cancelEditing() {
        this.isEditing = false;
        this.selectedPhoto = null;
        this.photoPreview = null;
        this.selectedCv = null;
        this.errorMessage = '';
    }

    onPhotoSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                this.errorMessage = 'Format invalide. JPG, PNG, GIF ou WEBP uniquement.';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                this.errorMessage = 'La photo ne doit pas dépasser 5 Mo.';
                return;
            }
            this.selectedPhoto = file;
            this.errorMessage = '';
            const reader = new FileReader();
            reader.onload = () => { this.photoPreview = reader.result as string; };
            reader.readAsDataURL(file);
        }
    }

    onCvSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            if (!allowedTypes.includes(file.type)) {
                this.errorMessage = 'Format invalide. PDF, DOC ou DOCX uniquement.';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                this.errorMessage = 'Le CV ne doit pas dépasser 10 Mo.';
                return;
            }
            this.selectedCv = file;
            this.errorMessage = '';
        }
    }

    saveProfile() {
        if (!this.user) return;

        this.isSaving = true;
        this.successMessage = '';
        this.errorMessage = '';

        const formData = new FormData();
        if (this.editNom) formData.append('nom', this.editNom);
        if (this.editPrenom) formData.append('prenom', this.editPrenom);
        if (this.editEmail) formData.append('email', this.editEmail);
        if (this.editTelephone) formData.append('telephone', this.editTelephone);
        if (this.editUniversite) formData.append('universite', this.editUniversite);
        if (this.editDiplome) formData.append('diplome', this.editDiplome);
        if (this.editAnneeDiplome) formData.append('anneeDiplome', this.editAnneeDiplome);
        if (this.editInformations) formData.append('informations', this.editInformations);
        if (this.editPaysResidence) formData.append('paysResidence', this.editPaysResidence);
        if (this.selectedPhoto) formData.append('photo', this.selectedPhoto);
        if (this.selectedCv) formData.append('cv', this.selectedCv);

        this.authService.updateProfile(this.user.id!, formData).subscribe({
            next: (updatedUser) => {
                this.user = updatedUser;
                this.isSaving = false;
                this.isEditing = false;
                this.selectedPhoto = null;
                this.photoPreview = null;
                this.selectedCv = null;
                this.successMessage = 'Profil mis à jour avec succès !';
                setTimeout(() => this.successMessage = '', 4000);
            },
            error: (err) => {
                this.isSaving = false;
                this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du profil';
            }
        });
    }

    // ✅ No 'role' in Candidate — returns fixed badge
    getRoleBadge(): string {
        return 'Candidat';
    }
}