# Redgrass Tech Tips — phase 1
Status: functional hosted prototype; **not yet installed in Wix page layout**.
Live GitHub Pages URLs once merged and built:
- Searchable subpage: https://warrencooper10.github.io/redgrasstackle-buildabox/tech-tips/
- Full-click homepage banner: https://warrencooper10.github.io/redgrasstackle-buildabox/tech-tips/banner.html

## Implemented
- Responsive dark, outdoors-inspired video library in the vein of supplied In The Spread screenshot (original CSS and layout).
- Search by planned tutorial title/category, categories Fishing, Rigging, Electronics, Boat Maintenance, Trailer Repairs.
- Clearly labelled placeholders; no nonexistent tutorial link pretends to play.
- Full-banner click-through to working searchable page.
- Hunter-green tint over a future 5–7 second seamless boat-running clip; dark green fallback if video unavailable.
- Accessible category controls and reduced-motion rule.

## Still required for actual Wix installation
Wix Classic Editor stores visual element geometry outside GitHub Velo page code. Existing Wix page **Tips & Media** has code file `src/pages/Tips & Media.w93qy.js` but no Tech Tips UI elements exposed through the GitHub source.
1. Open the existing Tips & Media page in Wix Local Editor; rename the visible page to **Tech Tips** if desired.
2. Add an Embed Website / HTML iframe element filling the desired content width and height; point it at the searchable Tech Tips URL above. Ensure a sufficiently tall desktop embed (e.g. 1200px) and later optimize mobile separately.
3. Add a banner HTML/embed section on the home page and point it to banner.html above. The whole frame is linked, and the banner's anchor goes to its hosted Tech Tips page. If Wix-native same-window navigation is required, replace that anchor with the *confirmed Wix page URL* after establishing its slug.
4. Obtain/approve an original 5–7 sec boat-running loop with documented commercial-use rights. Put MP4 into `tech-tips/media/boat-loop.mp4` (repository size permitting); the existing banner then begins playing it automatically.
5. Test in Wix Test Site before publishing. Public Wix Publish remains separately controlled.

## Phase 2 (deferred by owner)
YouTube channel/playlist binding, genuine thumbnails/titles/links, featured video, embedded player, video comments and Q&A. No fake videos are shown during Phase 1.

## Guardrails
This branch does not change Wix design, current homepage code, Build-A-Box logic, Big Cartel, original product assets or the existing carousel.

## Banner 5 — October 14 final spec
- **Homepage location:** existing Wix Classic Editor HOME `#section10`, under heading "Tech Tips". **NOT placed by GitHub**; Classic Editor section placement requires the Wix graphical editor.
- **Embed/preview component:** `https://warrencooper10.github.io/redgrasstackle-buildabox/tech-tips/banner.html`.
- **Full-frame transparent click area:** the entire banner is a real anchor `target="_top"` linking to `https://www.redgrasstackle.com/tech-tips`. No additional visible button is required; CTA text is decorative.
- **Loop:** native MP4/WebM `autoplay muted loop playsinline` for 5–7 second seamless footage. Deep hunter-green overlay stays on top; fallback background is visible while media is unavailable.
- **Replaceable footage without modifying code:** optional `?video=ENCODED_HTTPS_MP4_URL` query on banner embed URL; otherwise use `tech-tips/media/boat-loop.mp4`. File must be accessible via HTTPS and be MP4/WebM. A Wix-hosted media URL must be tested in embedded context before assuming compatibility.
- **Critical routing dependency:** the live `www.redgrasstackle.com` currently belongs to Big Cartel, not this Wix Draft site. The exact target URL does **not** resolve to the desired new Wix Tech Tips page yet. Build a Wix page with slug `tech-tips`, test its current Wix preview/draft URL, and only then point active banner navigation to the correct available Wix route. Do not migrate domain or publish without explicit approval.
- **Next stage:** add visual frame in `#section10` with Wix Editor (no API for placing Classic Editor elements accessible through these connectors). Build the Wix Tech Tips destination afterward as owner directed. Preserve original carousel/lake section functionality.
