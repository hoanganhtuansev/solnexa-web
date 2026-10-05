# SOLNEXA BESS Site Weather Checker V1

## Scope

This tool is a site-condition checker for BESS / solar projects. It intentionally does **not** perform structural calculations.

Input:
- Japanese address / place name
- Latitude, longitude

Output:
- Location and municipality
- GSI elevation
- Regulatory vertical snow depth (垂直積雪量) when the local rule has been verified in the SOLNEXA rule dataset
- Nearest JMA AMeDAS current observations
- Nearest snow-observing AMeDAS station when available
- Temperature, precipitation, humidity, wind, pressure, snow depth and 24-hour snowfall
- JMA 7-day forecast
- Deterministic BESS-oriented site notes
- Source links

## Data sources

- 国土地理院 (GSI)
  - reverse geocoding
  - address search
  - elevation
  - municipality code mapping
- 気象庁 (JMA)
  - AMeDAS stations and latest observations
  - weather forecast and area hierarchy
- Local authority / prefectural official pages
  - regulatory vertical snow depth

## Vertical snow policy

V1 never guesses a regulatory snow value.

- Nara Prefecture rules are implemented from the official Nara rule page.
- Prefectures not registered in V1 return `未確認` for 垂直積雪量 while weather data continues to work.
- Areas with special/legacy boundaries that cannot be resolved safely from a modern municipality code are also returned as `未確認`.

This is deliberate: meteorological snow observations and regulatory 垂直積雪量 are different datasets and must not be mixed.

## Reference test case

### Test #001 — Gose, Nara

Input:

```text
34.444658, 135.745248
```

Expected jurisdiction:
- 奈良県
- 御所市

Expected snow branch:
- 御所市
- elevation <= 220 m
- 垂直積雪量 = 30 cm

The exact elevation is fetched live from GSI.

## Architecture

```text
SiteWeatherTool.tsx
       |
       v
/api/site-weather
       |
       +-- GSI reverse geocoder / elevation
       +-- JMA AMeDAS
       +-- JMA forecast
       +-- SOLNEXA verified snow rules
       |
       v
BESS Site Conditions
```

## Open-source references

The implementation was informed by:
- winebarrel/TenkiMap — JMA / AMeDAS data patterns (CC0)
- sysCat64/SoraPalette — TypeScript JMA service architecture (MIT)
- ymzkd/MiniTools-WebApp — React/Vite hazard and GSI design-condition architecture

The SOLNEXA UI and service implementation in this branch are written for the existing SOLNEXA application.

## V1 limitations

- Verified regulatory 垂直積雪量 coverage currently starts with Nara Prefecture.
- Seasonal climate normals / long-term historical maxima are not yet included.
- AMeDAS values are station observations, not measurements at the exact project coordinate. Distance and station name are shown so engineers can judge representativeness.
- Structural load calculation is explicitly out of scope.

## Recommended next increment

1. Add verified vertical-snow rules prefecture by prefecture.
2. Add JMA climate normals / historical statistics for:
   - monthly snowfall
   - maximum snow depth
   - monthly temperature
   - wind statistics
   - seasonal precipitation
3. Add a compact printable/exportable site-condition summary.
