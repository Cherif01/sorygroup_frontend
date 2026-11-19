import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from '../shared/layouts/module-layout/module-layout.component';
import { MON_ESPACE_MENU } from './mon-espace.menu';

import { MeCompteComponent } from './pages/compte/compte.component';
import { MeLivraisonsComponent } from './pages/livraisons/livraisons.component';
import { MePaiementsComponent } from './pages/paiements/paiements.component';
import { MeAvancesComponent } from './pages/avances/avances.component';
import { MeChampsComponent } from './pages/champs/champs.component';

export const MON_ESPACE_ROUTES: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    data: { menu: MON_ESPACE_MENU },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'compte' },
      { path: 'compte', title: 'Mon compte', component: MeCompteComponent },
      { path: 'livraisons', title: 'Mes livraisons', component: MeLivraisonsComponent },
      { path: 'paiements', title: 'Mes paiements', component: MePaiementsComponent },
      { path: 'avances', title: 'Mes avances', component: MeAvancesComponent },
      { path: 'champs', title: 'Mes champs', component: MeChampsComponent },
    ],
  },
];
