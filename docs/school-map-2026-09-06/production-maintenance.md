# School finder: production operation and privacy

Checked September 6, 2026 against the school-finder, school-address-search and school-driving-route client modules. This is the current operating guide for the release. Earlier delivery notes describe intermediate preview stages, including the former manual map-opening control and the period before driving estimates were added.

## Provider use and capacity

The [FOSSGIS usage policy](https://fossgis.de/arbeitsgruppen/osm-server/nutzungsbedingungen/) explicitly covers `valhalla1.openstreetmap.de`. It permits commercial use when the service is an incidental, non-substantial part of the offering, and excludes high-traffic sites and bulk requests. Its routing limit is one request per second; scripts must use one connection. Attribution, a map-error link and reachable publisher contact details are required. Availability is not guaranteed and permission can be withdrawn. This supports incidental production use; it is not permission for unlimited commercial routing. Policy checked from the official site's indexed English and German text on September 6, 2026; the direct www host presented a bot challenge.

Our optional per-school route action is designed for that incidental use. The module sends one route request at a time and spaces request starts at least **1.2 seconds** apart. Successful results are cached in page memory for **five minutes**, with at most **32 coordinate-pair entries** in the provider cache. The UI also reuses completed results for the current home comparison. No route is requested automatically on map load, address search, filtering, scrolling or school selection. There is no bulk routing or automatic retry loop.

These controls are per browser page, not a global limit across all visitors. They do not establish a site-wide traffic allowance. Before traffic grows substantially or routing becomes a core product, move to a managed or self-hosted service with suitable capacity and terms. Configure the trusted `SCHOOL_DRIVING_ROUTE_ENDPOINT` source constant in `civilian-site/assets/school-driving-route.js`; never obtain an endpoint from visitor input, a URL parameter or browser storage. Recheck POST/CORS support for `Content-Type: application/json` and `X-Client-Id`, response compatibility, provider attribution and the privacy disclosure. Do not copy API secrets into client code.

The map uses the separate OSM Foundation endpoint `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Retain visible OpenStreetMap attribution, ordinary browser caching and an origin Referer. Request only normal interactive viewport tiles. Do not prefetch regions, bypass caches or add offline downloads. The [OSMF tile policy](https://operations.osmfoundation.org/policies/tiles/) describes this best-effort service and states that it has no SLA. Its operator and terms are distinct from FOSSGIS routing.

## What leaves the browser

| Feature | Trigger and request | Local behavior |
| --- | --- | --- |
| School directory and ZIP filters | Same-origin JSON and locally vendored Leaflet libraries load with the finder. ZIP lookup does not contact a geocoder. | Filters and Haversine straight-line distance use the downloaded directory and Census ZIP reference points. |
| Background map | Automatically initialized map requests standard OSM tiles for the viewed area. | The tile provider sees requested map areas and normal connection metadata. Tile requests do not include the typed address text. |
| Home address | Explicit form submission sends the typed address over HTTPS to `geocoding.geo.census.gov/geocoder/geographies/onelineaddress` using JSONP. | Random callback, fixed endpoint, no-referrer script policy, 18-second timeout, cancellation and cleanup. Validated FL/AL results must belong to Escambia, Santa Rosa, Okaloosa or Baldwin County. Multiple results require selection. |
| Calculate drive | Explicit button sends an HTTPS JSON POST to `https://valhalla1.openstreetmap.de/route` containing origin/campus coordinates and routing options. | `credentials: omit`, `redirect: error`, `cache: no-store`, `referrerPolicy: strict-origin`, `X-Client-Id: greggcostin.com`; no address text, contact details or analytics payload. Timeout is at most 18 seconds. |
| Driving directions | Explicit button opens Google Maps with school name/address and, if present, the origin coordinates. | The directions URL is constructed on click. It is not a persistent page anchor containing the visitor's origin. |

Providers receive the requests and ordinary network metadata, which may be logged under their policies. Page-local storage is not a promise that third-party services never log requests. See the [Census online privacy policy](https://www.census.gov/about/policies/privacy/privacy-policy.html), [OSMF privacy policy](https://osmfoundation.org/wiki/Privacy_Policy), [FOSSGIS privacy policy](https://www.fossgis.de/datenschutzerkl%C3%A4rung) and [Google privacy policy](https://policies.google.com/privacy).

The finder does not write the home address to localStorage/sessionStorage, page history, inquiry payloads or analytics events. Address inputs, match/status content, the home popup and route result panels carry Clarity masking attributes. Editing/clearing the address, selecting a ZIP comparison or replacing the origin clears the old marker and route state and cancels pending requests. Reloading starts with no saved home comparison. Keep these behaviors when changing UI or tracking integrations. JSONP executes code from the fixed Census HTTPS endpoint; schema validation and callback cleanup do not remove the need to trust that official provider.

The release privacy page adds a school-map subsection while retaining the pre-existing Meta preference controls, production host guards, analytics scripts and other privacy content.

## Honest distance and failure behavior

The radius filter and nearest sort remain based on straight-line distance, even after a road route is calculated. Route miles, duration and displayed geometry come from the same provider response. The request asks for distance-based auto routing with `shortest: true` and `disable_hierarchy_pruning: true`. The service may adjust those options; the UI preserves warnings and describes an estimate, not a guaranteed shortest route. The [Valhalla route reference](https://valhalla.github.io/valhalla/api/route/api-reference/) explains those options and limitations.

There is no live-traffic request or arrival-time input. Do not advertise the returned duration as a live commute prediction. Returned toll/ferry/restriction flags and significant road-snap offsets are shown; absent flags remain unknown. Geocoded points and route endpoints do not guarantee driveway access, a school entrance, bus service or enrollment eligibility. Virtual schools and unconfirmed campus locations cannot receive a calculated route.

When Census or routing is unavailable, retain the local school list and ZIP search, disclose the failure and allow a deliberate retry. When map loading fails, keep the list available. Never manufacture road distance from a straight-line multiplier or silently replace a failed request with an old home's route.

## Release and maintenance checks

Run the deterministic suites from the release checkout; they use controlled fixtures, not bulk public-service calls:

```sh
node scripts/check-school-address-search.mjs
node scripts/check-school-driving-route.mjs
node scripts/check-school-driving-ui.mjs
node scripts/check-school-finder.mjs
node scripts/check-school-finder-private.mjs
node scripts/check-school-report-guides.mjs
node scripts/check-school-insights.mjs
node scripts/audit-civilian.mjs
```

For a manual network smoke check, use a public campus address instead of a customer's home and calculate one selected trip. Confirm the visible figures match the provider response, clearing removes the route, and no coordinates or address text appear in site analytics requests. Check a provider error without repeatedly retrying the public service. Keep local-data dates, sourced campus overrides and private-school status separate from government academic ratings when rebuilding reports. Never run broad design/legal generators during this scoped school release: preserve the release's existing sitewide scripts, form contract and production guards.
