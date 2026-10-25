/**
 * Binds a calculator form (components/CalculatorForm.astro) to a callback.
 * Handles town selection, coordinate validation, geolocation (only on explicit
 * user request) and the shareable URL (?lat=…&lon=…&place=…).
 */
import { clientI18n } from './i18n-client.ts';
import { validateCoords, type Place } from './results.ts';

export function bindCalculatorForm(form: HTMLFormElement, onPlace: (p: Place) => void) {
  const { d } = clientI18n();
  const city = form.querySelector<HTMLSelectElement>('[data-city]')!;
  const lat = form.querySelector<HTMLInputElement>('input[data-lat]')!;
  const lon = form.querySelector<HTMLInputElement>('input[data-lon]')!;
  const latErr = form.querySelector<HTMLElement>('[data-lat-err]')!;
  const lonErr = form.querySelector<HTMLElement>('[data-lon-err]')!;
  const geoErr = form.querySelector<HTMLElement>('[data-geo-err]')!;
  const locate = form.querySelector<HTMLButtonElement>('[data-locate]')!;
  const locateLabel = locate.querySelector('span')!;

  const parse = (s: string) => Number(s.trim().replace(',', '.').replace('−', '-'));

  const showErrors = (err: { lat?: string; lon?: string }) => {
    latErr.textContent = err.lat ?? '';
    lonErr.textContent = err.lon ?? '';
    lat.setAttribute('aria-invalid', String(Boolean(err.lat)));
    lon.setAttribute('aria-invalid', String(Boolean(err.lon)));
  };

  const emit = (p: Place, id?: string) => {
    const url = new URL(location.href);
    url.searchParams.set('lat', p.lat.toFixed(5));
    url.searchParams.set('lon', p.lon.toFixed(5));
    if (id) url.searchParams.set('place', id);
    else url.searchParams.delete('place');
    history.replaceState(null, '', url);
    onPlace(p);
  };

  const fromCity = (id: string) => {
    const opt = [...city.options].find((o) => o.value === id);
    if (!opt?.value) return false;
    city.value = id;
    const p = { lat: Number(opt.dataset.lat), lon: Number(opt.dataset.lon), label: opt.textContent!.trim() };
    lat.value = String(p.lat);
    lon.value = String(p.lon);
    showErrors({});
    emit(p, id);
    return true;
  };

  city.addEventListener('change', () => fromCity(city.value));

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const p = { lat: parse(lat.value), lon: parse(lon.value) };
    const err = validateCoords(p.lat, p.lon);
    showErrors(err);
    if (err.lat || err.lon) {
      (err.lat ? lat : lon).focus();
      return;
    }
    city.value = '';
    emit(p);
  });

  locate.addEventListener('click', () => {
    geoErr.textContent = '';
    if (!('geolocation' in navigator)) {
      geoErr.textContent = d.calc.errGeoUnsupported;
      return;
    }
    locate.disabled = true;
    locateLabel.textContent = d.calc.locating;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locate.disabled = false;
        locateLabel.textContent = d.calc.locate;
        const p = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        lat.value = p.lat.toFixed(5);
        lon.value = p.lon.toFixed(5);
        city.value = '';
        showErrors({});
        // The position stays in the browser: it is only used for the computation.
        onPlace(p);
      },
      (error) => {
        locate.disabled = false;
        locateLabel.textContent = d.calc.locate;
        geoErr.textContent =
          error.code === error.PERMISSION_DENIED
            ? d.calc.errGeoDenied
            : error.code === error.TIMEOUT
              ? d.calc.errGeoTimeout
              : d.calc.errGeoUnavailable;
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    );
  });

  return {
    /** Restores the state from the URL; returns true if a place was loaded. */
    restore(): boolean {
      const q = new URLSearchParams(location.search);
      const id = q.get('place');
      if (id && fromCity(id)) return true;
      const p = { lat: parse(q.get('lat') ?? ''), lon: parse(q.get('lon') ?? '') };
      if (q.has('lat') && q.has('lon') && !validateCoords(p.lat, p.lon).lat && !validateCoords(p.lat, p.lon).lon) {
        lat.value = String(p.lat);
        lon.value = String(p.lon);
        onPlace(p);
        return true;
      }
      return false;
    },
    selectCity: fromCity,
    setCoords(p: Place) {
      lat.value = p.lat.toFixed(5);
      lon.value = p.lon.toFixed(5);
      city.value = '';
      showErrors({});
      emit(p);
    },
  };
}
