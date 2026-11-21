# Recycling pictograms

Original category illustrations, not official sorting marks or container colours.
They supplement existing labels and never imply local acceptance. The first
four checked-in SVGs remain the packaging artwork. For the 34 additional icons,
`generate.mjs` contains the vector masters and renders transparent 192×192 PNGs
with the existing Chrome/Playwright QA tools. No renderer is bundled.

```sh
node mobile/app/assets/material-studies/generate.mjs work/recycling-icons.png
```

Scope: the installed HSY guide snapshot, recycling-point material types,
packaging destinations and self-reported overview materials. Reference sources
for the familiar split: [Rinki packaging guide](https://rinkiin.fi/lajittelu-kotona/lajitteluohjeet/)
and [HSY waste guide](https://www.hsy.fi/jatteet-ja-kierratys/jateopas-ja-lajitteluohjeet/)
(checked 2026-11-19). The icons do not add sorting rules to the app.
