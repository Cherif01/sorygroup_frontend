import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from '../shared/layouts/module-layout/module-layout.component';
import { DEPOTS_MENU } from './depots.menu';

import { DeEntreesComponent } from './pages/entrees/entrees.component';
import { DeLotsComponent } from './pages/lots/lots.component';
import { DeTraitementComponent } from './pages/traitement/traitement.component';
import { DeValeurComponent } from './pages/valeur/valeur.component';
import { DeSortiesComponent } from './pages/sorties/sorties.component';
import { DeStockComponent } from './pages/stock/stock.component';
import { DeInventairesComponent } from './pages/inventaires/inventaires.component';
import { DeRapportsComponent } from './pages/rapports/rapports.component';

export const DEPOTS_ROUTES: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    data: { menu: DEPOTS_MENU },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'entrees' },
      { path: 'entrees', title: 'Entrées', component: DeEntreesComponent },
      { path: 'lots', title: 'Lots', component: DeLotsComponent },
      { path: 'traitement', title: 'Traitement', component: DeTraitementComponent },
      { path: 'valeur', title: 'Valeur', component: DeValeurComponent },
      { path: 'sorties', title: 'Sorties', component: DeSortiesComponent },
      { path: 'stock', title: 'Stock', component: DeStockComponent },
      { path: 'inventaires', title: 'Inventaires', component: DeInventairesComponent },
      { path: 'rapports', title: 'Rapports', component: DeRapportsComponent },
    ],
  },
];
