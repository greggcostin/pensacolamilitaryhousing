# School map scrolling correction

Published to https://greggcostin.com/schools on September 10, 2026 (America/Chicago).

The coastal theme's `overflow:hidden` on `.sf-map-column` made that non-scrolling column the sticky element's scroll container. Changed it to `overflow:clip` so the rounded frame remains while the map follows the page. The desktop panel now clears the header, fits within the available viewport, and keeps longer notes reachable. Mobile retains its normal stacked map and school-list layout. Automatic map loading is unchanged.

Only two deployed assets changed: the shared theme CSS and the school hub's CSS cache key. All other assets, school content, data, JSON-LD, metadata, tracking scripts and forms were preserved against the complete production manifest.

- Production deployment: `c478c2c1-1bc0-4c26-804e-e57ae675f2f1`.
- Prior deployment retained for rollback: `2c692b4b-9b38-44cc-906f-5fde440975e3`.
- All 1,829 published asset hashes match the tested candidate.
- Production candidate audit: 320 pages, zero findings. Editable source checkout audit: 321 pages, zero findings.
- Browser sizes checked: 1280x720, 1440x1000, 820x720 and 390x844.
- Confirmed downward/upward sticky movement, bottom containment, accessible map notes, school filtering, school popup and filter reset.
- Live browser verification: at page scroll positions 1761.333 and 2161.333, the map stayed at top 184 and bottom 984 in a 1440x1000 viewport. Header bottom was 169.667. Map loaded automatically; column overflow was `clip`.

Source of the fix: `scripts/civilian-coastal-theme.css`, installed through the existing civilian theme generator. No military deployment was performed for this civilian theme correction.
