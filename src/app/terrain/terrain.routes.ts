import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from '../shared/layouts/module-layout/module-layout.component';
import { TERRAIN_MENU } from './terrain.menu';

import { TeProducteursComponent } from './pages/producteurs/producteurs.component';
import { TeChampsComponent } from './pages/champs/champs.component';
import { TeVisitesComponent } from './pages/visites/visites.component';
import { TeCarteComponent } from './pages/carte/carte.component';
import { TePeseesComponent } from './pages/pesees/pesees.component';
import { TeRecusComponent } from './pages/recus/recus.component';
import { TeEnvoisComponent } from './pages/envois/envois.component';
import { TeRapportsComponent } from './pages/rapports/rapports.component';

export const TERRAIN_ROUTES: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    data: { menu: TERRAIN_MENU },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'producteurs' },
      { path: 'producteurs', title: 'Producteurs', component: TeProducteursComponent },
      { path: 'champs', title: 'Champs', component: TeChampsComponent },
      { path: 'visites', title: 'Visites', component: TeVisitesComponent },
      { path: 'carte', title: 'Carte et zones', component: TeCarteComponent },
      { path: 'pesees', title: 'Pesées', component: TePeseesComponent },
      { path: 'recus', title: 'Reçus', component: TeRecusComponent },
      { path: 'envois', title: 'Envois', component: TeEnvoisComponent },
      { path: 'rapports', title: 'Rapports', component: TeRapportsComponent },
    ],
  },
];
