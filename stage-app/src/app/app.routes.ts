import { Routes } from '@angular/router';
import { Stage } from './pages/stage/stage';
import { authGuard } from './components/login/auth.guard';
import { Home } from './home/home';
import { CandidateFormComponent } from './components/candidate-form/candidate-form';
import { ResponsableForm } from './components/responsable-form/responsable-form';
import { LoginComponent } from './components/login/login';
import { MySpaceComponent } from './components/my-space/my-space';
import { Contact } from './components/contact/contact';

export const routes: Routes = [
  { path: 'contact', component: Contact },
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'stages', component: Stage },
  { path: 'register-candidate', component: CandidateFormComponent },
  { path: 'register-responsable', component: ResponsableForm },
  { path: 'login', component: LoginComponent },
  { path: 'my-space', component: MySpaceComponent, canActivate: [authGuard] },
];