Redgrass Build‑a‑Box — Deployment Guide
=====================================

Folder structure
----------------
redgrass-buildabox/
├── index.html
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    ├── data/
    │   └── baits.json      ← generated from your CSV (already included)
    └── images/
        └── *.jpg           ← place your 100 image files here

How to preview locally
----------------------
1) Open the folder and double‑click index.html. It should render in your browser.
2) If some images don’t show yet, ensure the filenames in baits.json match the files in assets/images/.

How to deploy to Netlify
------------------------
1) Zip the redgrass-buildabox/ folder OR drag the folder to https://app.netlify.com/drop
2) Netlify will give you a live URL, e.g., https://redgrass-buildabox.netlify.app
3) Rename the site under Site Settings if desired.

How to embed in Big Cartel
--------------------------
Edit your Build‑a‑Box product page and add this:
<iframe src="https://YOUR-SITE.netlify.app" width="100%" height="1200" style="border:none;"></iframe>

Add‑to‑Cart notes
-----------------
Open assets/js/main.js and set:
const BIG_CARTEL_PRODUCT_URL = "https://YOURSTORE.bigcartel.com/product/build-a-box";

If left blank, the app will copy the 9 slot selections to the clipboard and show them to the customer with instructions to paste into order notes.

Filters & badges
----------------
• The gallery shows “Fan Favorites” for tier=core and “Seasonal Colors” for tier=seasonal.
• Only status=standard items are shown (Phase 1).

Troubleshooting
---------------
• Blank images? Ensure image filenames in assets/images/ exactly match baits.json.
• No items showing? Confirm assets/data/baits.json is present and valid JSON.
• Want to change colors/titles? Edit the text in index.html and style.css.
