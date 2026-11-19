import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-site-services',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, PageHeroComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss', '../accueil/accueil.component.scss'],
})
export class ServicesComponent {
  protected readonly services = [
    { icon: 'sprout',           title: 'Producteurs & collecte', desc: "Enregistrement des producteurs, suivi des champs, pesées, bordereaux d'envoi.",
      points: ['Fiche complète par producteur', 'Carte des parcelles GPS', 'Pesées avec historique', 'Reçus imprimables'] },
    { icon: 'warehouse',        title: 'Dépôts & traitement',    desc: "Réception, formation des lots, séchage, tri, inventaires et sorties.",
      points: ['Repesées et écarts', 'Mesures de qualité', 'Perte au traitement', 'Inventaires datés'] },
    { icon: 'handshake',        title: 'Ventes & import-export', desc: "Clients, contrats, factures, dossiers d'export, suivi des expéditions.",
      points: ['Lots de vente multi-origines', 'Factures multi-devises', 'Documents d\'export', 'Suivi conteneurs'] },
    { icon: 'landmark',         title: 'Comptabilité',           desc: "Avances aux producteurs, trésorerie, dépenses et résultat de campagne.",
      points: ['Avances suivies & retenues', 'Caisse, banque, Orange Money', 'Dépenses imputées au lot', 'Coût de revient par lot'] },
    { icon: 'layout-dashboard', title: 'Pilotage',               desc: "Tableaux de bord temps réel, alertes, approbations et rapports.",
      points: ['KPIs de campagne', 'Alertes paramétrables', 'Approbations hiérarchiques', 'Rapports exportables'] },
    { icon: 'briefcase',        title: 'Ressources humaines',    desc: "Employés, contrats, présences, congés et paie.",
      points: ['Dossiers employés', 'Barème SYSCOHADA', 'Bulletins conformes', 'Paiement des salaires'] },
    { icon: 'settings',         title: 'Administration',         desc: "Utilisateurs, produits, zones, seuils, journal d'audit.",
      points: ['Gestion des rôles', 'Référentiels datés', 'Journal d\'audit complet', 'Vérification de documents'] },
    { icon: 'user',             title: 'Mon espace producteur',  desc: "Le producteur voit son compte sur son téléphone.",
      points: ['Livraisons récentes', 'Paiements reçus', 'Solde d\'avance', 'Ses champs'] },
  ];
}
