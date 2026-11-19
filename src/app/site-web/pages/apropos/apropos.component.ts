import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-site-apropos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, PageHeroComponent],
  templateUrl: './apropos.component.html',
  styleUrls: ['../accueil/accueil.component.scss', './apropos.component.scss'],
})
export class AproposComponent {
  protected readonly valeurs = [
    { icon: 'check',     titre: 'Transparence',   desc: 'Chaque opération est tracée, chaque document vérifiable.' },
    { icon: 'handshake', titre: 'Partenariat',    desc: 'Nous construisons avec nos clients, nous ne vendons pas d\'un coup.' },
    { icon: 'sprout',    titre: 'Impact local',   desc: 'Nos outils bénéficient d\'abord aux producteurs guinéens.' },
    { icon: 'scale',     titre: 'Rigueur',        desc: 'Comptabilité SYSCOHADA, normes export, séparation des tâches.' },
  ];

  protected readonly equipe = [
    { nom: 'M. Sory', poste: 'Fondateur & Directeur général',   initiales: 'MS' },
    { nom: 'F. Diallo', poste: 'Responsable opérations',        initiales: 'FD' },
    { nom: 'A. Camara', poste: 'Direction technique',           initiales: 'AC' },
    { nom: 'I. Bah',    poste: 'Relations producteurs',         initiales: 'IB' },
  ];

  protected readonly jalons = [
    { annee: '2015', evenement: 'Création de Sory Group SARLU à Conakry.' },
    { annee: '2018', evenement: 'Premier dépôt opérationnel à Kindia — 300 producteurs.' },
    { annee: '2021', evenement: 'Ouverture de la filière cacao, extension vers Boké.' },
    { annee: '2024', evenement: 'Lancement de la plateforme digitale intégrée.' },
    { annee: '2026', evenement: '1 500+ producteurs, 4 produits, 8 applications déployées.' },
  ];
}
