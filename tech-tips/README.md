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
