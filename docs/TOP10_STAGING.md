# Redgrass Tackle Banner 2 — Top 10 staging (2026-10-11)
Status: DEVELOPMENT BRANCH ONLY. Wix Classic Editor site and GitHub Pages main branch untouched.

## Goal
Customer sees exactly ten bait profiles/colors in existing Wix Pro Gallery #top10Gallery.
Each frame links to the correct RETAIL Big Cartel listing. Updating a lineup is a change
to assets/data/top10.json, not to Wix Velo code. Every proposed update must validate.

## Integration source of truth
- Wix page currently hardcodes ten IDs and loads assets/data/baits.json with wix-fetch.
- Current Wix code also controls lake cards and mobile swipes. Do not overwrite them.
- This branch contains wix/top10-loader.js, a STAGED standalone ES module meant to
  inform a future one-time controlled Wix integration. It has NOT been installed in Wix.
- GitHub Pages serves only committed main-branch assets; none of these branch-only
  files affect the deployed Build-A-Box or gallery.
- Big Cartel stays the store. Links in baits.json still target www.redgrasstackle.com;
  migrate/verify against store domain BEFORE moving the www domain to Wix.

## Weekly process after final integration
1. Owner requests exactly ten unambiguous bait profile+color combinations.
2. Assistant matches those against existing option IDs in assets/data/baits.json.
3. Assistant verifies unique IDs, all ten images, and product URL mappings.
4. Assistant edits only assets/data/top10.json on a review branch.
5. Automated validator/tests must pass; a human review/approval remains required
   for promotions. After approval, merge the configuration to main.
6. Wix fetches latest remote config and reuses the already installed renderer.
7. Verify rendered ten frames on desktop and mobile and click-test target links.

## Safety model
- Schema requires exactly ten unique IDs.
- Validation rejects missing catalog IDs, invalid/missing image filenames, and invalid
  target URL formats.
- Remote loader rejects malformed updates and always produces ten frames: preferred
  latest validated feed -> caller-provided last-known-good -> baked baseline lineup.
- An image confirmed 404/410 by optional HTTP HEAD preflight maps to the existing
  assets/images/logo-redgrass.png. Network/CORS unknown state retains the original
  image to avoid overreacting to temporary network errors.
- Native Wix Pro Gallery has no per-image onerror in this source. The image fallback
  requires HEAD preflight to be enabled in the future Wix hookup, and cannot guarantee
  detection of all CDN failures. If HEAD blocked, alternative verification is needed.
- Last-known-good persistence is a hook, not yet installed: future Wix integration must
  store only fully validated ten-entry lineups in an appropriate Wix/browser store.
- A baked baseline protects cold-start loads if no previous saved lineup is present.
- Never expose half-pack "filler" products from Build-A-Box in retail carousel merely
  because the option ID is used as a stable catalog identifier; target retail URLs must
  be verified individually.

## Verified asset inventory (2026-10-11)
- 105 catalog records, 105 unique image filenames, all 105 local image files present.
- 95 .jpg and 10 .PNG images; preserve exact letter case.
- 101 distinct retail URLs across 105 products (4 duplicated URL groups).
- Baseline Top 10 = Cookies N Cream and Red Belly for each of 5 profiles;
  all ten option IDs resolve with images and URLs.

## Known catalog concerns — DO NOT silently fix
Duplicated retail URL mappings potentially misdirect clicks:
- Chubby OG -> Chubby Toadfrog URL
- Chubby True Minnow -> Chubby Red Belly URL
- Skinny True Minnow -> Skinny Cookies N Cream URL
- Flicker True Minnow -> Flicker Red Belly URL
These require accurate Big Cartel product-link verification with owner before repair.

## Files in this branch
- assets/data/top10.json: current exactly-ten lineup
- assets/data/top10.schema.json: strict config definition
- wix/top10-loader.js: staged remote loader/renderer data adapter, not installed
- scripts/validate-top10.cjs: filesystem, catalog, image, URL validation
- scripts/test-top10.mjs: mocked feed, invalid config, fallback and image 404 tests
- .github/workflows/validate-top10.yml: run validator/tests for changes
- docs/TOP10_STAGING.md: this document

## Required next steps before ANY launch
1. Confirm GitHub Actions automated tests pass in this branch/PR.
2. Review the four mismatched catalog URLs and the website-to-store domain migration.
3. Agree on preserving gallery settings and spacing for desktop/mobile.
4. Arrange a safe one-time Wix Velo integration with access that can update Classic Editor
   page code; current Wix connector has not exposed that editing capability.
5. Test preview on desktop/mobile, exact ten frames, click destinations, image 404,
   network failure, and independent Lake Card function before authorizing publication.
