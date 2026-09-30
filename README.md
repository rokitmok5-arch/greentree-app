# Green Tree Properties · Marketing Studio

Plan and approve social content, track campaigns across platforms, and see which tactics and content pillars actually work.

## Tabs

- **Dashboard**: headline numbers, what's working, what isn't, and leads by platform.
- **Content Studio**: a weekly social calendar with posting-cadence targets (2–3 Reels and 1–2 feed posts or carousels a week), content-pillar rotation (Listings, Educational, Market authority, Hyperlocal, Client wins, Lifestyle), and a Draft → In review → Approved → Published workflow. Published posts can be logged as campaigns so their results feed the analysis.
- **Campaigns**: add, edit and delete campaigns or posts. Import or export them as CSV.
- **Platforms**: compare Instagram, TikTok, Facebook, LinkedIn, email and other channels, with the best and weakest tactic on each.
- **Tactic Analysis**: a performance index for each tactic and each content pillar, a platform × tactic heatmap, a scorecard, and an optional AI strategy review from Claude.
- **Strategies**: write down a hypothesis and a target KPI, link campaigns to it, and see whether it's on track.

The filter bar applies to every tab: time period, platform, and what to **optimize for** (balanced, engagement, leads or revenue).

## How tactics are scored

Every group (a tactic, a platform, or a platform + tactic pair) is compared with your overall average on engagement rate, CTR, lead rate, cost per lead and ROAS. The weights depend on the "optimize for" goal. The result is a performance index where **100 = your average**:

- **Working**: index 115 or higher
- **Not working**: index 85 or lower
- **Not enough data**: fewer than 5,000 impressions

Rates are calculated from summed totals, not averaged per campaign. Cost per lead and ROAS only count paid campaigns. An engagement count of 0 is treated as "not tracked", which suits channels like search ads.

## Data

Data is saved in your browser's localStorage. Use **Export CSV** for backups or to move data between browsers.

CSV columns: `name, platform, tactic, pillar, objective, startDate, endDate, spend, impressions, reach, engagements, clicks, leads, conversions, revenue, notes`. Common ad-platform export headers are recognized too ("Campaign name", "Amount spent", "Link clicks", "Results", "Purchases conversion value", and others).

## Running locally

```bash
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY for the AI strategy review
npm run dev:all        # API server on :3001 + Vite dev server
```

Only the AI strategy review needs the API server. Everything else runs in the browser, including the GitHub Pages build.
