// Copies third-party browser assets that must be served as standalone files.
import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('public/vendor', { recursive: true });
copyFileSync('node_modules/@mapbox/mapbox-gl-rtl-text/dist/mapbox-gl-rtl-text.js', 'public/vendor/mapbox-gl-rtl-text.js');
copyFileSync('node_modules/@mapbox/mapbox-gl-rtl-text/LICENSE.md', 'public/vendor/mapbox-gl-rtl-text.LICENSE.txt');
