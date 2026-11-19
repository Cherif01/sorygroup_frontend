import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from '../shared/layouts/module-layout/module-layout.component';
import { VENTES_MENU } from './ventes.menu';

import { VeClientsComponent } from './pages/clients/clients.component';
import { VeLotsVenteComponent } from './pages/lots-vente/lots-vente.component';
import { VeContratsComponent } from './pages/contrats/contrats.component';
import { VeFacturesComponent } from './pages/factures/factures.component';
import { VeEncaissementsComponent } from './pages/encaissements/encaissements.component';
import { VeCoutRevientComponent } from './pages/cout-revient/cout-revient.component';
import { VeMargesComponent } from './pages/marges/marges.component';
import { VeDossiersExportComponent } from './pages/dossiers-export/dossiers-export.component';
import { VeExpeditionsComponent } from './pages/expeditions/expeditions.component';
import { VeDossiersImportComponent } from './pages/dossiers-import/dossiers-import.component';
import { VeDocumentsExigesComponent } from './pages/documents-exiges/documents-exiges.component';
import { VeRapportsComponent } from './pages/rapports/rapports.component';

export const VENTES_ROUTES: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    data: { menu: VENTES_MENU },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'clients' },
      { path: 'clients', title: 'Clients', component: VeClientsComponent },
      { path: 'lots-vente', title: 'Lots de vente', component: VeLotsVenteComponent },
      { path: 'contrats', title: 'Contrats', component: VeContratsComponent },
      { path: 'factures', title: 'Factures', component: VeFacturesComponent },
      { path: 'encaissements', title: 'Encaissements', component: VeEncaissementsComponent },
      { path: 'cout-revient', title: 'Coût de revient', component: VeCoutRevientComponent },
      { path: 'marges', title: 'Marges', component: VeMargesComponent },
      { path: 'dossiers-export', title: 'Dossiers d\'export', component: VeDossiersExportComponent },
      { path: 'expeditions', title: 'Expéditions', component: VeExpeditionsComponent },
      { path: 'dossiers-import', title: 'Dossiers d\'import', component: VeDossiersImportComponent },
      { path: 'documents-exiges', title: 'Documents exigés', component: VeDocumentsExigesComponent },
      { path: 'rapports', title: 'Rapports', component: VeRapportsComponent },
    ],
  },
];
