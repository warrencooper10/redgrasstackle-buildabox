# Redgrass Tackle Product Image Master — v1
Status: proposed / pilot. Do NOT replace legacy catalog photos until visual review and owner approval.

## Art direction
Retail reference: Bass Pro Shops' familiar outdoors-retail product hierarchy, *not* an imitation of their identity.
Retain a useful two-tone contrast demonstration while improving the product photography:
- **Left:** warm neutral limestone / ivory #ECE9E1
- **Right:** muted deep charcoal #252B2A
- Equal vertical division at center, clean line with no gradient or noisy textures.
- Soft diffused neutral studio lighting, no excessive glow, no props, no typography, no logos.
- One real bait, horizontally oriented and optically centered, with its geometry intact.
- Product silhouette occupies around 78% image width; leave at least 10% side safety margins and 12% top/bottom.
- Full subject in focus, natural soft shadow, preserve translucent plastics, embedded flakes, lamination boundaries, finish, and actual pigment.
- Color must be consistent across all five profiles of the same named color. Do **not** apply a generic paint color to all five without checking originals.
- Geometry must remain accurate: ribbing, body taper, tail shape, proportions, count of appendages. AI outputs are drafts for verification against real products, not ground truth.
- 1:1 **2048 × 2048** master target, RGB sRGB PNG lossless; export 1024 × 1024 web derivative only after QC.
- Clean ecommerce photography aesthetic, understated heritage/outdoors mood without copying another retailer's graphics.

## Pilot workflow
1. Audit five existing Monkey Milk bait photographs. Keep originals as source-of-truth.
2. Create one approved art-direction pilot with verified color and bait geometry.
3. Generate exactly five profile-specific drafts, all using the same approved background, lighting, crop, and color master.
4. Owner verifies every shape and Monkey Milk pigmentation against real product.
5. Reject any altered geometry, fake flakes, incorrect translucency, or mismatched color.
6. Store accepted master + web derivative separately in this new folder. Keep source originals and catalog paths unchanged.
7. Only change storefront/catalog links in a *separately approved* migration when images are fully accepted.

## Safety and naming
- Old source photos under assets/images/ are never overwritten, moved, renamed, or deleted.
- New masters: assets/product-remasters/v1/monkey-milk/<profile-slug>_monkey-milk_master.png
- New web: assets/product-remasters/v1/monkey-milk/<profile-slug>_monkey-milk_web.png
- Optional rejected drafts: assets/product-remasters/v1/monkey-milk/review/ (never used on site).
- Read original filenames and mapped option IDs from manifest.json in each color folder.
- Maintain a source/approval trail for each finished image.
