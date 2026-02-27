# 🌍 LoreOS

> Le système d'exploitation de l'écrivain fantasy — worldbuilding, langues, religions, cultures, personnages et histoire dans une seule app.

---

## 🧠 Concept

LoreOS est la suite complète pour construire et gérer un univers fictif. Tout est interconnecté : ta carte influence ta culture, ta culture influence ta langue, ta langue est parlée par tes personnages, tes personnages vivent dans une histoire façonnée par tes factions et ta mythologie. L'IA assure la cohérence globale et répond à toutes tes questions sur ton propre univers.

**Problème résolu :** Les écrivains de fantasy et SF sérieux jonglent entre des dizaines de fichiers, de carnets, de wikis bricolés. Rien n'est connecté, les incohérences s'accumulent, et quand tu reprends un projet après 6 mois tu passes des heures à te souvenir de ce que t'avais décidé. LoreOS est le cerveau de ton univers.

---

## ✨ Modules

### 🗺️ MapLore — La carte du monde
Éditeur de cartes interactif. Chaque région est liée à des données narratives (climat, ressources, histoire, factions présentes). L'IA dérive des implications culturelles depuis les contraintes géographiques.

### 🌿 EcosystemBuilder — La nature
Faune et flore cohérentes avec les paramètres physiques de ton monde. Chaque créature a son rôle écologique et ses interactions avec les civilisations.

### ⛪ PantheonForge — Les religions
Mythologies, panthéons, cosmologies, rites, tabous, clergé, schismes. Génération de textes sacrés et prières dans le style défini. Cohérence interne vérifiée automatiquement.

### 🏛️ CultureWeaver — Les civilisations
Depuis l'environnement et l'histoire, dérivation logique des coutumes, cuisine, architecture, art, hiérarchies sociales. Comparaison et sources de conflits entre cultures.

### 🗣️ LangForge — Les langues
Construction de langues fictives complètes : phonologie, grammaire, vocabulaire, système d'écriture, dialectes. Génération de nouveau vocabulaire cohérent avec les racines définies.

### ✍️ ScriptForge — Les systèmes d'écriture
Création d'alphabets et syllabaires fictifs avec rendu visuel. Export SVG/PNG.

### 📜 ChronicleForge — L'histoire
Timeline historique avec dérivation logique des conséquences sur le présent. Ruines, ressentiments, langues survivantes, légendes.

### ⚔️ FactionEngine — La politique
Factions, alliances, conflits, équilibres des pouvoirs. Simulation de l'évolution politique selon les événements de l'histoire.

### 👥 CharacterGraph — Les personnages
Fiches personnages complètes avec graphe de relations. Détection des dynamiques sous-exploitées et incohérences.

### 🧠 LoreChat — Le cerveau central
Tu poses des questions sur ton propre univers en langage naturel. *"Est-ce que cette magie existe dans la région nord ?"*, *"Quels personnages ont des raisons de vouloir la mort du roi ?"*. L'app répond en citant tes propres données.

---

## 💰 Potentiel financier

**Marché cible :** Écrivains fantasy/SF, auteurs de JDR, créateurs de worldbuilding (certains construisent des univers sans écrire de roman), game designers narratifs.

**Modèle de monétisation :**
- Free : 1 univers, modules de base (carte, personnages), sans IA
- Pro : 18€/mois — univers illimités, tous les modules, LoreChat IA illimité
- Lifetime : 180€ — très populaire dans cette communauté
- Studio : 59€/mois — partage d'univers en équipe (JDR, co-auteurs)

**Estimation réaliste :**
- 2 000 users Pro → ~36 000€/mois
- 500 Lifetime/an → ~7 500€/mois lissé
- 200 studios → ~11 800€/mois
- **Total potentiel à maturité : ~55 000€/mois**

C'est le projet le plus ambitieux mais aussi le plus défendable à long terme. Worldanvil existe mais est vieillot, complexe, et sans IA intégrée. Notion est trop générique. LoreOS peut devenir la référence absolue de la niche, qui est internationale et prête à payer.

---

## 🛠️ Stack recommandée

### Backend — Python + FastAPI
RAG sur la base de données de l'univers, intégrations LLM multiples, processing de diagrammes et cartes. Python est le choix naturel pour la complexité de ce backend.

### Base de données — PostgreSQL (Supabase) + pgvector
PostgreSQL pour toutes les données structurées (personnages, factions, événements...). pgvector pour les embeddings qui permettent le LoreChat (RAG sur l'univers de l'utilisateur).

### LLM — API Claude
Claude est fort en raisonnement complexe et en cohérence sur de longs contextes. Idéal pour analyser des univers entiers et détecter des incohérences.

### Éditeur de cartes — Leaflet.js ou Konva.js
Leaflet est le standard pour les cartes interactives (utilisé par Inkarnate). Konva.js si tu veux plus de liberté créative dans le rendu.

### Graphe de relations — React Flow ou D3.js
React Flow pour le CharacterGraph — visualisation interactive des relations entre personnages.

### Frontend — Next.js + Tailwind
Interface modulaire avec navigation par module. Chaque module est un espace dédié mais tout est connecté via la navigation et le LoreChat.

### Temps réel (collaboration) — Supabase Realtime
Pour le mode Studio, synchronisation en temps réel des modifications de l'univers entre co-créateurs.

### ScriptForge — Canvas API + génération de fonts
Rendu des systèmes d'écriture via Canvas HTML5. Export SVG.

### Hébergement — Railway (backend) + Vercel (frontend)

---

## ✅ Liste de tâches

### MVP — Module WorldForge (carte + personnages)
- [ ] Éditeur de carte basique (upload d'image + annotations)
- [ ] Fiches personnages (nom, description, traits, liens)
- [ ] Graphe de relations entre personnages (React Flow)
- [ ] LoreChat basique (RAG sur les fiches personnages)
- [ ] Auth + univers multiples (Supabase)
- [ ] Landing page

### V1 — Modules core
- [ ] ChronicleForge (timeline interactive)
- [ ] FactionEngine (factions + relations)
- [ ] PantheonForge (religions + mythologie)
- [ ] LoreChat étendu (RAG sur tout l'univers)
- [ ] Intégration Stripe
- [ ] Export PDF de la bible de l'univers

### V2 — Modules avancés
- [ ] CultureWeaver (civilisations)
- [ ] LangForge (construction de langue)
- [ ] ScriptForge (systèmes d'écriture)
- [ ] EcosystemBuilder (faune et flore)
- [ ] MapLore avancé (régions liées aux données)
- [ ] Mode Studio (collaboration temps réel)

### V3 — Intégrations
- [ ] Intégration MuseStreak (écriture dans LoreOS)
- [ ] Intégration ResearchVault (recherche liée à l'univers)
- [ ] API publique (pour plugins, apps tierces, JDR en ligne)
- [ ] Templates d'univers (fantasy classique, space opera, urban fantasy...)
- [ ] Communauté — univers publics partageables
