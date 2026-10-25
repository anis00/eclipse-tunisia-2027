---
title: Understanding the total solar eclipse of 2 August 2027
description: How a solar eclipse works, the difference between total, partial and annular eclipses, why the path of totality is narrow, why the duration varies and how the predictions of this site are computed.
h1: Understanding the eclipse
lead: A total solar eclipse is the result of a remarkable coincidence of sizes and distances. Here is how it works, and what it means for observers in Tunisia.
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

## How does a solar eclipse happen?

A solar eclipse occurs when the Moon passes between the Sun and the Earth, at new moon. The Sun is about 400 times larger than the Moon, but it is also about 400 times farther away: seen from the Earth, both bodies have almost the same apparent size. When they are exactly aligned, the Moon can hide the bright disk of the Sun completely.

The Moon's orbit is tilted by about 5° relative to the Earth's orbit, so most new moons pass above or below the Sun. An eclipse can only happen when the new moon occurs close to one of the two points where the orbits cross (the nodes). This happens during two "eclipse seasons" each year.

## Total, partial and annular eclipses

The Moon casts two cones of shadow into space:

- the **umbra**, the dark central cone where the Sun is completely hidden. Observers inside it see a **total eclipse**;
- the **penumbra**, a much wider zone around it, where the Moon covers only part of the Sun. Observers there see a **partial eclipse**.

Because the Moon's orbit is elliptical, its apparent size changes. When the Moon is too far away to cover the Sun completely, a bright ring remains around it: this is an **annular eclipse**. On 2 August 2027, the Moon is close to the Earth and appears about 7.6 % larger than the Sun from Tunisia, which produces a long total eclipse.

## Why is the path of totality so narrow?

The umbra is a cone that narrows with distance. At the Earth's distance, its section is only a few hundred kilometres wide at most. On 2 August 2027, the path of totality is about **246 to 248 km wide across Tunisia** (NASA). The shadow sweeps across the country from west to east at about **3,100 km/h** (0.86 km/s), crossing Tunisia in about ten minutes.

Outside this band, the eclipse is only partial, and the further you are from the path, the smaller the part of the Sun that is covered.

## Why does the duration vary from place to place?

- **Distance to the central line**: totality is longest on the central line and shortens quickly near the limits, where the edge of the shadow only grazes the observer. Halfway between the central line and a limit, totality still lasts about 87 % of its central value; at 10 % of the half-width from the limit, it falls to about 44 %.
- **Position along the path**: the duration on the central line increases towards Egypt, where the Sun is higher, the observer is closer to the Moon and the Earth's rotation follows the shadow more efficiently. It reaches its maximum of **6 min 23 s** near Luxor.
- **Altitude and relief**: an elevated site is very slightly closer to the Moon; its effect is small compared with the position in the path.

## How often do total eclipses occur?

There are between two and five solar eclipses every year somewhere on Earth, and a total eclipse occurs on average about every 18 months. But because the path of totality is so narrow, a given place sees a total eclipse only very rarely — on average once every few centuries.

## The 2027 eclipse in Tunisia

The path of totality enters Tunisia from Algeria around the governorates of Kasserine and Gafsa and leaves the country over the Gulf of Gabès and the region of Médenine and Djerba. Totality takes place between about 10:04 and 10:14 Tunisian time, with the Sun high in the south-eastern sky. Sfax, the country's second city, lies close to the central line; Tunis, Sousse and Monastir are outside the path.

<h2 id="method">How are the predictions on this site computed?</h2>

All times and durations are computed by this site from the **Besselian elements** published by NASA (F. Espenak). These polynomial coefficients describe the position and the size of the Moon's shadow over time. For any location, the engine projects the observer onto the "fundamental plane" perpendicular to the shadow axis and finds the instants when the observer enters and leaves the penumbra and the umbra (method of the *Explanatory Supplement to the Astronomical Almanac* and of J. Meeus).

- **ΔT** (the difference between Terrestrial Time and Universal Time) is set to **69.2 s**, consistent with recent measurements of the Earth's rotation, instead of the 76 s extrapolated by NASA when the elements were computed. This shifts the path by about 3 km in longitude.
- **Validation**: with NASA's ΔT, the engine reproduces NASA's published central-line durations to within one second and the limits of totality to within half a kilometre, and agrees with an independent library (Astronomy Engine) to within about 2–3 seconds for the partial-phase contacts and the maximum; the start and end of totality differ by a few seconds, more near the southern limit. See the [sources and methods](../sources/) page for the full comparison.
- **Limits of accuracy**: the edge of the Moon is not smooth. Its mountains and valleys shift the limits of the path by up to 1–2 km and change durations near the limits by several seconds. The computations are made at sea level and ignore local relief.
