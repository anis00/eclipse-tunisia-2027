/** Renders the local circumstances of the eclipse for a location (browser side). */
import { eclipseAt, limitInfo, NEAR_LIMIT_KM, type LocalCircumstances } from '../lib/eclipse/index.ts';
import { formatDuration, formatMagnitude, formatNumber, formatObscuration, formatTime } from '../lib/format.ts';
import { clientI18n, escapeHtml, fill } from './i18n-client.ts';

export interface Place {
  lat: number;
  lon: number;
  label?: string;
}

export function validateCoords(lat: number, lon: number): { lat?: string; lon?: string } {
  const { d } = clientI18n();
  const err: { lat?: string; lon?: string } = {};
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) err.lat = d.calc.errLat;
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) err.lon = d.calc.errLon;
  return err;
}

/** `compact` drops the UTC column (narrow side panel of the map). */
export function renderResults(container: HTMLElement, place: Place, compact = false): LocalCircumstances {
  const { lang, d } = clientI18n();
  const e = eclipseAt(place.lat, place.lon);
  const total = e.kind === 'total';
  const lim = e.kind === 'none' ? null : limitInfo(place.lat, place.lon);
  // Coordinates use the technical notation (decimal point) in every language to avoid ambiguity.
  const coords = `${Math.abs(place.lat).toFixed(4)}° ${place.lat >= 0 ? 'N' : 'S'}, ${Math.abs(place.lon).toFixed(4)}° ${place.lon >= 0 ? 'E' : 'W'}`;
  const parts: string[] = [];

  parts.push(
    `<h3 class="res-place">${place.label ? `${escapeHtml(place.label)} <span class="res-coords ltr">(${coords})</span>` : `<span class="ltr">${coords}</span>`}</h3>`,
  );

  if (e.kind === 'none') {
    parts.push(`<p class="notice notice-warn">${d.calc.noEclipse}</p>`);
    container.innerHTML = parts.join('');
    return e;
  }

  parts.push(
    total
      ? `<p class="notice notice-ok"><span class="badge badge-total">${d.common.total}</span> ${d.calc.totalityHere}</p>`
      : `<p class="notice notice-danger"><span class="badge badge-partial">${d.common.partial}</span> ${d.calc.noTotality}</p>`,
  );

  if (lim) {
    const km = formatNumber(Math.max(lim.km, 0.1), lang, lim.km < 10 ? 1 : 0);
    if (lim.km < NEAR_LIMIT_KM) parts.push(`<p class="notice notice-warn">${fill(d.calc.nearLimit, { km })}</p>`);
    else if (lim.inside) parts.push(`<p class="res-note">${fill(d.calc.insideMargin, { km })}</p>`);
    if (!lim.inside && lim.km < 600) {
      parts.push(`<p class="res-note">${fill(d.calc.distanceToPath, { km, dir: lim.direction === 'north' ? d.calc.north : d.calc.south })}</p>`);
    }
  }

  const row = (label: string, ev: LocalCircumstances['c1'], strong = false) =>
    ev
      ? `<tr${strong ? ' class="strong"' : ''}><th scope="row">${label}</th><td class="num">${formatTime(ev.time, lang)}</td>${compact ? '' : `<td class="num">${formatTime(ev.time, lang, 'UTC')}</td>`}<td class="num">${formatNumber(ev.sun.altitude, lang, 0)}° / ${formatNumber(ev.sun.azimuth, lang, 0)}°</td></tr>`
      : '';
  parts.push(`<div class="table-wrap" tabindex="0"><table>
    <thead><tr><th scope="col">${d.calc.event}</th><th scope="col" class="num">${d.common.localTime}</th>${compact ? '' : `<th scope="col" class="num">${d.common.utc}</th>`}<th scope="col" class="num">${d.calc.sun}<br><small>${d.calc.altitude} / ${d.calc.azimuth}</small></th></tr></thead>
    <tbody>${row(d.calc.c1, e.c1)}${row(d.calc.c2, e.c2, true)}${row(d.calc.max, e.max, true)}${row(d.calc.c3, e.c3, true)}${row(d.calc.c4, e.c4)}</tbody>
  </table></div>`);

  parts.push(`<dl class="res-figures">
    <div><dt>${d.calc.duration}</dt><dd>${total ? formatDuration(e.centralDuration!, lang) : '—'}</dd></div>
    <div><dt>${d.calc.magnitude}</dt><dd>${formatMagnitude(e.max!.magnitude, total, lang)}</dd><dd class="help">${d.calc.magnitudeHelp}</dd></div>
    <div><dt>${d.calc.obscuration}</dt><dd>${formatObscuration(e.max!.obscuration, total, lang)}</dd><dd class="help">${d.calc.obscurationHelp}</dd></div>
  </dl>`);

  if (e.horizonLimited) parts.push(`<p class="notice notice-warn">${d.calc.horizon}</p>`);
  parts.push(`<p class="res-note">${d.calc.timeNote}</p>`);
  container.innerHTML = parts.join('');
  return e;
}
