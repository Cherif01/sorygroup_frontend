import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from '../shared/layouts/module-layout/module-layout.component';
import { PILOTAGE_MENU } from './pilotage.menu';

import { PiTableauDeBordComponent } from './pages/tableau-de-bord/tableau-de-bord.component';
import { PiCollecteZonesComponent } from './pages/collecte-zones/collecte-zones.component';
import { PiObjectifsComponent } from './pages/objectifs/objectifs.component';
import { PiAlertesComponent } from './pages/alertes/alertes.component';
import { PiApprobationsComponent } from './pages/approbations/approbations.component';
import { PiRapportsComponent } from './pages/rapports/rapports.component';

export const PILOTAGE_ROUTES: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    data: { menu: PILOTAGE_MENU },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tableau-de-bord' },
      { path: 'tableau-de-bord', title: 'Tableau de bord', component: PiTableauDeBordComponent },
      { path: 'collecte-zones', title: 'Collecte par zone', component: PiCollecteZonesComponent },
      { path: 'objectifs', title: 'Objectifs', component: PiObjectifsComponent },
      { path: 'alertes', title: 'Alertes', component: PiAlertesComponent },
      { path: 'approbations', title: 'Approbations', component: PiApprobationsComponent },
      { path: 'rapports', title: 'Rapports', component: PiRapportsComponent },
    ],
  },
];
