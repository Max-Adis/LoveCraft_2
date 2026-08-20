# LoveCraft

> **✅ DÉPÔT VALIDÉ — VERSION DE RÉFÉRENCE**
> Ce dépôt est retenu comme version principale de la famille LoveCraft. La mention indique une validation organisationnelle du dépôt de référence ; elle ne constitue pas une certification de production.

**LoveCraft** permet de créer et de partager des surprises digitales personnalisées : message romantique, souvenir, déclaration, invitation ou attention destinée à une personne particulière.

L’application accompagne l’utilisateur depuis la création du contenu jusqu’au partage par lien direct ou QR code, avec une interface adaptée aux écrans mobiles et aux navigateurs modernes.

## Fonctionnalités principales

| Domaine | Fonctionnalités |
|---|---|
| Création | Saisie d’un message, d’une question, d’une réponse, d’un indice et d’un message final. |
| Personnalisation | Modèles et ambiances romantiques, geek, anniversaire ou amitié. |
| Partage | Lien direct et QR code pour transmettre la surprise. |
| Gestion | Tableau de bord pour consulter, modifier et suivre les créations. |
| Comptes | Authentification par e-mail et Google selon la configuration Firebase. |
| Export | Téléchargement de QR codes et génération de supports PDF selon le parcours utilisé. |
| Internationalisation | Ressources en français et en anglais. |

## Démo

La version publique est disponible sur [GitHub Pages](https://max-adis.github.io/LoveCraft/).

Pour des raisons de sécurité et de confidentialité, les identifiants de démonstration ne sont pas publiés dans ce README. Utilise un compte de test dédié et ne partage jamais de compte personnel.

## Technologies

- **Frontend :** HTML5, CSS3 et JavaScript moderne.
- **Backend :** Firebase Authentication, Realtime Database et Storage.
- **Hébergement :** GitHub Pages.
- **Bibliothèques :** Firebase Web SDK, QRCode.js, html2canvas, jsPDF et Font Awesome.
- **Internationalisation :** fichiers de locales français et anglais.

## Installation locale

```bash
git clone https://github.com/Max-Adis/LoveCraft_2.git
cd LoveCraft_2
python3 -m http.server 8000
```

Ouvre ensuite [http://localhost:8000](http://localhost:8000). Les fonctions d’authentification, de sauvegarde et de partage nécessitent une configuration Firebase valide.

## Organisation du projet

```text
index.html          Accueil et présentation du service
create.html         Création et personnalisation d’une surprise
dashboard.html      Gestion des créations de l’utilisateur
story.html          Affichage d’une surprise partagée
settings.html       Paramètres utilisateur
js/                 Authentification, Firebase, création et effets
assets/              Logo et ressources visuelles
locales/             Traductions françaises et anglaises
legal/               Conditions, confidentialité et cookies
s/                  Pages ou ressources de partage
```

## Sécurité et configuration

La configuration Firebase doit être contrôlée avant toute mise en production. Les règles d’accès à la base, les permissions de stockage et les flux d’authentification doivent être vérifiés avec un projet Firebase de test avant publication.

Évite de placer dans le dépôt des informations personnelles, des identifiants réels ou des données de surprises appartenant à des utilisateurs.

## État du projet

`LoveCraft_2` est la version publique la plus structurée de la famille LoveCraft. Elle doit être considérée comme une application web en évolution, avec une prochaine étape centrée sur la robustesse des règles Firebase, les tests des parcours de création et la documentation de déploiement.

## Feuille de route recommandée

- Ajouter des tests de création, modification et partage.
- Documenter la configuration Firebase sans publier de secret.
- Vérifier les règles d’authentification, de base de données et de stockage.
- Améliorer l’accessibilité et les messages d’erreur.
- Ajouter une procédure de sauvegarde et de restauration des données de démonstration.

## Contribution

Les contributions doivent être réalisées sur une branche dédiée et accompagnées d’une description claire du parcours utilisateur concerné. Avant intégration, vérifie le fonctionnement sur mobile et sur navigateur desktop.

## Licence

La licence et les conditions d’utilisation des contenus doivent être précisées avant toute réutilisation externe.

## Références

- [Dépôt LoveCraft](https://github.com/Max-Adis/LoveCraft_2)
- [Démo LoveCraft](https://max-adis.github.io/LoveCraft/)
- [Documentation Firebase](https://firebase.google.com/docs)
