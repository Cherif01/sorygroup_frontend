import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from '../shared/layouts/module-layout/module-layout.component';
import { COMPTABILITE_MENU } from './comptabilite.menu';

import { CoAvancesDemandesComponent } from './pages/avances/demandes/demandes.component';
import { CoAvancesValidationComponent } from './pages/avances/validation/validation.component';
import { CoAvancesDecaissementComponent } from './pages/avances/decaissement/decaissement.component';
import { CoAvancesRemboursementsComponent } from './pages/avances/remboursements/remboursements.component';
import { CoAvancesSansLivraisonComponent } from './pages/avances/sans-livraison/sans-livraison.component';
import { CoTresorerieComptesComponent } from './pages/tresorerie/comptes/comptes.component';
import { CoTresorerieJournalComponent } from './pages/tresorerie/journal/journal.component';
import { CoTresoreriePaiementsProducteursComponent } from './pages/tresorerie/paiements-producteurs/paiements-producteurs.component';
import { CoTresorerieEncaissementsComponent } from './pages/tresorerie/encaissements/encaissements.component';
import { CoTresorerieTransfertsComponent } from './pages/tresorerie/transferts/transferts.component';
import { CoTresorerieCloturesCaisseComponent } from './pages/tresorerie/clotures-caisse/clotures-caisse.component';
import { CoTresorerieRapprochementsComponent } from './pages/tresorerie/rapprochements/rapprochements.component';
import { CoDepensesListeComponent } from './pages/depenses/liste/liste.component';
import { CoDepensesReglementsComponent } from './pages/depenses/reglements/reglements.component';
import { CoDepensesFournisseursComponent } from './pages/depenses/fournisseurs/fournisseurs.component';
import { CoDepensesNaturesComponent } from './pages/depenses/natures/natures.component';
import { CoAnalyseCoutRevientComponent } from './pages/analyse/cout-revient/cout-revient.component';
import { CoAnalyseResultatCampagneComponent } from './pages/analyse/resultat-campagne/resultat-campagne.component';
import { CoAnalyseExportsComponent } from './pages/analyse/exports/exports.component';

export const COMPTABILITE_ROUTES: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    data: { menu: COMPTABILITE_MENU },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'avances/demandes' },
      { path: 'avances/demandes', title: 'Demandes d\'avance', component: CoAvancesDemandesComponent },
      { path: 'avances/validation', title: 'Validation', component: CoAvancesValidationComponent },
      { path: 'avances/decaissement', title: 'Décaissement', component: CoAvancesDecaissementComponent },
      { path: 'avances/remboursements', title: 'Remboursements', component: CoAvancesRemboursementsComponent },
      { path: 'avances/sans-livraison', title: 'Sans livraison', component: CoAvancesSansLivraisonComponent },
      { path: 'tresorerie/comptes', title: 'Caisses', component: CoTresorerieComptesComponent },
      { path: 'tresorerie/journal', title: 'Journal', component: CoTresorerieJournalComponent },
      { path: 'tresorerie/paiements-producteurs', title: 'Paiements producteurs', component: CoTresoreriePaiementsProducteursComponent },
      { path: 'tresorerie/encaissements', title: 'Encaissements', component: CoTresorerieEncaissementsComponent },
      { path: 'tresorerie/transferts', title: 'Transferts', component: CoTresorerieTransfertsComponent },
      { path: 'tresorerie/clotures-caisse', title: 'Clôtures', component: CoTresorerieCloturesCaisseComponent },
      { path: 'tresorerie/rapprochements', title: 'Rapprochements', component: CoTresorerieRapprochementsComponent },
      { path: 'depenses/liste', title: 'Dépenses', component: CoDepensesListeComponent },
      { path: 'depenses/reglements', title: 'Règlements', component: CoDepensesReglementsComponent },
      { path: 'depenses/fournisseurs', title: 'Fournisseurs', component: CoDepensesFournisseursComponent },
      { path: 'depenses/natures', title: 'Natures', component: CoDepensesNaturesComponent },
      { path: 'analyse/cout-revient', title: 'Coût revient', component: CoAnalyseCoutRevientComponent },
      { path: 'analyse/resultat-campagne', title: 'Résultat campagne', component: CoAnalyseResultatCampagneComponent },
      { path: 'analyse/exports', title: 'Exports', component: CoAnalyseExportsComponent },
    ],
  },
];
