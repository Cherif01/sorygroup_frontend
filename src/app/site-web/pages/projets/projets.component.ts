import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PageHeroComponent } from '../../shared/page-hero/page-hero.component';

@Component({
  selector: 'app-site-projets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, PageHeroComponent],
  templateUrl: './projets.component.html',
  styleUrls: ['../accueil/accueil.component.scss', './projets.component.scss'],
})
export class ProjetsComponent {
  protected readonly projets = [
    {
      image: '/images/landing/landing1.jpg',
      statut: 'En cours',
      tone: 'ok',
      titre: 'Digitalisation de la filière cajou de Boké',
      lieu: 'Boké · Guinée',
      annee: '2026',
      desc: 'Déploiement de la plateforme Sory Group pour 420 producteurs de la zone de Boké, avec formation des superviseurs et équipement en balances connectées.',
      tags: ['Cajou', '420 producteurs', 'Balances connectées'],
    },
    {
      image: '/images/landing/landing2.jpg',
      statut: 'Actif',
      tone: 'info',
      titre: 'Coopérative cacao de Kindia',
      lieu: 'Kindia · Guinée',
      annee: '2024 — 2026',
      desc: 'Structuration de la collecte et de la comptabilité pour une coopérative de 310 producteurs de cacao, avec suivi des avances et des livraisons.',
      tags: ['Cacao', '310 producteurs', 'Comptabilité'],
    },
    {
      image: '/images/landing/landing3.jpg',
      statut: 'Terminé',
      tone: 'neutral',
      titre: 'Pilote café Mamou',
      lieu: 'Mamou · Guinée',
      annee: '2023',
      desc: 'Test terrain sur 175 producteurs de café arabica, validation du modèle avant extension vers d\'autres zones.',
      tags: ['Café', '175 producteurs', 'Pilote'],
    },
    {
      image: '/images/landing/landing1.jpg',
      statut: 'Planifié',
      tone: 'wait',
      titre: 'Chaîne karité Labé',
      lieu: 'Labé · Guinée',
      annee: '2027',
      desc: 'Extension à la filière karité avec un partenariat sur la transformation et l\'export vers l\'Europe.',
      tags: ['Karité', 'Transformation', 'Export EU'],
    },
    {
      image: '/images/landing/landing2.jpg',
      statut: 'En cours',
      tone: 'ok',
      titre: 'Intégration bancaire multi-devises',
      lieu: 'National',
      annee: '2026',
      desc: 'Rapprochement bancaire automatisé avec deux banques partenaires, pour accélérer les encaissements à l\'export.',
      tags: ['API bancaire', 'Multi-devises', 'Export'],
    },
    {
      image: '/images/landing/landing3.jpg',
      statut: 'Actif',
      tone: 'info',
      titre: 'Formation des superviseurs',
      lieu: 'Toutes zones',
      annee: '2024 — en continu',
      desc: 'Programme de formation continue des superviseurs de terrain : saisie mobile, gestion des pesées, relation producteur.',
      tags: ['Formation', 'Terrain', 'Mobile'],
    },
  ];
}
