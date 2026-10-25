# Redgrass community additions — unpublished draft

Status: installed in the existing My Site 4 Wix Classic draft; not published. Updated to three independent full-width homepage banner sections per owner instruction. Work performed remotely in ChatGPT Work Cloud. Last review: 2026-10-25.

Site ID: d97a42b5-a881-4850-afe4-9b7882465c06  
Document ID: 2fad3620-a341-4eaa-955b-3582821fce8e  
Development branch: draft/four-community-sections-2026-10-24

## Eight deliverables

| Deliverable | Installed behavior | Source / native control |
| --- | --- | --- |
| Catch Board homepage banner | CAUGHT ON REDGRASS; Submit Your Catch and View the Catch Board links | catch-board-banner.html, native home html2 |
| Catch Board subpage | Native hero, approved-only gallery framework, photo dialog, private submission form | catch.html, page wwfv5, /the-catch-board |
| Tournament Proven homepage banner | PROVEN ON THE WATER; See What They Used and View Tournament Results links | tournament-proven-banner.html, native home html4 |
| Tournament Proven subpage | Native hero, verified result and exact bait-link framework, honest empty state | tournament.html, page fpfou, /tournament-wins |
| Last Tacklebox homepage banner | WHERE BAITS GO BEFORE THEY’RE GONE FOREVER.; Open the Last Tacklebox link | last-tacklebox-banner.html, native home html3 |
| Last Tacklebox subpage | Native hero, owner-curated closeout framework, empty and sold-out logic | closeouts.html, page vzl25, /the-last-tacklebox |
| Redgrass Crew homepage banner | JOIN THE REDGRASS CREW; exact requested support; native Email, Subscribe and unchecked consent | Native home Section1Regular, text2, form1 |
| Redgrass Crew subpage | Same native newsletter form and consent; success/error behavior | Native page j1ezd, /redgrass-crew, form1 |

Homepage order is preserved shopping/lake cards/carousel/Tech Tips, followed by Catch Board, Tournament Proven, Last Tacklebox and Crew. The three banners now use independent native Wix sections and independent HTML embeds: UGC (section1/html2) contains only Catch Board; Tournament Headquarters (section13/html4) contains only Tournament Proven; The Last Tacklebox (section11/html3) contains only Last Tacklebox. Each embed uses Wix full-width stretch with zero side margins. Each entire banner links to its matching existing subpage, while the specific buttons and submission/results anchors are preserved. Crew remains its separate native newsletter section. The combined homepage-banners.html is retained only as a legacy pre-split snapshot and is no longer installed.

## Preview and editing

- [Draft home](https://warrencooper10.wixsite.com/my-site-4/home?rc=test-site)
- [Catch submission and gallery](https://warrencooper10.wixsite.com/my-site-4/the-catch-board?rc=test-site#submityourcatch)
- [Tournament results](https://warrencooper10.wixsite.com/my-site-4/tournament-wins?rc=test-site#submityourcatch)
- [Last Tacklebox](https://warrencooper10.wixsite.com/my-site-4/the-last-tacklebox?rc=test-site)
- [Crew](https://warrencooper10.wixsite.com/my-site-4/redgrass-crew?rc=test-site)
- [Existing Wix editor](https://warrencooper10-my-site-4.editor.wix.com/html/editor/web/renderer/edit/2fad3620-a341-4eaa-955b-3582821fce8e?metaSiteId=d97a42b5-a881-4850-afe4-9b7882465c06)

These are draft test-site links, not a production release. All new pages have page-specific SEO titles/descriptions and the required slugs. Existing indexing settings were preserved.

## Native forms

Official Wix Forms is installed; no paid upgrade was purchased.

Newsletter form ID: 471883f8-3388-463c-8958-5c52c8cfb845. It is shared by home and Crew. Email is required and mapped to contacts email. Consent is CONTACTS_SUBSCRIBE with EMAIL subscription mapping, unchecked by default, required with boolean validation enum [true]. Consent text explicitly permits email updates and states unsubscribe availability. Privacy text points to the unsubscribe link in marketing emails. Success: "You're on the crew list. Thanks for joining Redgrass!"

Private Catch form ID: 855dab1c-f9b1-4ef4-9ea0-7bb2d578046e. Required name, email, single image upload, and true-only unchecked display permission. Optional lake, bait, description and date. Success confirms private review; no automatic gallery publication and no newsletter subscription mapping. Both forms use ADVANCED spam protection and OWNER_AND_COLLABORATORS submission access.

The existing email service was observed as Free200 (200 emails/month). No campaign was sent.

## Editing verified content

The three content modules currently use intentionally empty `const records = [];` arrays. They are source-driven HTML modules, not a connected CMS or an automatic moderation workflow. GitHub changes on this branch do not automatically update the native Wix HTML embeds.

1. Review the private Catch submission in Wix Forms. Verify ownership, permission from people pictured, display permission, image suitability and every published detail.
2. Copy only approved public details into catch.html. Never add submitter email to public records. A displayed catch must have both approved:true and displayPermission:true.
3. Verify tournament facts and the actual bait used before adding a tournament record with verified:true. Confirm its exact Big Cartel product listing.
4. Verify every closeout photo, profile, color, price, discount, stock/availability and exact product link before adding a closeout record with verified:true. Use availability:"Sold out" to suppress the shopping action.
5. Commit the source to this development branch. Replace the corresponding native Wix HTML embed code, update it, save, and review desktop and mobile preview before any release.
6. Resize the HTML embed and its parent native section as records grow. The native frame heights are fixed, so adding cards without resizing can clip content.

Record fields are documented inside each module:
- Catch: approved, displayPermission, name, photo, photoAlt, lake, bait, description, date.
- Tournament: verified, angler, tournament, date, lake, result, photo, photoAlt, bait, productUrl.
- Closeout: verified, name, profile, color, photo, photoAlt, priceLabel, discountLabel, availability, productUrl.

Product links accept only HTTPS redgrasstackle.com or www.redgrasstackle.com with a /product/ path. Checkout remains on Big Cartel. Rendered record text uses textContent.

The assets/ SVG files are source proposals only. Wix URL import rejected them; installed banners use inline contour artwork instead. No customer or tournament imagery has been fabricated.

## Validation completed

- All four banners and all four subpages installed and inspected in the existing Wix draft/test site.
- Main destination/anchor navigation exercised; all homepage link destinations also inspected.
- Desktop layout reviewed; mobile content frames confirmed at 320px wide. Catch gallery 750px high at Y1150, anchor Y1910, private form Y1950. Tournament and closeout frames each 750px high. Each of the three independent homepage banners and its parent section is 320 by 640 on mobile, with zero internal vertical offset. Desktop banner/parent height is 640, native full-width stretch is enabled, and margins are zero. Native Crew forms fit the mobile page flow.
- The three module scripts compiled successfully with new Function. Empty states rendered.
- Newsletter required email and unchecked-consent behavior tested. An initial test exposed that required alone allowed false; both forms were corrected to enum [true]. Retest without consent was blocked with no new submission. Consent true submitted successfully; subscription readback was SUBSCRIBED.
- Newsletter QA subscription was then set to UNSUBSCRIBED and verified. No marketing campaign was sent.
- Catch empty-form required errors inspected. A cloud-only QA screenshot (not a fish/customer photo) was uploaded through the native form. Success and stored photo/display-permission fields were verified. Submission is private and clearly labeled QA TEST — DO NOT DISPLAY. No marketing subscription was created for its email.
- Native private-form access and spam settings verified through Wix API.
- No Wix checkout or Big Cartel write was performed.

QA evidence IDs:
- Newsletter consented submission: 3468a5ad-5e3d-494a-9e05-4a6ec2cb0a59.
- Newsletter initial unchecked test before correction: 911281cc-be89-45d7-8b89-767cc53597c5.
- Catch private QA submission: 4e1fb779-f4bf-4262-b560-5322801dbdbd.
- Newsletter QA subscription: d6bbe999-a798-44d1-b239-15044555e291, final status UNSUBSCRIBED.

Test records remain clearly labeled in the private submission store. They were not added to any gallery.

## Pending owner content and release checks

- Approved customer photos and permissions; verified tournament results/photos/baits; curated closeouts with current prices, stock and exact product links.
- Populated gallery dialog, result cards and closeout/sold-out states need browser testing after real verified records are supplied. Current browser checks cover the empty states; script compilation is not a populated-state test.
- Recipient email delivery and the actual marketing-email unsubscribe link were not exercised. Subscribe/unsubscribe API states were verified.
- Final content review, desktop/mobile review after content insertion, and explicit production release authorization. Nothing has been published.

## Protected scope and existing observations

Build-a-Box code/options/cart/pages/deployment, root app files, existing navigation/scripts/weather/carousel/Tech Tips, and Tier 1 Grenada/Enid/Sardis lake cards were preserved. No domains/DNS/migration/new site, production main commit, merge/deploy, paid plan, Big Cartel write, or message to existing contacts.

Two existing observations were left untouched under the preservation requirement: Enid and Sardis lake-card buttons point to the Grenada URL, and the original desktop header/navigation can overflow at a 1363px viewport. These are not part of the new community modules.

Source files in this branch are a handoff snapshot of manually installed Wix draft content. The Wix Velo repository origin/main remains read-only and was not changed.
