# Redgrass Tackle — Beneath the Surface

Independent, dependency-free 2D educational simulator. No changes to Build-a-Box, homepage banners, lake cards, Big Cartel, or Wix page code.

## Current status

- Working standalone interactive prototype in `beneath-the-surface/`
- Intended GitHub Pages location after merge: https://warrencooper10.github.io/redgrasstackle-buildabox/beneath-the-surface/
- **Not yet placed into a Wix Classic Editor page**. Existing Classic Editor page geometry and iframe elements are not managed by GitHub/Velo source code. Add the subpage and embed in Wix's graphical editor; leave nav link undecided.
- Educational illustration, **not** a quantitative lake model, advice on bait selection, or actual fish vision.

## Experience

- Fixed illustrative bait silhouette, no profile selector.
- Select 1 of 5 initial Redgrass color references: Monkey Milk, True Minnow, Sunrise Orange, Red Belly, ToadFrog.
- Clear / Stained / Muddy water.
- Full Sun / Partly Cloudy / Overcast (100% cloud cover).
- **Human** visual approximation / **Fish** research-informed *illustrative palette*.
- Cast; readable water-entry SPLASH! ripple; cinematic tracking zoom; **16.8-second** continuous descent from 0 to 30 ft; hold; **15.2-second** diagonal retrieve (both 4× slower than v1).
- Dynamic water-specific educational tags at SPLASH!, 1 ft, 5 ft, 10 ft, 20 ft and 30 ft, with research link; milestone captions remain readable and repeat on ascent.
- Pause/resume, replay, and drag depth scrubber.
- Field notes react to conditions, linking directly to research.
- Responsive layout; full document scroll rather than internal controls scrollbars; reduced-motion behavior.
- 90 scenario combinations, with continuous depth interpolation.

## What is and is not modeled

The application uses a broad RGB attenuation illustration:

`relative light channel at depth z = weather factor × exp(−k_channel × z_meters)`

All optical coefficients (per meter), three sky presets, representative bait RGB colors, scattering veil and fish-palette mapping are **example values chosen for educational clarity**. They are not sourced field measurements, measured material reflectance, a full spectral radiative-transfer model, or real retinal sensitivity functions. Fish mode applies an **illustrative** red/green-sensitive re-palette to the bait while only lightly desaturating the water itself, preserving clear water's blue-green character, stained water's green-brown character and muddy water's brown character. Related-sunfish research does not imply that all fish-view water should be green. This is **not** direct species-specific modeling or a claim that crappie see the rendered RGB values. Camera zoom, apparent lure size and exposure are cinematic conventions.

Stained vs muddy is intentionally treated as different kinds of optical conditions, not just a uniform darkening filter. The illustrative background and contrast fade faster in muddy water.

We do not suggest any bait is better, predict fish response, teach rigging/weight/retrieve, or claim 30 ft automatically means darkness. A '1 FT' milestone notes that the bait is easy to recognize in our *clear-water example*, not that it is universally 100% visible in shallow water.

## Grounding and limitations — primary sources

- [USGS — Introduction to Aquatic Remote Sensing](https://www.usgs.gov/centers/western-geographic-science-center/introduction-aquatic-remote-sensing): particles, dissolved colored matter and water jointly control light and color.
- [USGS — Vertical Attenuation of Light in Charlotte Harbor](https://www.usgs.gov/publications/vertical-attenuation-light-charlotte-harbor-a-shallow-subtropical-estuary-south): different constituents can alter transmission by wavelength, and measured patterns vary by environment. Estuary example, not a Mississippi lake calibration.
- [White crappie visual acuity study](https://pubmed.ncbi.nlm.nih.gov/2354354/): crappie retinal cone density and visually guided prey pursuit; **does not establish exact full color perception**.
- [2025 Centrarchid visual-systems study](https://pmc.ncbi.nlm.nih.gov/articles/PMC11974496/): green- and red-sensitive opsins observed in six studied sunfish-family species. **Not an exact crappie spectral model**.

## Wix integration handoff

1. Existing site: **My Site 4**, Wix Classic Editor. Create a page named *Beneath the Surface* (e.g. `/beneath-the-surface`) with Redgrass site chrome; page destination must be confirmed in the Wix editor.
2. Add a full-width HTML iframe/embed of `https://warrencooper10.github.io/redgrasstackle-buildabox/beneath-the-surface/`.
3. Let the Wix **page** scroll; make the embedded element sufficiently tall so the simulator and its research references do not create an *inner* scrollbar. Verify desktop and mobile separately. A full-height iframe may be several thousand pixels tall due to bibliography.
4. Test all four controls, cast, fall, depth slider, pause/resume, reel, research links, mobile tap targets and layout inside Wix Test Site.
5. Do not add a home-banner/header link until the owner chooses its placement. Do not alter existing navigation.

Do not replace existing Wix page markup or entire site with the standalone HTML.

## Local checks

```bash
node --check beneath-the-surface/app.js
node beneath-the-surface/tests/smoke.mjs
```

Open `beneath-the-surface/index.html` in a browser for visual inspection. No build step or third-party runtime assets are needed.
