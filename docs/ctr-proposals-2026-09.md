# Title and description proposals from the first GSC Pages export (Sep 4 2026)

Source: `docs/seo-baselines/gsc-pages-2026-09-04.csv`, scanned by `node scripts/ctr-opportunities.mjs`
(output in `content/measure/ctr-pmh.json`). Google is where the impressions are: the site earns
roughly 20,000 impressions a month and converts about 0.7% of them. Twenty pages already on
page one leave about 270 clicks a month on the table against the public CTR-by-position curve,
and one page accounts for two thirds of that.

The evidence for what fixes it is on the same export: `/assumable-va-loans-pensacola` converts
25.9% of its impressions at position 4.4. Its title is "Assumable VA Loans Pensacola | 2.75% Rates
Still Available". A specific number in the title is the pattern; every underclicked page below
has a generic one.

Rules for every proposal: primary query first, one concrete figure the page really states,
title 60 characters or under, description 120-160, no em dashes, nothing the page does not
already say. Gregg picks; the engine reads the next GSC export and records the delta as a lesson.

## 1. /bah-rates: 48 clicks from 9,117 impressions at position 8.5 (0.5%). About 182 clicks a month at stake.

Now: **BAH Calculator & 2026 Rates: Pensacola & Fort Walton Beach**
Queries it shows for (Bing striking-distance list): bah pensacola, nas pensacola bah, hurlburt field bah, bah pensacola 2026, usaf bah fort walton beach fl.

- A: **2026 BAH Pensacola: $1,794-$2,631 by Rank, Plus Calculator** (58)
- B: **NAS Pensacola and Hurlburt BAH 2026: E-5 $1,863, Every Rank** (59)
- C: **BAH Pensacola 2026: Rates by Rank, Up 0.5%, What It Buys** (54)

Description: **2026 BAH for NAS Pensacola, Corry and Whiting (FL064) and Eglin and Hurlburt (FL023), every rank with and without dependents, up 0.5% this year, and a calculator that turns it into a VA price ceiling.** (196, trim to taste) or the shorter **Every 2026 BAH rate for Pensacola (FL064) and Fort Walton Beach (FL023) by rank, with and without dependents, plus the calculator that turns BAH into a real VA budget.** (158)

## 2. /bases/corry-station: 9 clicks from 1,320 impressions at 9.8 (0.7%). About 24 a month.

Now: **Corry Station Housing & 2026 BAH | Off-Base Guide**
Queries: nas corry station bah, corry station tech school dorm, corry station two bedrooms.

- A: **Corry Station BAH 2026: E-5 $1,863, Dorms vs Off-Base** (52)
- B: **Corry Station 2026 BAH and Housing: Where Sailors Actually Live** (60)

## 3. Community pages at 0.2-0.3%: /communities/fort-walton-beach (638 imp), /navarre (322), /crestview (320), /niceville (316). About 36 a month combined.

The pattern, not four rewrites: each title carries the median price or the commute the page states. Example for Fort Walton Beach, now "Fort Walton Beach FL Homes | ..." style:

- **Fort Walton Beach Homes 2026: $341K Median, 10 Min to Hurlburt** (60, figure from the ZIP study and the page's own commute line; confirm both on the page before use)

## 4. /blog/living-in-gulf-breeze-pros-cons: 0 clicks from 53 impressions at position 4.4.

Position four with zero clicks is a snippet problem, not a ranking problem. Now: **Living in Gulf Breeze FL: Pros, Cons, and the Real Numbers**. The title is fine; the description should lead with the number a searcher wants:

- **Gulf Breeze in 2026: $686K typical value in 32561, A-rated schools, the bridge commute to NAS Pensacola, and what flood insurance really costs. Honest pros and cons.** (150)

## 5. /pensacola-flood-zones-homebuyers: 11 clicks from 479 impressions at 8.0 (2.3%). Already the best-converting hub; leave it, and copy what it does.

## What the engine does with this
`scripts/ctr-opportunities.mjs` runs in MEASURE. Any page with 5+ lost clicks a month is a
CTR-PROBLEM at priority 80 in DECIDE, level with the Bing-based flag in `blog-retro.mjs`, and
outranks a new post. For blog posts the fix is a title/description edit in the fragment (no
dateModified bump); for hub pages it is a proposal here for Gregg. The next GSC export closes
the loop: the delta per page becomes a lesson in `learnings.json`.
