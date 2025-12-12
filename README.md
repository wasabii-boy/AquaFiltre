# AquaFiltre

Application statique pour pré-sélectionner des eaux en bouteille vendues en France à partir
de critères de pureté (résidu sec, nitrates, sodium) en s'appuyant sur les repères et données
publiques de l'ANSES.

## Ce qui change dans la refonte
- **Interface entièrement revue** : nouveau hero explicatif, cartes de synthèse, recommandation
  prioritaire et top 3 visibles en un coup d'œil.
- **Lecture scientifique améliorée** : compteurs par paramètre (résidu, nitrates, sodium), score
  moyen du top 3 et mise en avant de la pondération 45/35/20.
- **Tableau exhaustif** : classement complet avec badges de conformité et rappel de la source ANSES.
- **Statique et portable** : aucun build requis, prêt pour GitHub Pages via le workflow inclus.

## Contenu scientifique
- **Références ANSES** :
  - nitrates : limite de qualité eau potable 50 mg/L ; cible 10 mg/L pour la préparation des biberons
    (avis 2013 + note d'appui 2021).
  - sodium : repère < 15 mg/L pour nourrissons (avis ANSES 2008, alimentation infantile).
  - résidu sec : eaux très faiblement minéralisées < 50 mg/L.
- **Méthodologie** : score de pureté = 45% résidu sec, 35% nitrates, 20% sodium. Au-delà d'un seuil,
  le paramètre est ramené à 0 pour le calcul.
- **Données** : `data/waters.json` contient des références d'eaux françaises avec des valeurs issues du
  fichier public des eaux minérales naturelles (ANSES, mise à jour 2022). Vérifiez toujours l'étiquette
  la plus récente.

## Fonctionnalités
- Profils rapides appliquant directement les seuils ANSES pour les nourrissons ou publics sensibles.
- Curseurs ajustables pour modifier les limites et reclasser instantanément le tableau.
- Recommandation prioritaire, top 3, statistiques de compatibilité et score moyen du top 3.
- Classement pondéré, badge de conformité par paramètre et statistiques de compatibilité.
- Interface statique prête pour GitHub Pages (aucune dépendance).

## Déploiement GitHub Pages
Le dépôt est configuré pour publier automatiquement la version statique via GitHub Actions
(voir `.github/workflows/pages.yml`). Il suffit d'activer Pages sur la branche `gh-pages` avec
l'option "GitHub Actions".

## Utilisation locale
Aucun build n'est requis. Un simple serveur statique suffit :

```bash
python -m http.server 8000
```

Puis ouvrir http://localhost:8000 dans un navigateur.
