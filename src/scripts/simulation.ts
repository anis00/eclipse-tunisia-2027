/**
 * Eclipse simulation: Sun and Moon disks as seen from the selected place,
 * drawn in SVG from the Besselian geometry (apparentDisks). Zenith-up view.
 */
import { disksAt, type LocalCircumstances } from '../lib/eclipse/index.ts';
import { formatPercent, formatTime } from '../lib/format.ts';
import { clientI18n } from './i18n-client.ts';

const SVG_NS = 'http://www.w3.org/2000/svg';
const R = 60; // Sun radius in SVG units
const MARGIN_MS = 6 * 60 * 1000;

export class EclipseSimulation {
  private root: HTMLElement;
  private svg: SVGSVGElement;
  private sky: SVGRectElement;
  private corona: SVGCircleElement;
  private moon: SVGCircleElement;
  private group: SVGGElement;
  private slider: HTMLInputElement;
  private playBtn: HTMLButtonElement;
  private timeOut: HTMLElement;
  private covOut: HTMLElement;
  private speedSel: HTMLSelectElement;
  private place: { lat: number; lon: number } | null = null;
  private start = 0;
  private end = 0;
  private c2: number | null = null;
  private c3: number | null = null;
  private playing = false;
  private last = 0;
  private raf = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    const q = <T extends Element>(s: string) => root.querySelector<T>(s)!;
    this.svg = q<SVGSVGElement>('svg');
    this.slider = q<HTMLInputElement>('input[type=range]');
    this.playBtn = q<HTMLButtonElement>('[data-sim=play]');
    this.timeOut = q<HTMLElement>('[data-sim=time]');
    this.covOut = q<HTMLElement>('[data-sim=covered]');
    this.speedSel = q<HTMLSelectElement>('[data-sim=speed]');

    this.svg.setAttribute('viewBox', '-150 -150 300 300');
    this.sky = this.el('rect', { x: -150, y: -150, width: 300, height: 300, fill: '#5fa8e6' }) as SVGRectElement;
    this.corona = this.el('circle', { r: R * 2.1, fill: 'url(#sim-corona)', opacity: 0 }) as SVGCircleElement;
    const defs = document.createElementNS(SVG_NS, 'defs');
    defs.innerHTML = `<radialGradient id="sim-corona"><stop offset="0.45" stop-color="#fffbe9" stop-opacity="0.95"/><stop offset="0.6" stop-color="#e8e6ff" stop-opacity="0.45"/><stop offset="1" stop-color="#a597ff" stop-opacity="0"/></radialGradient><radialGradient id="sim-sun"><stop offset="0.7" stop-color="#fff6d6"/><stop offset="1" stop-color="#ffd27a"/></radialGradient>`;
    this.group = document.createElementNS(SVG_NS, 'g');
    const sun = this.el('circle', { r: R, fill: 'url(#sim-sun)' });
    this.moon = this.el('circle', { r: R, fill: '#0b0d18' }) as SVGCircleElement;
    this.svg.append(defs, this.sky, this.corona, this.group);
    this.group.append(sun, this.moon);

    this.slider.addEventListener('input', () => this.draw(Number(this.slider.value)));
    this.playBtn.addEventListener('click', () => (this.playing ? this.pause() : this.play()));
    q<HTMLButtonElement>('[data-sim=reset]').addEventListener('click', () => {
      this.pause();
      this.draw(this.start);
    });
    root.hidden = true;
  }

  private el(name: string, attrs: Record<string, string | number>): SVGElement {
    const e = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    return e;
  }

  setPlace(lat: number, lon: number, e: LocalCircumstances): void {
    this.pause();
    if (!e.c1 || !e.c4) {
      this.root.hidden = true;
      this.place = null;
      return;
    }
    this.place = { lat, lon };
    this.start = e.c1.time.getTime() - MARGIN_MS;
    this.end = e.c4.time.getTime() + MARGIN_MS;
    this.c2 = e.c2?.time.getTime() ?? null;
    this.c3 = e.c3?.time.getTime() ?? null;
    this.slider.min = String(this.start);
    this.slider.max = String(this.end);
    this.slider.step = '1000';
    this.root.hidden = false;
    // Start just before totality (or maximum) so the interesting part is visible at once.
    this.draw((this.c2 ?? e.max!.time.getTime()) - 90_000);
  }

  private draw(time: number): void {
    if (!this.place) return;
    const { lang, d } = clientI18n();
    this.slider.value = String(time);
    const disks = disksAt(this.place.lat, this.place.lon, new Date(time));
    // North-up, east-left frame → rotate by the parallactic angle for a zenith-up view.
    this.moon.setAttribute('cx', String(-disks.dx * R));
    this.moon.setAttribute('cy', String(-disks.dy * R));
    this.moon.setAttribute('r', String(disks.moonRadius * R));
    this.group.setAttribute('transform', `rotate(${disks.parallacticAngle})`);

    const inTotality = this.c2 !== null && this.c3 !== null && time >= this.c2 && time <= this.c3;
    // Illustrative sky brightness: the sky only darkens strongly above ~90 % obscuration.
    const light = inTotality ? 0.06 : Math.max(0.12, 1 - Math.pow(disks.obscuration, 6) * 0.85);
    const mix = (a: number, b: number) => Math.round(b + (a - b) * light);
    this.sky.setAttribute('fill', `rgb(${mix(95, 8)},${mix(168, 12)},${mix(230, 35)})`);
    this.corona.setAttribute('opacity', inTotality ? '1' : '0');

    this.timeOut.textContent = formatTime(new Date(time), lang);
    const cov = inTotality ? 1 : Math.min(disks.obscuration, 0.9999);
    this.covOut.textContent = `${formatPercent(cov, lang, cov > 0.99 && !inTotality ? 2 : 1)} ${d.sim.covered}`;
    this.slider.setAttribute('aria-valuetext', `${this.timeOut.textContent} — ${this.covOut.textContent}`);
  }

  play(): void {
    if (!this.place) return;
    if (Number(this.slider.value) >= this.end) this.draw(this.start);
    this.playing = true;
    this.playBtn.textContent = clientI18n().d.sim.pause;
    this.playBtn.setAttribute('aria-pressed', 'true');
    this.last = performance.now();
    const step = (now: number) => {
      if (!this.playing) return;
      const dt = now - this.last;
      this.last = now;
      const next = Number(this.slider.value) + dt * Number(this.speedSel.value);
      if (next >= this.end) {
        this.draw(this.end);
        this.pause();
        return;
      }
      this.draw(next);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.playBtn.textContent = clientI18n().d.sim.play;
    this.playBtn.setAttribute('aria-pressed', 'false');
  }
}
