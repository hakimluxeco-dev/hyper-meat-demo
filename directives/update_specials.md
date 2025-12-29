# Update Weekly Specials

## Goal
Automatically fetch the latest "Specials" images from the Hyper Meat Facebook page and update the website's `specials.json` and image assets.

## Tools
-   **Script**: `execution/fetch_specials.py`
-   **Environment**: GitHub Actions (Cloud) or Local Python environment.

## Inputs
-   Target URL: `https://www.facebook.com/hypermeatklerksdorp/`
-   Output Directory: `public/images/specials/`
-   Data File: `public/data/specials.json`

## Process
1.  **Fetch**: The script requests the Facebook page content.
2.  **Parse**: It identifies posts containing keywords like "Special", "Deal", "Price", or "Promotion".
3.  **Extract**: It extracts the high-quality image URL from these posts.
4.  **Download**: It downloads the top 3 most recent images to `public/images/specials/` renamed as `special1.jpg`, `special2.jpg`, `special3.jpg`.
5.  **Update Data**: It rewrites `public/data/specials.json` with generic titling (e.g. "Weekly Special") to ensure the frontend displays them.

## Troubleshooting
-   **Blocking**: Facebook often blocks automated requests. The script should attempt to use User-Agent rotation or fall back to a "No Updates" state rather than crashing.
-   **Selectors**: If Facebook changes their DOM structure, the CSS selectors in the script will need to be updated.
