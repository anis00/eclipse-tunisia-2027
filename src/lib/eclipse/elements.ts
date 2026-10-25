/**
 * Polynomial Besselian elements of the total solar eclipse of 2027 August 2.
 *
 * Source: F. Espenak, NASA GSFC — "Besselian Elements - Total Solar Eclipse of
 * 2027 August 02", https://eclipse.gsfc.nasa.gov/SEsearch/SEdata.php?Ecl=+20270802
 * (consulted 2026-10-25). Ephemerides VSOP87 / ELP2000-82.
 * "Eclipse Predictions by Fred Espenak, NASA's GSFC".
 *
 * Every polynomial is evaluated as a0 + a1·t + a2·t² + a3·t³ where
 * t = (TDT − t0) in decimal hours.
 */
/** Polynomial coefficients a0…a3. */
export type Poly = [number, number, number, number];

export interface BesselianElements {
  /** Identifier, e.g. "2027-08-02" */
  id: string;
  /** Reference epoch t0, in hours TDT on the eclipse date */
  t0: number;
  /** Calendar date of the eclipse (UTC), ISO yyyy-mm-dd */
  date: string;
  /** ΔT = TDT − UT (seconds) used by the source of the elements */
  sourceDeltaT: number;
  x: Poly;
  y: Poly;
  /** Declination of the shadow axis (degrees) */
  d: Poly;
  /** Radius of the penumbral cone on the fundamental plane (Earth radii) */
  l1: Poly;
  /** Radius of the umbral cone on the fundamental plane (Earth radii) */
  l2: Poly;
  /** Greenwich hour angle of the shadow axis (degrees) */
  mu: Poly;
  tanF1: number;
  tanF2: number;
}

export const ECLIPSE_2027: BesselianElements = {
  id: '2027-08-02',
  t0: 10.0,
  date: '2027-08-02',
  sourceDeltaT: 76.0,
  x: [-0.019772, 0.5447123, -0.0000446, -0.0000092],
  y: [0.160061, -0.2111582, -0.0001217, 0.0000038],
  d: [17.7624702, -0.010181, -0.000004, 0],
  l1: [0.530596, 0.0000138, -0.0000128, 0],
  l2: [-0.015464, 0.0000137, -0.0000128, 0],
  mu: [328.422546, 15.0021, 0, 0],
  tanF1: 0.0046064,
  tanF2: 0.0045834,
};

/**
 * ΔT adopted for the published predictions (seconds).
 *
 * NASA's elements were computed in 2004–2009 with an extrapolated ΔT of 76.0 s.
 * Measured values have since flattened: ΔT ≈ 69.1 s in 2025 (IERS Bulletin A:
 * ΔT = 32.184 s + (TAI−UTC = 37 s) − (UT1−UTC)). We adopt 69.2 s for 2027 with an
 * estimated uncertainty of about ±1 s. See docs/ASTRONOMY.md for the impact
 * (≈ 0.03° shift in longitude of the path between ΔT = 76 s and 69.2 s).
 */
export const ADOPTED_DELTA_T = 69.2;
