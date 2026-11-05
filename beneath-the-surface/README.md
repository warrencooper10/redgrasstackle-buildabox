# Redgrass Tackle — Beneath the Surface

Independent, dependency-free 2D educational simulator. No changes to Build-a-Box, homepage banners, lake cards, Big Cartel, or Wix page code.

## Current status

- Working standalone interactive prototype in `beneath-the-surface/`
- Intended GitHub Pages location after merge: https://warrencooper10.github.io/redgrasstackle-buildabox/beneath-the-surface/
- **Not yet placed into a Wix Classic Editor page**. Existing Classic Editor page geometry and iframe elements are not managed by GitHub/Velo source code. Add the subpage and embed in Wix's graphical editor; leave nav link undecided.
- Educational illustration, **not** a quantitative lake model, advice on bait selection, or actual fish vision.

## Experience

- Fixed illustrative bait silhouette, no profile selector.
- Select 1 of **12** Redgrass colors: Monkey Milk, True Minnow, Sunrise Orange, Red Belly, ToadFrog, OG, Twilight, Lemon Pepper, Stingray, Tuxedo, Whitetreuse, Electric Blue.
- Clear / Stained / Muddy water.
- Full Sun / Partly Cloudy / Overcast (100% cloud cover).
- **Human** visual approximation / **Fish** research-informed *illustrative palette*.
- Cast; readable water-entry SPLASH! ripple; cinematic tracking zoom; **16.8-second** continuous descent from 0 to 30 ft; hold; **15.2-second** diagonal retrieve (both 4× slower than v1).
- Dynamic water-specific educational tags at SPLASH!, 1 ft, 5 ft, 10 ft, 20 ft and 30 ft, with research link; milestone captions remain readable and repeat on ascent.
- Pause/resume, replay, and drag depth scrubber.
- Field notes react to conditions, linking directly to research.
- Responsive layout; full document scroll rather than internal controls scrollbars; reduced-motion behavior.
- **216** scenario combinations (12 colors × 3 clarity presets × 3 weather presets × 2 views), with continuous depth interpolation.

## 12 color references — owner descriptions and photos, November 2026

All 12 are **visual approximations from the owner's photographs and descriptions**, not laboratory reflectance or fluorescence measurements. A single simplified bait silhouette stays in use; bait profile, fall behavior, rigging and retrieve speed are *not* additional controls. Material rendering is deliberately broad-strokes: two-tone fill, a little transparency, sparse flecks and optional pearl sheen. The tail is always fill-only with no illuminated outline.

| Color | Photo / reference | Simplified representation |
| --- | --- | --- |
| Monkey Milk | `chubby_monkey.jpg` | Nearly translucent vaguely milky white, blue sheen, **5:1 black-to-red glitter** |
| OG | `chubby_og.jpg` | Fluorescent lime upper over Monkey Milk lower, inheriting the translucent base and flecks |
| Twilight | `chubby_twilight.jpg` | Junebug purple upper / fluorescent pink lower |
| Lemon Pepper | `chubby_lemon.jpg` | Opaque **highlighter-yellow chartreuse** with small black flake (yellow-led rather than lime-green) |
| Stingray | `chubby_stingray.jpg` | Custom blue-black and blue/silver; matched by eye to supplied photograph |
| Tuxedo | `chubby_tux.jpg` | Black with light silver flake over bright silver |
| Whitetreuse | `chubby_whitetreuse.jpg` | Bright fluorescent white upper over highlighter-yellow chartreuse lower |
| Electric Blue | `chubby_electricblue.jpg` | Fluorescent blue upper over **Lemon Pepper highlighter-yellow** lower, sharing the same base |
| True Minnow | `chubby_minnow.jpg` | More pronounced olive upper, still light pearl/silver lower |
| Sunrise Orange | `chubby_sunrise.jpg` | Fluorescent orange upper over **highlighter-yellow chartreuse** lower, sparse black flecks |
| Red Belly | [official product reference](https://www.redgrasstackle.com/product/3-chubby-minnow-red-belly) | **True Minnow's exact upper and tail** with vivid red lower |
| ToadFrog | `chubby_toad.jpg` | Dark charcoal upper over brighter yellow-dominant fluorescent chartreuse with sparse dark specks |

A shared `HIGHLIGHTER_CHARTREUSE` RGB reference now drives the Lemon Pepper body and the yellow lower halves of Sunrise Orange, Whitetreuse and ToadFrog. Electric Blue inherits Lemon Pepper's lower half. This reflects the owner's description of **chartreuse as fluorescent highlighter yellow**, rather than imposing an unrelated lime-green definition. OG remains its separate fluorescent lime. The True Minnow upper RGB is shifted toward olive, with Red Belly inheriting it automatically.

Color swatches depict both halves. Fluorescent names are product descriptions, not claims of physically modeled fluorescence. Images are owner references and are not required for the deployed static application; **no private photo assets, external scripts or dependencies were added**. RGB palettes can be adjusted later without touching animation logic. The model's water clarity, weather, Human/Fish transforms and educational limitations remain unchanged.

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
