import { provideRouter, RouterModule,Routes } from '@angular/router';
import { SujetStageList} from './components/sujet-stage-list/sujet-stage-list';
import { SujetStageCreate } from './components/sujet-stage-create/sujet-stage-create';
import { SujetStageEdite } from './components/sujet-stage-edite/sujet-stage-edite';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { Footer } from './layout/footer/footer';
import { EntretienCreate } from './components/entretien-create/entretien-create';
import { AdminLayout } from './layout/admin-layout/admin-layout';


export const routes: Routes = [
  { path: 'entretien/create', component: EntretienCreate },
  { path: 'create', component: SujetStageCreate },
  { path: 'list', component: SujetStageList },
  { path: 'edite/:id', component: SujetStageEdite },
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
    ]
  }

    ];
export const appRouterProviders = [provideRouter(routes)];
