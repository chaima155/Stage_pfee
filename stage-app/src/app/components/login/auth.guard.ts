import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  // ✅ Sauvegarder l'ID du sujet pour rediriger après login
  const sujetId = route.paramMap.get('id');
  if (sujetId) {
    localStorage.setItem('redirectSujetId', sujetId);
  }

  return router.createUrlTree(['/login']);
};