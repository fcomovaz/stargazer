/**
 * Stargazer — Pure JS Astronomy App
 * Uses astronomy-engine (https://github.com/cosinekitty/astronomy) for
 * all celestial calculations, replacing the Python/PyEphem backend.
 * Compatible with GitHub Pages (no server required).
 */

document.addEventListener('DOMContentLoaded', () => {

    // ─── State ─────────────────────────────────────────────────────────────────
    let userLocation = null;
    let allObjects   = [];
    let currentMode  = 'eyes';

    const MAG_LIMIT_EYES = 6.0;
    const MAG_LIMIT_TELE = 10.0;

    // ─── Catalog: deep-sky objects & bright stars ───────────────────────────────
    // RA in decimal hours, Dec in decimal degrees
    const DSO_CATALOG = [
        { id: 'm31',       name: 'Andromeda Galaxy (M31)',       type: 'Galaxy',            ra: 0.7123,  dec: 41.269,  mag: 3.4,  description: 'The nearest major galaxy to the Milky Way.',                                                tips: 'Look for a faint fuzzy patch. Best seen with averted vision.' },
        { id: 'm42',       name: 'Orion Nebula (M42)',           type: 'Nebula',            ra: 5.5881,  dec: -5.391, mag: 4.0,  description: 'A diffuse nebula situated in the Milky Way, south of Orion\'s Belt.',                      tips: 'Visible to the naked eye as the middle "star" in Orion\'s sword. Telescopes reveal a glowing cloud.' },
        { id: 'm45',       name: 'Pleiades (M45)',               type: 'Open Cluster',      ra: 3.7900,  dec: 24.117,  mag: 1.6,  description: 'Also known as the Seven Sisters, an open star cluster of hot B-type stars.',               tips: 'Easily visible to the naked eye as a tiny dipper shape.' },
        { id: 'm13',       name: 'Hercules Cluster (M13)',       type: 'Globular Cluster',  ra: 16.6948, dec: 36.460,  mag: 5.8,  description: 'A globular cluster of several hundred thousand stars in Hercules.',                        tips: 'Barely visible to the naked eye under dark skies; a telescope resolves it into a stunning ball of stars.' },
        { id: 'm8',        name: 'Lagoon Nebula (M8)',           type: 'Nebula',            ra: 18.0603, dec: -24.387, mag: 6.0,  description: 'A giant interstellar cloud in the constellation Sagittarius.',                             tips: 'Visible as a faint grey patch in binoculars or a small telescope.' },
        { id: 'm57',       name: 'Ring Nebula (M57)',            type: 'Planetary Nebula',  ra: 18.8931, dec: 33.029,  mag: 8.8,  description: 'A planetary nebula in the northern constellation of Lyra.',                               tips: 'Requires a telescope. Looks like a tiny smoke ring.' },
        { id: 'm1',        name: 'Crab Nebula (M1)',             type: 'Supernova Remnant', ra: 5.5755,  dec: 22.015,  mag: 8.4,  description: 'A supernova remnant and pulsar wind nebula in the constellation of Taurus.',               tips: 'Requires a telescope. Appears as a faint, elongated smudge.' },
        { id: 'sirius',    name: 'Sirius',                       type: 'Star',              ra: 6.7525,  dec: -16.716, mag: -1.46, description: 'The brightest star in the night sky.',                                                    tips: 'Flashes with different colors when low on the horizon due to atmospheric refraction.' },
        { id: 'arcturus',  name: 'Arcturus',                     type: 'Star',              ra: 14.2611, dec: 19.183,  mag: -0.05, description: 'The brightest star in the northern celestial hemisphere.',                                tips: 'Follow the arc of the Big Dipper\'s handle to "arc to Arcturus".' },
        { id: 'vega',      name: 'Vega',                         type: 'Star',              ra: 18.6157, dec: 38.784,  mag: 0.03, description: 'The brightest star in the northern constellation of Lyra.',                               tips: 'Part of the Summer Triangle asterism. Very bright and bluish-white.' },
        { id: 'betelgeuse',name: 'Betelgeuse',                   type: 'Star',              ra: 5.9195,  dec: 7.407,   mag: 0.45, description: 'A red supergiant star in the constellation of Orion.',                                    tips: 'Notice its distinctly orange-red color compared to other stars in Orion.' },
        { id: 'm44',       name: 'Beehive Cluster (M44)',        type: 'Open Cluster',      ra: 8.6742,  dec: 19.617,  mag: 3.7,  description: 'A large open cluster in the constellation Cancer, one of the nearest to Earth.',           tips: 'Visible to the naked eye as a fuzzy patch; binoculars resolve dozens of stars.' },
        { id: 'm7',        name: 'Ptolemy Cluster (M7)',         type: 'Open Cluster',      ra: 17.8978, dec: -34.793, mag: 3.3,  description: 'A brilliant open cluster near the tail of Scorpius, known since antiquity.',              tips: 'Wonderful in binoculars. Look for it near the "stinger" of Scorpius.' },
        { id: 'm6',        name: 'Butterfly Cluster (M6)',       type: 'Open Cluster',      ra: 17.6686, dec: -32.217, mag: 4.2,  description: 'An open cluster in Scorpius whose brightest stars form a butterfly shape.',               tips: 'Best viewed with binoculars or a low-power wide-field eyepiece.' },
        { id: 'm35',       name: 'M35 Cluster',                  type: 'Open Cluster',      ra: 6.1489,  dec: 24.333,  mag: 5.3,  description: 'A rich open cluster at the foot of Gemini.',                                             tips: 'A telescope reveals a second fainter cluster (NGC 2158) right behind it.' },
        { id: 'canopus',   name: 'Canopus',                      type: 'Star',              ra: 6.3992,  dec: -52.696, mag: -0.74, description: 'The second brightest star in the night sky, in the constellation Carina.',               tips: 'Visible from southern latitudes; used as a navigation star by spacecraft.' },
        { id: 'capella',   name: 'Capella',                      type: 'Star',              ra: 5.2778,  dec: 45.998,  mag: 0.08, description: 'The brightest star in the constellation Auriga and sixth brightest in the night sky.',    tips: 'Actually a close pair of giant stars. Yellowish color similar to the Sun.' },
        { id: 'rigel',     name: 'Rigel',                        type: 'Star',              ra: 5.2423,  dec: -8.202,  mag: 0.13, description: 'The brightest star in Orion and seventh brightest in the night sky.',                    tips: 'A blue supergiant — contrast its cool blue-white color with orange Betelgeuse.' },
        { id: 'procyon',   name: 'Procyon',                      type: 'Star',              ra: 7.6553,  dec: 5.225,   mag: 0.38, description: 'The brightest star in the constellation Canis Minor.',                                   tips: 'One of the three stars of the Winter Triangle, along with Sirius and Betelgeuse.' },
        { id: 'altair',    name: 'Altair',                       type: 'Star',              ra: 19.8464, dec: 8.868,   mag: 0.77, description: 'The brightest star in Aquila and a vertex of the Summer Triangle.',                      tips: 'Spins so fast it is noticeably oblate — its equator bulges outward.' },
        { id: 'aldebaran', name: 'Aldebaran',                    type: 'Star',              ra: 4.5987,  dec: 16.509,  mag: 0.87, description: 'The brightest star in Taurus, marking the eye of the Bull.',                            tips: 'Its deep orange-red color is striking. The Hyades cluster lies in the same direction.' },
        { id: 'spica',     name: 'Spica',                        type: 'Star',              ra: 13.4199, dec: -11.161, mag: 0.98, description: 'The brightest star in Virgo and fifteenth brightest overall.',                           tips: '"Arc to Arcturus, then speed on to Spica" — follow the Big Dipper handle.' },
        { id: 'antares',   name: 'Antares',                      type: 'Star',              ra: 16.4901, dec: -26.432, mag: 1.06, description: 'A red supergiant and the brightest star in Scorpius.',                                   tips: 'Its deep red color rivals Mars, hence the name (Anti-Ares).' },
    ];

    // Solar system bodies supported by astronomy-engine
    const SOLAR_BODIES = [
        { id: 'moon',    name: 'Moon',    body: 'Moon',    type: "Earth's Moon", defaultMag: -12.7, description: 'Our natural satellite.', tips: 'Look for craters and seas (maria) along the terminator line.' },
        { id: 'mercury', name: 'Mercury', body: 'Mercury', type: 'Planet',       defaultMag: 0.0,   description: 'The innermost and smallest planet.', tips: 'Visible near the sun just after sunset or before sunrise.' },
        { id: 'venus',   name: 'Venus',   body: 'Venus',   type: 'Planet',       defaultMag: -4.4,  description: 'The brightest planet in the sky.', tips: 'Often called the morning or evening star.' },
        { id: 'mars',    name: 'Mars',    body: 'Mars',    type: 'Planet',       defaultMag: 0.5,   description: 'The Red Planet.', tips: 'Look for its distinct reddish hue.' },
        { id: 'jupiter', name: 'Jupiter', body: 'Jupiter', type: 'Planet',       defaultMag: -2.0,  description: 'The largest planet in the solar system.', tips: 'You can see its four largest moons with binoculars or a small telescope.' },
        { id: 'saturn',  name: 'Saturn',  body: 'Saturn',  type: 'Planet',       defaultMag: 0.5,   description: 'The ringed jewel of the solar system.', tips: 'Famous for its rings. Requires a telescope to see them clearly.' },
        { id: 'uranus',  name: 'Uranus',  body: 'Uranus',  type: 'Planet',       defaultMag: 5.7,   description: 'An ice giant with a tilted rotation axis.', tips: 'Barely visible to the naked eye. Looks like a tiny blue-green disk in a telescope.' },
        { id: 'neptune', name: 'Neptune', body: 'Neptune', type: 'Planet',       defaultMag: 7.8,   description: 'The most distant planet in the solar system.', tips: 'Requires a telescope. Looks like a tiny blue dot.' },
    ];

    // ─── DOM Elements ───────────────────────────────────────────────────────────
    const themeToggleBtn    = document.getElementById('theme-toggle');
    const htmlEl            = document.documentElement;
    const locateBtn         = document.getElementById('locate-btn');
    const locText           = document.getElementById('loc-text');
    const objectsGrid       = document.getElementById('objects-grid');
    const template          = document.getElementById('object-card-template');
    const loader            = document.getElementById('loader');
    const emptyState        = document.getElementById('empty-state');
    const objectCount       = document.getElementById('object-count');
    const compassContainer  = document.getElementById('compass-container');
    const deviceAz          = document.getElementById('device-az');

    // ─── Theme ──────────────────────────────────────────────────────────────────
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // ─── Modal ──────────────────────────────────────────────────────────────────
    const helpBtn    = document.getElementById('help-btn');
    const helpModal  = document.getElementById('help-modal');
    const closeModal = document.querySelector('.close-modal');

    helpBtn.addEventListener('click', () => helpModal.classList.add('show'));
    closeModal.addEventListener('click', () => helpModal.classList.remove('show'));
    window.addEventListener('click', e => { if (e.target === helpModal) helpModal.classList.remove('show'); });

    // ─── Easy Find Toggle ───────────────────────────────────────────────────────
    const easyFindToggle = document.getElementById('easy-find-toggle');
    if (!easyFindToggle.checked) document.body.classList.add('hide-easy-find');
    easyFindToggle.addEventListener('change', e => {
        document.body.classList.toggle('hide-easy-find', !e.target.checked);
    });

    // ─── Observation Mode ───────────────────────────────────────────────────────
    document.querySelectorAll('input[name="obs-mode"]').forEach(radio => {
        radio.addEventListener('change', e => {
            currentMode = e.target.value;
            renderObjects();
        });
    });

    // ─── Geolocation ────────────────────────────────────────────────────────────
    locateBtn.addEventListener('click', () => {
        if (!navigator.geolocation) { showToast('Geolocation is not supported by your browser.'); return; }

        locText.textContent  = 'Locating…';
        locateBtn.disabled   = true;

        navigator.geolocation.getCurrentPosition(
            pos => {
                userLocation = {
                    lat:       pos.coords.latitude,
                    lon:       pos.coords.longitude,
                    elevation: pos.coords.altitude || 0
                };
                locText.textContent = `${userLocation.lat.toFixed(4)}°, ${userLocation.lon.toFixed(4)}°`;
                locateBtn.disabled  = false;
                initCompass();
                calculateAndRender();
            },
            () => {
                locText.textContent = 'Location access denied';
                locateBtn.disabled  = false;
                showToast('Unable to retrieve your location. Please enable location services.');
            }
        );
    });

    // ─── Compass ────────────────────────────────────────────────────────────────
    function initCompass() {
        if (!window.DeviceOrientationEvent) return;
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(state => {
                    if (state === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, true);
                        compassContainer.style.display = 'flex';
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            compassContainer.style.display = 'flex';
        }
    }

    function handleOrientation(event) {
        const compass = event.webkitCompassHeading ?? Math.abs((event.alpha ?? 0) - 360);
        if (!isNaN(compass)) deviceAz.textContent = `${Math.round(compass)}°`;
    }

    // ─── Astronomy Calculations (astronomy-engine) ───────────────────────────────
    function calculateAndRender() {
        if (!userLocation) return;

        objectsGrid.innerHTML = '';
        loader.style.display  = 'block';
        emptyState.style.display = 'none';
        objectCount.textContent  = 'Calculating…';

        // Run asynchronously so the spinner has time to render
        setTimeout(() => {
            try {
                allObjects = computeVisibleObjects();
                renderObjects();
            } catch (err) {
                console.error('Astronomy calculation error:', err);
                loader.style.display = 'none';
                objectsGrid.innerHTML = '<div class="empty-state"><p>Error calculating celestial data. Please try again.</p></div>';
            }
        }, 50);
    }

    function computeVisibleObjects() {
        const { lat, lon, elevation } = userLocation;
        const observer = new Astronomy.Observer(lat, lon, elevation);
        const date     = new Date();
        const astroTime = Astronomy.MakeTime(date);  // astronomy-engine Time object
        const results  = [];

        // ── Solar system bodies ──────────────────────────────────────────────────
        for (const planet of SOLAR_BODIES) {
            try {
                // Get equatorial coordinates (RA in hours, Dec in degrees, ofDate=true)
                const eq  = Astronomy.Equator(planet.body, astroTime, observer, true, true);
                const hor = Astronomy.Horizon(astroTime, observer, eq.ra, eq.dec, 'normal');
                const alt = hor.altitude;
                if (alt <= 0) continue;

                let mag = planet.defaultMag;
                try { mag = Astronomy.Illumination(planet.body, astroTime).mag; } catch (_) {}

                results.push({
                    id:          planet.id,
                    name:        planet.name,
                    type:        planet.type,
                    mag:         parseFloat(mag.toFixed(1)),
                    alt:         parseFloat(alt.toFixed(2)),
                    az:          parseFloat(hor.azimuth.toFixed(2)),
                    description: planet.description,
                    tips:        planet.tips
                });
            } catch (e) {
                console.warn(`Skipping ${planet.name}:`, e.message);
            }
        }

        // ── Deep-sky objects & stars ─────────────────────────────────────────────
        // astronomy-engine doesn't have a FixedBody API, so we use precise
        // spherical trigonometry (GMST → LST → HA → Alt/Az).
        for (const item of DSO_CATALOG) {
            const altAz = eqToHorizon(date, observer, item.ra, item.dec);
            if (!altAz || altAz.alt <= 0) continue;
            results.push({
                id:          item.id,
                name:        item.name,
                type:        item.type,
                mag:         item.mag,
                alt:         parseFloat(altAz.alt.toFixed(2)),
                az:          parseFloat(altAz.az.toFixed(2)),
                description: item.description,
                tips:        item.tips
            });
        }

        results.sort((a, b) => b.alt - a.alt);
        return results;
    }

    /**
     * Convert equatorial coordinates (RA in decimal hours, Dec in decimal degrees)
     * to local horizontal coordinates (altitude, azimuth) using spherical trigonometry.
     * This is a pure-math implementation — no server needed.
     *
     * @param {Date}   date       - Current UTC date/time
     * @param {Object} observer   - astronomy-engine Observer object
     * @param {number} raHours    - Right Ascension in decimal hours
     * @param {number} decDeg     - Declination in decimal degrees
     * @returns {{ alt: number, az: number }}
     */
    function eqToHorizon(date, observer, raHours, decDeg) {
        const toRad = x => x * Math.PI / 180;
        const toDeg = x => x * 180 / Math.PI;

        // Greenwich Mean Sidereal Time (approximate, good to ~0.1°)
        const J2000    = 2451545.0;
        const jd       = dateToJD(date);
        const T        = (jd - J2000) / 36525;
        const gmst0    = 100.4606184 + 36000.77004 * T + 0.000387933 * T * T;
        const gmstDeg  = ((gmst0 + 360.98564724 * (jd - Math.floor(jd))) % 360 + 360) % 360;

        // Local Sidereal Time
        const lstDeg   = (gmstDeg + observer.longitude + 360) % 360;

        // Hour Angle
        const haDeg    = (lstDeg - raHours * 15 + 360) % 360;
        const ha       = toRad(haDeg);
        const dec      = toRad(decDeg);
        const lat      = toRad(observer.latitude);

        // Altitude
        const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
        const alt    = toDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));

        // Azimuth (N=0, clockwise)
        const cosAz  = (Math.sin(dec) - Math.sin(toRad(alt)) * Math.sin(lat)) / (Math.cos(toRad(alt)) * Math.cos(lat));
        let   az     = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
        if (Math.sin(ha) > 0) az = 360 - az;

        return { alt, az };
    }

    /** Julian Date from a JS Date object */
    function dateToJD(date) {
        return date.getTime() / 86400000 + 2440587.5;
    }

    // ─── Rendering ──────────────────────────────────────────────────────────────
    function renderObjects() {
        objectsGrid.innerHTML = '';
        loader.style.display  = 'none';

        if (!allObjects || allObjects.length === 0) {
            emptyState.style.display = 'block';
            objectCount.textContent  = '0 objects';
            return;
        }

        const magLimit      = currentMode === 'eyes' ? MAG_LIMIT_EYES : MAG_LIMIT_TELE;
        const visibleObjects = allObjects.filter(o => o.mag <= magLimit);

        if (visibleObjects.length === 0) {
            objectsGrid.innerHTML = `<div class="empty-state"><p>No objects visible within magnitude limit (${magLimit}).</p></div>`;
            objectCount.textContent = '0 objects';
            return;
        }

        objectCount.textContent = `${visibleObjects.length} object${visibleObjects.length !== 1 ? 's' : ''}`;

        visibleObjects.forEach((obj, i) => {
            const clone = template.content.cloneNode(true);

            clone.querySelector('.obj-name').textContent      = obj.name;
            clone.querySelector('.obj-type').textContent      = obj.type;
            clone.querySelector('.obj-desc').textContent      = obj.description;
            clone.querySelector('.obj-find-guide').textContent = getPositionDescription(obj.alt, obj.az);
            clone.querySelector('.obj-mag').textContent       = obj.mag.toFixed(1);
            clone.querySelector('.obj-alt').textContent       = `${obj.alt}°`;
            clone.querySelector('.obj-az').textContent        = `${obj.az}°`;

            // Stagger animation
            const card = clone.querySelector('.object-card');
            card.style.animationDelay = `${i * 60}ms`;

            const tipsEl = clone.querySelector('.obj-tips');
            if (obj.tips) {
                clone.querySelector('.tip-text').textContent = obj.tips;
            } else {
                tipsEl.style.display = 'none';
            }

            objectsGrid.appendChild(clone);
        });
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────
    function getPositionDescription(alt, az) {
        const directions = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'];
        const index      = Math.round(((az % 360) + 360) / 45) % 8;
        const cardinal   = directions[index];

        let altDesc;
        if      (alt < 10)  altDesc = 'very low on the horizon';
        else if (alt < 25)  altDesc = 'low in the sky';
        else if (alt < 50)  altDesc = 'about halfway up';
        else if (alt < 75)  altDesc = 'high in the sky';
        else                altDesc = 'almost directly overhead';

        const fists = Math.round(alt / 10);
        const fistStr = fists > 0 ? ` (~${fists} fist${fists !== 1 ? 's' : ''} above horizon)` : '';

        return `Look towards the ${cardinal}, ${altDesc}${fistStr}.`;
    }

    function showToast(msg) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

});
