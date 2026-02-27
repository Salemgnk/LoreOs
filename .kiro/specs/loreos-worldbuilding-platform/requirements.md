# Requirements Document - LoreOS

## Introduction

LoreOS est une plateforme complète de worldbuilding destinée aux écrivains de fantasy et science-fiction. Le système permet de créer, gérer et maintenir la cohérence d'univers fictifs complexes à travers des modules interconnectés couvrant la géographie, les cultures, les langues, les personnages, l'histoire et la mythologie. Une IA centrale assure la cohérence globale et répond aux questions sur l'univers créé.

## Glossary

- **LoreOS**: Le système complet de worldbuilding
- **Universe**: Un monde fictif créé par un utilisateur, contenant tous les éléments de worldbuilding
- **User**: Un écrivain utilisant la plateforme
- **LoreChat**: Le module d'IA conversationnelle qui répond aux questions sur l'univers
- **Module**: Une fonctionnalité spécialisée du système (MapLore, CharacterGraph, etc.)
- **Entity**: Tout élément créé dans l'univers (personnage, lieu, faction, etc.)
- **Cross_Reference**: Un lien entre deux entités de modules différents
- **Coherence_Engine**: Le système d'IA qui détecte les incohérences entre entités
- **Free_Tier**: Abonnement gratuit limité à 1 univers avec 50 messages LoreChat/mois
- **Pro_Tier**: Abonnement à 18€/mois avec univers illimités, LoreChat illimité et Coherence Engine
- **Studio_Tier**: Abonnement à 59€/mois pour collaboration en équipe avec toutes les fonctionnalités Pro
- **Backend**: Serveur Python + FastAPI
- **Frontend**: Application Next.js
- **Database**: PostgreSQL avec pgvector pour RAG
- **Authentication_System**: Système de gestion des comptes utilisateurs
- **Subscription_Manager**: Système de gestion des abonnements Stripe

## Requirements

### Requirement 1: Gestion des Univers

**User Story:** En tant qu'écrivain, je veux créer et gérer plusieurs univers fictifs, afin de pouvoir travailler sur différents projets simultanément.

#### Acceptance Criteria

1. WHEN un User crée un compte, THE LoreOS SHALL créer automatiquement un Universe vide
2. WHERE Pro_Tier, THE LoreOS SHALL permettre la création d'univers illimités
3. WHERE Free_Tier, THE LoreOS SHALL limiter à 1 Universe par User
4. THE LoreOS SHALL permettre de renommer un Universe
5. THE LoreOS SHALL permettre de supprimer un Universe avec confirmation
6. WHEN un User supprime un Universe, THE LoreOS SHALL supprimer toutes les entités associées de manière irréversible

### Requirement 2: Système d'Authentification

**User Story:** En tant qu'utilisateur, je veux créer un compte sécurisé, afin de protéger mes univers et accéder à mes données depuis n'importe quel appareil.

#### Acceptance Criteria

1. THE Authentication_System SHALL permettre l'inscription avec email et mot de passe
2. WHEN un User s'inscrit, THE Authentication_System SHALL envoyer un email de vérification
3. THE Authentication_System SHALL exiger un mot de passe d'au moins 12 caractères
4. THE Authentication_System SHALL permettre la connexion avec email et mot de passe
5. THE Authentication_System SHALL permettre la réinitialisation du mot de passe par email
6. THE Authentication_System SHALL maintenir une session utilisateur sécurisée
7. WHEN un User se déconnecte, THE Authentication_System SHALL invalider la session

### Requirement 3: MapLore - Éditeur de Cartes

**User Story:** En tant qu'écrivain, je veux créer des cartes interactives de mon univers, afin de visualiser la géographie et placer des lieux narratifs.

#### Acceptance Criteria

1. THE MapLore SHALL permettre de créer une carte vierge pour un Universe
2. THE MapLore SHALL permettre de dessiner des continents, îles et masses terrestres
3. THE MapLore SHALL permettre de placer des marqueurs pour les lieux (villes, montagnes, forêts)
4. THE MapLore SHALL permettre d'ajouter des labels textuels sur la carte
5. WHEN un User clique sur un marqueur, THE MapLore SHALL afficher les détails du lieu
6. THE MapLore SHALL permettre de zoomer et déplacer la vue de la carte
7. THE MapLore SHALL sauvegarder automatiquement les modifications toutes les 30 secondes
8. THE MapLore SHALL permettre d'exporter la carte en format PNG

### Requirement 4: CharacterGraph - Gestion des Personnages

**User Story:** En tant qu'écrivain, je veux créer des fiches personnages détaillées et visualiser leurs relations, afin de maintenir la cohérence de mes personnages et leurs interactions.

#### Acceptance Criteria

1. THE CharacterGraph SHALL permettre de créer une fiche personnage avec nom, âge, description
2. THE CharacterGraph SHALL permettre d'ajouter des attributs personnalisés à un personnage
3. THE CharacterGraph SHALL permettre de créer une relation entre deux personnages
4. WHEN un User crée une relation, THE CharacterGraph SHALL spécifier le type de relation (famille, ami, ennemi, allié)
5. THE CharacterGraph SHALL afficher un graphe visuel des relations entre personnages
6. WHEN un User clique sur un nœud du graphe, THE CharacterGraph SHALL afficher la fiche du personnage
7. THE CharacterGraph SHALL permettre de filtrer le graphe par type de relation
8. THE CharacterGraph SHALL permettre de rechercher un personnage par nom

### Requirement 5: LoreChat - Assistant IA

**User Story:** En tant qu'écrivain, je veux poser des questions sur mon univers à une IA, afin d'obtenir rapidement des informations et vérifier la cohérence.

#### Acceptance Criteria

1. THE LoreChat SHALL être accessible pour tous les tiers d'abonnement
2. WHERE Free_Tier, THE LoreChat SHALL limiter à 50 messages par mois
3. WHERE Pro_Tier, THE LoreChat SHALL permettre un nombre illimité de messages
4. WHERE Studio_Tier, THE LoreChat SHALL permettre un nombre illimité de messages
5. WHEN un Free_Tier User atteint la limite mensuelle, THE LoreChat SHALL afficher un message invitant à passer en Pro
6. WHEN un User pose une question, THE LoreChat SHALL rechercher dans toutes les entités de l'Universe
7. THE LoreChat SHALL utiliser l'API Claude pour générer des réponses contextuelles
8. THE LoreChat SHALL citer les sources (entités) utilisées pour répondre
9. WHEN aucune information n'existe, THE LoreChat SHALL indiquer clairement l'absence de données
10. THE LoreChat SHALL maintenir l'historique des conversations par Universe
11. THE LoreChat SHALL répondre en moins de 5 secondes pour 95% des requêtes
12. THE LoreChat SHALL afficher le compteur de messages restants pour les Free_Tier Users

### Requirement 6: Coherence Engine - Détection d'Incohérences

**User Story:** En tant qu'écrivain, je veux être alerté des incohérences dans mon univers, afin de maintenir la logique interne de mon monde fictif.

#### Acceptance Criteria

1. WHERE Pro_Tier, THE Coherence_Engine SHALL analyser automatiquement les entités pour détecter les incohérences
2. WHERE Studio_Tier, THE Coherence_Engine SHALL analyser automatiquement les entités pour détecter les incohérences
3. WHERE Free_Tier, THE Coherence_Engine SHALL être désactivé
4. WHEN un Pro_Tier User modifie une Entity, THE Coherence_Engine SHALL vérifier la cohérence avec les entités liées
5. IF une incohérence est détectée, THEN THE Coherence_Engine SHALL afficher une alerte à l'utilisateur
6. THE Coherence_Engine SHALL détecter les incohérences temporelles (dates contradictoires)
7. THE Coherence_Engine SHALL détecter les incohérences géographiques (distances impossibles)
8. THE Coherence_Engine SHALL détecter les incohérences relationnelles (relations contradictoires)
9. THE Coherence_Engine SHALL permettre à l'utilisateur d'ignorer une alerte spécifique

### Requirement 7: Cross-References - Interconnexions

**User Story:** En tant qu'écrivain, je veux lier des éléments entre différents modules, afin que mon univers soit interconnecté et cohérent.

#### Acceptance Criteria

1. THE LoreOS SHALL permettre de créer un Cross_Reference entre deux entités de modules différents
2. WHEN un User crée un personnage, THE LoreOS SHALL permettre de le lier à un lieu sur la carte
3. WHEN un User consulte une Entity, THE LoreOS SHALL afficher toutes les Cross_References associées
4. WHEN un User supprime une Entity, THE LoreOS SHALL supprimer automatiquement tous les Cross_References associés
5. THE LoreOS SHALL permettre de naviguer d'une Entity à une autre via les Cross_References
6. THE LoreOS SHALL afficher un compteur de Cross_References pour chaque Entity

### Requirement 8: Subscription Manager - Gestion des Abonnements

**User Story:** En tant qu'utilisateur, je veux souscrire à un abonnement payant, afin d'accéder aux fonctionnalités avancées et illimitées.

#### Acceptance Criteria

1. THE Subscription_Manager SHALL proposer trois tiers: Free, Pro (18€/mois), Studio (59€/mois)
2. THE Subscription_Manager SHALL intégrer Stripe pour les paiements
3. WHEN un User souscrit à Pro_Tier, THE Subscription_Manager SHALL activer immédiatement les fonctionnalités Pro
4. WHEN un User souscrit à Studio_Tier, THE Subscription_Manager SHALL activer les fonctionnalités de collaboration
5. THE Subscription_Manager SHALL permettre de passer de Free à Pro ou Studio
6. THE Subscription_Manager SHALL permettre de résilier un abonnement
7. WHEN un abonnement est résilié, THE Subscription_Manager SHALL maintenir l'accès jusqu'à la fin de la période payée
8. WHEN un abonnement expire, THE Subscription_Manager SHALL rétrograder automatiquement vers Free_Tier
9. THE Subscription_Manager SHALL réinitialiser le compteur de messages LoreChat à 50 chaque mois pour les Free_Tier Users
10. THE Subscription_Manager SHALL suivre l'utilisation mensuelle de LoreChat pour chaque User

### Requirement 9: ChronicleForge - Timeline Historique

**User Story:** En tant qu'écrivain, je veux créer une chronologie des événements de mon univers, afin de maintenir la cohérence temporelle de mon histoire.

#### Acceptance Criteria

1. THE ChronicleForge SHALL permettre de créer des événements avec date, titre et description
2. THE ChronicleForge SHALL afficher les événements sur une timeline visuelle
3. THE ChronicleForge SHALL permettre de définir un système de calendrier personnalisé
4. THE ChronicleForge SHALL permettre de lier un événement à des personnages ou lieux
5. WHEN un User clique sur un événement, THE ChronicleForge SHALL afficher les détails complets
6. THE ChronicleForge SHALL permettre de filtrer les événements par période ou catégorie
7. THE ChronicleForge SHALL permettre de zoomer sur différentes échelles temporelles (jours, années, siècles)

### Requirement 10: FactionEngine - Gestion des Factions

**User Story:** En tant qu'écrivain, je veux créer des factions politiques et gérer leurs relations, afin de modéliser les dynamiques de pouvoir de mon univers.

#### Acceptance Criteria

1. THE FactionEngine SHALL permettre de créer une faction avec nom, description et idéologie
2. THE FactionEngine SHALL permettre d'assigner des personnages comme membres d'une faction
3. THE FactionEngine SHALL permettre de définir des relations entre factions (alliance, guerre, neutralité)
4. THE FactionEngine SHALL afficher un graphe des relations entre factions
5. THE FactionEngine SHALL permettre de lier une faction à un territoire sur la carte
6. WHEN un User modifie une relation entre factions, THE FactionEngine SHALL mettre à jour le graphe en temps réel
7. THE FactionEngine SHALL permettre de définir des ressources contrôlées par chaque faction

### Requirement 11: PantheonForge - Religions et Mythologies

**User Story:** En tant qu'écrivain, je veux créer des systèmes religieux et mythologiques, afin d'enrichir la dimension spirituelle de mon univers.

#### Acceptance Criteria

1. THE PantheonForge SHALL permettre de créer une religion avec nom, croyances et pratiques
2. THE PantheonForge SHALL permettre de créer des divinités avec domaines et attributs
3. THE PantheonForge SHALL permettre de lier des divinités à une religion
4. THE PantheonForge SHALL permettre de créer des mythes et légendes
5. THE PantheonForge SHALL permettre de lier une religion à des cultures ou factions
6. THE PantheonForge SHALL permettre de définir des relations entre divinités (famille, rivalité)
7. THE PantheonForge SHALL afficher un arbre généalogique des divinités

### Requirement 12: Export et Sauvegarde

**User Story:** En tant qu'écrivain, je veux exporter mes données, afin de les utiliser dans d'autres outils ou de créer des sauvegardes.

#### Acceptance Criteria

1. THE LoreOS SHALL permettre d'exporter un Universe complet en format JSON
2. THE LoreOS SHALL permettre d'exporter des fiches personnages en format PDF
3. THE LoreOS SHALL permettre d'exporter la carte en format PNG ou SVG
4. THE LoreOS SHALL permettre d'exporter la timeline en format PDF
5. THE LoreOS SHALL créer automatiquement une sauvegarde quotidienne de chaque Universe
6. THE LoreOS SHALL conserver les 7 dernières sauvegardes automatiques
7. THE LoreOS SHALL permettre de restaurer un Universe depuis une sauvegarde

### Requirement 13: Collaboration en Mode Studio

**User Story:** En tant qu'équipe d'écrivains, nous voulons collaborer sur le même univers, afin de créer ensemble un monde cohérent.

#### Acceptance Criteria

1. WHERE Studio_Tier, THE LoreOS SHALL permettre d'inviter des collaborateurs sur un Universe
2. THE LoreOS SHALL permettre de définir des rôles (propriétaire, éditeur, lecteur)
3. WHERE rôle éditeur, THE LoreOS SHALL permettre de modifier toutes les entités
4. WHERE rôle lecteur, THE LoreOS SHALL permettre uniquement la consultation
5. WHEN un collaborateur modifie une Entity, THE LoreOS SHALL notifier les autres collaborateurs en temps réel
6. THE LoreOS SHALL afficher l'historique des modifications avec l'auteur de chaque changement
7. THE LoreOS SHALL permettre de révoquer l'accès d'un collaborateur

### Requirement 14: Recherche Globale

**User Story:** En tant qu'écrivain, je veux rechercher rapidement n'importe quel élément de mon univers, afin de retrouver facilement des informations.

#### Acceptance Criteria

1. THE LoreOS SHALL fournir une barre de recherche accessible depuis toutes les pages
2. WHEN un User saisit une requête, THE LoreOS SHALL rechercher dans tous les modules
3. THE LoreOS SHALL afficher les résultats groupés par type (personnages, lieux, événements, etc.)
4. THE LoreOS SHALL mettre en évidence les termes recherchés dans les résultats
5. THE LoreOS SHALL permettre de filtrer les résultats par module
6. THE LoreOS SHALL afficher les résultats en moins de 500ms pour 95% des requêtes
7. WHEN un User clique sur un résultat, THE LoreOS SHALL naviguer vers l'entité correspondante

### Requirement 15: Performance et Scalabilité

**User Story:** En tant qu'utilisateur, je veux que la plateforme soit rapide et réactive, afin de maintenir ma concentration créative.

#### Acceptance Criteria

1. THE Frontend SHALL charger la page d'accueil en moins de 2 secondes
2. THE Backend SHALL répondre aux requêtes API en moins de 200ms pour 95% des cas
3. THE Database SHALL supporter au moins 10 000 entités par Universe sans dégradation
4. THE LoreOS SHALL supporter au moins 1 000 utilisateurs simultanés
5. WHEN un User modifie une Entity, THE Frontend SHALL mettre à jour l'interface en moins de 100ms
6. THE LoreOS SHALL compresser les images uploadées pour optimiser le stockage
7. THE Backend SHALL utiliser un système de cache pour les requêtes fréquentes

### Requirement 16: Sécurité et Confidentialité

**User Story:** En tant qu'utilisateur, je veux que mes données soient sécurisées et privées, afin de protéger mon travail créatif.

#### Acceptance Criteria

1. THE Backend SHALL chiffrer toutes les communications avec HTTPS
2. THE Database SHALL chiffrer les données sensibles au repos
3. THE Authentication_System SHALL utiliser des tokens JWT avec expiration
4. THE LoreOS SHALL isoler complètement les données entre différents utilisateurs
5. THE Backend SHALL valider et assainir toutes les entrées utilisateur
6. THE LoreOS SHALL implémenter une protection contre les attaques CSRF
7. THE Backend SHALL logger toutes les tentatives d'accès non autorisé
8. THE LoreOS SHALL permettre à un User de supprimer définitivement son compte et toutes ses données

### Requirement 17: Responsive Design

**User Story:** En tant qu'utilisateur mobile, je veux accéder à mes univers depuis mon téléphone ou tablette, afin de travailler en déplacement.

#### Acceptance Criteria

1. THE Frontend SHALL s'adapter automatiquement aux écrans de 320px à 2560px de largeur
2. THE Frontend SHALL être utilisable sur écrans tactiles
3. THE Frontend SHALL optimiser l'interface pour les écrans mobiles (menu hamburger, navigation simplifiée)
4. THE MapLore SHALL supporter les gestes tactiles (pinch to zoom, pan)
5. THE CharacterGraph SHALL être navigable sur mobile avec zoom et défilement
6. THE Frontend SHALL charger des images optimisées selon la taille d'écran
7. THE Frontend SHALL maintenir une performance fluide (60 FPS) sur appareils mobiles modernes

### Requirement 18: Notifications et Alertes

**User Story:** En tant qu'utilisateur, je veux être notifié des événements importants, afin de rester informé de l'activité sur mes univers.

#### Acceptance Criteria

1. WHERE Studio_Tier, WHEN un collaborateur modifie une Entity, THE LoreOS SHALL envoyer une notification
2. WHEN le Coherence_Engine détecte une incohérence, THE LoreOS SHALL afficher une notification
3. WHEN un abonnement arrive à expiration dans 7 jours, THE LoreOS SHALL envoyer un email de rappel
4. THE LoreOS SHALL permettre de configurer les préférences de notification
5. THE LoreOS SHALL afficher un centre de notifications dans l'interface
6. THE LoreOS SHALL marquer les notifications comme lues après consultation
7. THE LoreOS SHALL conserver l'historique des notifications pendant 30 jours

### Requirement 19: Onboarding et Tutoriels

**User Story:** En tant que nouvel utilisateur, je veux comprendre rapidement comment utiliser la plateforme, afin de commencer à créer mon univers efficacement.

#### Acceptance Criteria

1. WHEN un User se connecte pour la première fois, THE LoreOS SHALL afficher un tutoriel interactif
2. THE LoreOS SHALL proposer des templates d'univers pré-remplis (fantasy médiéval, space opera, etc.)
3. THE LoreOS SHALL fournir des tooltips contextuels sur les fonctionnalités principales
4. THE LoreOS SHALL permettre de sauter le tutoriel
5. THE LoreOS SHALL permettre de relancer le tutoriel depuis les paramètres
6. THE LoreOS SHALL fournir une documentation complète accessible depuis l'interface
7. THE LoreOS SHALL proposer des exemples pour chaque type d'entité

### Requirement 20: Monitoring et Logs

**User Story:** En tant qu'administrateur système, je veux monitorer la santé de la plateforme, afin de détecter et résoudre rapidement les problèmes.

#### Acceptance Criteria

1. THE Backend SHALL logger toutes les erreurs avec stack trace et contexte
2. THE Backend SHALL monitorer l'utilisation CPU, mémoire et disque
3. THE Backend SHALL monitorer les temps de réponse des API
4. THE Backend SHALL monitorer le taux d'erreur des requêtes
5. IF le taux d'erreur dépasse 5%, THEN THE Backend SHALL envoyer une alerte
6. THE Backend SHALL monitorer l'utilisation de l'API Claude et les coûts associés
7. THE Backend SHALL conserver les logs pendant 90 jours
