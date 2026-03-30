import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResponsableService, Responsable } from '../../services/responsable';



@Component({
  selector: 'app-responsable-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './responsable-update.html',
  styleUrl: './responsable-update.css',
})
export class ResponsableUpdate implements OnInit {
  // ===== PROPERTIES =====

  responsable: Responsable = {
    email: '',
    nom: '',
    prenom: '',
    poste: '',
    service: '',
    department: '',
    photo: null,
  };

  responsablePhoto: string | null = null;
  selectedFile: File | null = null;
  photoTimestamp: number = 0;
  newPassword: string = '';
  confirmPassword: string = '';

  successMessage: string = '';
  errorMessage: string = '';

  isLoading: boolean = false;
  isDeleting: boolean = false;

  constructor(private responsableService: ResponsableService) {}

  ngOnInit(): void {
    console.log('✓ ResponsableUpdate component loaded');
    this.loadResponsableData();
  }

  // ===== LOAD DATA =====

  /**
   * Load current responsable data
   */
  private loadResponsableData(): void {
    this.isLoading = true;
    console.log('📍 Loading responsable data...');

    this.responsableService.getCurrentResponsable().subscribe({
      next: (data) => {
        console.log('✓ Responsable data loaded:', data);
        this.responsable = data;

        // Load photo if exists - with cache busting
        if (data.photo) {
          this.photoTimestamp = new Date().getTime();
          // 👈 PASS THE TIMESTAMP TO getPhotoUrl()
          this.responsablePhoto = this.responsableService.getPhotoUrl(data.photo, this.photoTimestamp);
          console.log('✓ Photo URL:', this.responsablePhoto);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('✗ Error loading responsable data:', err);
        this.errorMessage = 'Failed to load profile data';
        this.isLoading = false;
      },
    });
  }

  // ===== PROFILE UPDATE =====

  /**
   * Update responsable profile
   */
  updateProfile(): void {
    if (!this.responsable.id) {
      console.error('❌ No responsable ID');
      this.errorMessage = 'Error: Unable to update profile';
      return;
    }

    console.log('📝 Updating profile...');
    this.isLoading = true;

    this.responsableService.updateResponsable(this.responsable.id, this.responsable).subscribe({
      next: (updated) => {
        console.log('✓ Profile updated successfully:', updated);
        this.responsable = updated;
        this.successMessage = 'Profile updated successfully!';
        this.errorMessage = '';
        this.isLoading = false;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('✗ Error updating profile:', err);
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.isLoading = false;
      },
    });
  }

  // ===== PHOTO MANAGEMENT =====

  /**
   * Handle photo file selection
   */
  onPhotoSelected(event: any): void {
    const file: File = event.target.files[0];

    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('📷 Photo selected:', file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file (JPG, PNG, etc.)';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size exceeds 5MB limit';
      return;
    }

    this.selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.responsablePhoto = e.target.result;
      console.log('✓ Photo preview loaded');
    };
    reader.readAsDataURL(file);
  }

  /**
   * Upload selected photo
   */
  uploadPhoto(): void {
    if (!this.selectedFile || !this.responsable.id) {
      this.errorMessage = 'No file selected or unable to get responsable ID';
      return;
    }

    console.log('⬆️ Uploading photo...');
    this.isLoading = true;

    const formData = new FormData();
    formData.append('photo', this.selectedFile);

    this.responsableService.updatePhoto(this.responsable.id, formData).subscribe({
      next: (updated) => {
        console.log('✓ Photo uploaded successfully:', updated);
        this.responsable = updated;
        this.successMessage = 'Photo uploaded successfully!';
        this.errorMessage = '';
        this.selectedFile = null;
        this.isLoading = false;

        // Update photo URL with NEW timestamp
        if (updated.photo) {
          this.photoTimestamp = new Date().getTime(); // 👈 NEW TIMESTAMP
          // 👈 PASS THE TIMESTAMP TO getPhotoUrl()
          this.responsablePhoto = this.responsableService.getPhotoUrl(updated.photo, this.photoTimestamp);
          console.log('✓ New photo URL with cache buster:', this.responsablePhoto);
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('✗ Error uploading photo:', err);
        this.errorMessage = 'Failed to upload photo. Please try again.';
        this.selectedFile = null;
        this.isLoading = false;
      },
    });
  }

  // ===== PASSWORD CHANGE =====

  /**
   * Change password
   */
  changePassword(): void {
    if (!this.responsable.id) {
      console.error('❌ No responsable ID');
      this.errorMessage = 'Error: Unable to change password';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please enter a password';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    console.log('🔐 Changing password...');
    this.isLoading = true;

    this.responsableService.changePassword(this.responsable.id, this.newPassword).subscribe({
      next: () => {
        console.log('✓ Password changed successfully');
        this.successMessage = 'Password changed successfully!';
        this.errorMessage = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.isLoading = false;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('✗ Error changing password:', err);
        this.errorMessage = 'Failed to change password. Please try again.';
        this.isLoading = false;
      },
    });
  }

  // ===== ACCOUNT DELETION =====

  /**
   * Delete account
   */
  deleteAccount(): void {
    if (!this.responsable.id) {
      console.error('❌ No responsable ID');
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    console.log('🗑️ Deleting account...');
    this.isDeleting = true;

    this.responsableService.deleteResponsable(this.responsable.id).subscribe({
      next: () => {
        console.log('✓ Account deleted successfully');
        this.successMessage = 'Account deleted successfully. Redirecting...';
        this.isDeleting = false;

        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      },
      error: (err) => {
        console.error('✗ Error deleting account:', err);
        this.errorMessage = 'Failed to delete account. Please try again.';
        this.isDeleting = false;
      },
    });
  }

  // ===== UTILITY METHODS =====

  /**
   * Clear messages
   */
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}