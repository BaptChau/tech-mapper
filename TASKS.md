# Idees d'evolution

## Priorites
- P0 (impact + rapide) : validation stricte, deduplication, import/export JSON, rate-limit
- P1 (UX) : auto-completion, recherche globale + filtres avances, mode tags
- P2 (scalabilite) : pagination/virtual list, cache + ETag, backup automatique
- P3 (securite avancee) : comptes utilisateurs + audit detaille

## Fonctionnel
- (P1) Auto-completion et suggestions lors de la saisie
- (P1) Synonymes / alias (ex: "JS" -> "JavaScript")
- (P0) Import / export JSON de la base
- (P2) Categories (backend, frontend, devops, etc.)

## Qualite des donnees
- (P0) Deduplication intelligente (case / accents)
- (P0) Validation stricte (pas de techno vide, normalisation)
- (P3) Historique des modifications / audit simple

## Experience utilisateur
- (P1) Recherche globale unique + filtres avances
- (P1) Mode "tags" pour langages
- (P2) Favoris / technos recentes

## Technique
- (P2) Persistence serveur + backup automatique
- (P2) Pagination / virtual list si la base grossit
- (P2) Cache cote client + ETag cote serveur

## Securite
- (P3) Comptes utilisateurs (login) au lieu d'un mot de passe partage
- (P0) Rate-limit / anti-bruteforce
- (P3) Journalisation des ajouts (qui / quand)
