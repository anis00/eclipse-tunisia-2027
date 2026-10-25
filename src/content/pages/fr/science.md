---
title: Comprendre l’éclipse solaire totale du 2 août 2027
description: Fonctionnement d’une éclipse solaire, différence entre éclipses totales, partielles et annulaires, pourquoi la bande de totalité est étroite, pourquoi la durée varie et comment sont calculées les prédictions du site.
h1: Comprendre l’éclipse
lead: Une éclipse totale de Soleil résulte d’une remarquable coïncidence de tailles et de distances. Voici comment elle fonctionne, et ce que cela signifie pour les observateurs en Tunisie.
updated: 2026-10-25
sources:
  - title: Besselian elements — Total Solar Eclipse of 2027 August 02
    publisher: NASA GSFC (F. Espenak)
    url: https://eclipse.gsfc.nasa.gov/SEsearch/SEdata.php?Ecl=+20270802
  - title: Path of the Total Solar Eclipse of 2027 Aug 02
    publisher: NASA GSFC (F. Espenak)
    url: https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2027Aug02Tpath.html
  - title: Future eclipses
    publisher: NASA Science
    url: https://science.nasa.gov/eclipses/future-eclipses/
---

## Comment se produit une éclipse de Soleil ?

Une éclipse de Soleil se produit lorsque la Lune passe entre le Soleil et la Terre, au moment de la nouvelle lune. Le Soleil est environ 400 fois plus grand que la Lune, mais aussi environ 400 fois plus éloigné : vus de la Terre, les deux astres ont presque la même taille apparente. Lorsqu’ils sont parfaitement alignés, la Lune peut masquer entièrement le disque lumineux du Soleil.

L’orbite de la Lune est inclinée d’environ 5° par rapport à celle de la Terre : la plupart des nouvelles lunes passent au-dessus ou au-dessous du Soleil. Une éclipse n’est possible que lorsque la nouvelle lune survient près de l’un des deux points où les orbites se croisent (les nœuds), ce qui arrive lors de deux « saisons d’éclipses » par an.

## Éclipses totales, partielles et annulaires

La Lune projette deux cônes d’ombre dans l’espace :

- l’**ombre**, cône central sombre où le Soleil est entièrement caché : les observateurs qui s’y trouvent voient une **éclipse totale** ;
- la **pénombre**, zone beaucoup plus large qui l’entoure, où la Lune ne couvre qu’une partie du Soleil : on y voit une **éclipse partielle**.

L’orbite de la Lune étant elliptique, sa taille apparente varie. Lorsque la Lune est trop éloignée pour couvrir entièrement le Soleil, un anneau lumineux subsiste autour d’elle : c’est une **éclipse annulaire**. Le 2 août 2027, la Lune est proche de la Terre et paraît environ 7,6 % plus grande que le Soleil depuis la Tunisie, d’où une longue éclipse totale.

## Pourquoi la bande de totalité est-elle si étroite ?

L’ombre est un cône qui se rétrécit avec la distance. À la distance de la Terre, sa section ne mesure au plus que quelques centaines de kilomètres. Le 2 août 2027, la bande de totalité mesure environ **246 à 248 km de large en Tunisie** (NASA). L’ombre balaie le pays d’ouest en est à environ **3 100 km/h** (0,86 km/s) et le traverse en une dizaine de minutes.

En dehors de cette bande, l’éclipse n’est que partielle, et plus on s’éloigne de la bande, plus la partie masquée du Soleil diminue.

## Pourquoi la durée varie-t-elle d’un lieu à l’autre ?

- **La distance à la ligne centrale** : la totalité est la plus longue sur la ligne centrale et diminue rapidement près des limites, où le bord de l’ombre ne fait que frôler l’observateur. À mi-chemin entre la ligne centrale et une limite, la totalité dure encore environ 87 % de sa valeur centrale ; à 10 % de la demi-largeur de la limite, elle tombe à environ 44 %.
- **La position le long de la trajectoire** : la durée sur la ligne centrale augmente vers l’Égypte, où le Soleil est plus haut, l’observateur plus proche de la Lune et la rotation de la Terre accompagne mieux l’ombre. Elle atteint son maximum de **6 min 23 s** près de Louxor.
- **L’altitude et le relief** : un site en hauteur est très légèrement plus proche de la Lune ; cet effet reste faible par rapport à la position dans la bande.

## À quelle fréquence se produisent les éclipses totales ?

Il se produit entre deux et cinq éclipses de Soleil par an quelque part sur Terre, et une éclipse totale a lieu en moyenne tous les 18 mois environ. Mais la bande de totalité étant très étroite, un lieu donné n’en voit qu’exceptionnellement — en moyenne une fois en plusieurs siècles.

## L’éclipse de 2027 en Tunisie

La bande de totalité entre en Tunisie depuis l’Algérie au niveau des gouvernorats de Kasserine et de Gafsa et quitte le pays au-dessus du golfe de Gabès et de la région de Médenine et de Djerba. La totalité a lieu entre environ 10 h 04 et 10 h 14, heure tunisienne, avec un Soleil haut dans le ciel du sud-est. Sfax, deuxième ville du pays, est proche de la ligne centrale ; Tunis, Sousse et Monastir sont en dehors de la bande.

<h2 id="method">Comment sont calculées les prédictions de ce site ?</h2>

Tous les horaires et toutes les durées sont calculés par ce site à partir des **éléments de Bessel** publiés par la NASA (F. Espenak). Ces coefficients polynomiaux décrivent la position et la taille de l’ombre de la Lune au cours du temps. Pour chaque lieu, le moteur projette l’observateur sur le « plan fondamental », perpendiculaire à l’axe de l’ombre, et détermine les instants où il entre dans la pénombre et l’ombre puis en sort (méthode de l’*Explanatory Supplement to the Astronomical Almanac* et de J. Meeus).

- **ΔT** (écart entre le temps terrestre et le temps universel) est fixé à **69,2 s**, valeur cohérente avec les mesures récentes de la rotation terrestre, au lieu des 76 s extrapolées par la NASA lors du calcul des éléments. Cela décale la trajectoire d’environ 3 km en longitude.
- **Validation** : avec le ΔT de la NASA, le moteur reproduit les durées publiées par la NASA sur la ligne centrale à moins d’une seconde près et les limites de la totalité à moins d’un demi-kilomètre près, et concorde avec une bibliothèque indépendante (Astronomy Engine) à environ 2 à 3 secondes près pour les contacts de la phase partielle et le maximum ; le début et la fin de la totalité diffèrent de quelques secondes, davantage près de la limite sud. Voir la page [sources et méthodes](../sources/) pour la comparaison complète.
- **Limites de précision** : le bord de la Lune n’est pas lisse. Ses montagnes et ses vallées déplacent les limites de la bande de 1 à 2 km et modifient de plusieurs secondes les durées près des limites. Les calculs sont faits au niveau de la mer et ne tiennent pas compte du relief local.
