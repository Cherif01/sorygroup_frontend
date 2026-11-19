import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from '../shared/layouts/module-layout/module-layout.component';
import { RH_MENU } from './rh.menu';

import { RhEmployesComponent } from './pages/employes/employes.component';
import { RhContratsComponent } from './pages/contrats/contrats.component';
import { RhOrganisationComponent } from './pages/organisation/organisation.component';
import { RhPresencesComponent } from './pages/presences/presences.component';
import { RhCongesComponent } from './pages/conges/conges.component';
import { RhMissionsComponent } from './pages/missions/missions.component';
import { RhPaieComponent } from './pages/paie/paie.component';
import { RhBulletinsComponent } from './pages/bulletins/bulletins.component';
import { RhAvancesSalaireComponent } from './pages/avances-salaire/avances-salaire.component';
import { RhPaiementsComponent } from './pages/paiements/paiements.component';
import { RhRubriquesComponent } from './pages/rubriques/rubriques.component';
import { RhRapportsComponent } from './pages/rapports/rapports.component';

export const RH_ROUTES: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    data: { menu: RH_MENU },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'employes' },
      { path: 'employes', title: 'Employés', component: RhEmployesComponent },
      { path: 'contrats', title: 'Contrats', component: RhContratsComponent },
      { path: 'organisation', title: 'Organisation', component: RhOrganisationComponent },
      { path: 'presences', title: 'Présences', component: RhPresencesComponent },
      { path: 'conges', title: 'Congés', component: RhCongesComponent },
      { path: 'missions', title: 'Missions', component: RhMissionsComponent },
      { path: 'paie', title: 'Paie', component: RhPaieComponent },
      { path: 'bulletins', title: 'Bulletins', component: RhBulletinsComponent },
      { path: 'avances-salaire', title: 'Avances salaire', component: RhAvancesSalaireComponent },
      { path: 'paiements', title: 'Paiements', component: RhPaiementsComponent },
      { path: 'rubriques', title: 'Rubriques', component: RhRubriquesComponent },
      { path: 'rapports', title: 'Rapports', component: RhRapportsComponent },
    ],
  },
];
