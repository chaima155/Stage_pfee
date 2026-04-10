import { provideRouter, RouterModule,Routes } from '@angular/router';
import { SujetStageList} from './components/sujet-stage-list/sujet-stage-list';
import { SujetStageCreate } from './components/sujet-stage-create/sujet-stage-create';
import { SujetStageEdite } from './components/sujet-stage-edite/sujet-stage-edite';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { Footer } from './layout/footer/footer';
import { EntretienCreate } from './components/entretien-create/entretien-create';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { CandidatureCreate } from './components/candidature-create/candidature-create';
import { ChoisirDate } from './components/choisir-date/choisir-date';
import { Contact } from './components/contact/contact';
import { Home } from './home/home';
import { Stage } from './pages/stage/stage';
import { LoginComponent } from './components/login/login';
import { CandidateFormComponent } from './components/candidate-form/candidate-form';
import { ResponsableForm } from './components/responsable-form/responsable-form';
import { authGuard } from './components/login/auth.guard';
import { MySpaceComponent } from './components/my-space/my-space';
import { StageDetail } from './pages/stage-detail/stage-detail';
import { EntretienList } from './components/entretien-list/entretien-list';
import { VideoCall } from './components/video-call/video-call';
import { CandidatureList } from './components/candidature-list/candidature-list';
import { ResponsableUpdate } from './components/responsable-update/responsable-update';
import { VerifyEmailComponent } from './components/verify-email/verify-email';


export const routes: Routes = [
  { path: 'contact', component: Contact },
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'stages', component: Stage },
  { path: 'stages/:id', component: StageDetail },
  { path: 'register-candidate', component: CandidateFormComponent },
  { path: 'register-responsable', component: ResponsableForm },
  { path: 'login', component: LoginComponent },
  { path: 'my-space', component: MySpaceComponent, canActivate: [authGuard] },

  // ✅ Protégé — candidat doit être connecté pour postuler
  { path: 'candidature/create/:id', component: CandidatureCreate, canActivate: [authGuard] },

  { path: 'choisir-date', component: ChoisirDate },
  { path: 'video-call', component: VideoCall },
  { path: 'verify-email', component: VerifyEmailComponent },
  {
    path: 'dashbord',
    component: AdminLayout,
    children: [
      { path: 'create', component: SujetStageCreate },
      { path: 'list', component: SujetStageList },
      { path: 'edite/:id', component: SujetStageEdite },
      { path: 'header', component: Header},
      { path: 'sidebar', component: Sidebar},
      { path: 'footer', component: Footer},
      { path: 'entretien/create', component: EntretienCreate },
      { path: 'entretien/list', component: EntretienList },
      { path: 'candidature/list', component: CandidatureList },
      { path: 'responsable-edite', component: ResponsableUpdate }
    ]
  }
];

export const appRouterProviders = [provideRouter(routes)];