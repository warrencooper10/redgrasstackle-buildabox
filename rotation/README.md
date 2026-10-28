# THE ROTATION — Banner 2

Isolated Wix Classic Editor HTML component, using original Redgrass photography and a separate empty showroom environment. No checkout, lake-card, account, header, footer or other banner dependency.

## Owner lineup changes through ChatGPT or Cletus

Describe the ten desired profile/color combinations and their order. The assistant resolves those to unique option IDs in `assets/data/baits.json`, verifies each real Big Cartel listing and matching original GitHub image, then edits only `rotation/lineup.json` on the approved configuration branch. No carousel code or redesign is needed. A derivative for every one of the 105 existing catalog items is already available in `rotation/assets/{id}.webp`.

Each configuration entry records the unique ID, exact catalog profile/color, original image path, optimized image path, native Big Cartel URL, verification title and timestamp. Run:

```
node rotation/tests/model.mjs
python3 rotation/verify-links.py
```

Reject an incomplete or ambiguous request. Never guess a product mapping. Review/approve the configuration before promotion. Do not change the shared merchandise catalog to make an invalid lineup pass. Newly added merchandise outside the current 105 records requires a separately verified catalog/asset addition.

## Recovery and accessibility

A validated saved lineup renders immediately; a bundled ten-product lineup protects a first visit. Remote data is accepted atomically only after all fields and all ten optimized images pass. Feed failures, malformed configs and missing new photos retain the last known good lineup. Storage failures retain bundled recovery. Failed already-displayed photographs retain descriptive text and the correct shopping link.

Mouse drag and horizontal touch/pointer swipe rotate the elliptical 3D installation. Vertical touch scrolling remains available. Arrows, ten named selectors, Left/Right and Home/End provide keyboard access. The front card is a real Big Cartel link. Neighbor cards first rotate forward. There is no automatic rotation. `prefers-reduced-motion` disables transitions. Simple view and unsupported-3D fallback preserve shopping. A static ten-link list is visible until JavaScript initializes and also works with JavaScript disabled.

## Build and integration

`python3 rotation/build.py` creates `index.html` (self-contained component code), `bundle.js` and `embed.html`. The Wix embed uses a commit-pinned CSS/JS bundle; its lineup loads through the public GitHub Contents API from the approved review branch, and its optimized photos load as static branch assets. The API avoids stale raw-file edge caches; network or rate-limit responses retain the validated saved/bundled lineup. Pin embed CSS/JS to the reviewed source commit. A configuration update does not require changing the pinned renderer or Wix code.

The production decision remains separate: owner approval is required before publishing the Wix site. The review branch does not replace the Build-a-Box GitHub Pages site.

Environment generation used the built-in ImageGen tool with the supplied approved reference: empty deep-charcoal showroom, giant industrial halo, low bronze multi-tier dais, illuminated amber concentric rings, warm horizontal wall light, polished reflective foreground; no text, product images or interface. Original generated image preserved separately; optimized `assets/showroom.webp` is 193 KB. Product derivatives retain complete original photographs with `object-fit: contain`.
