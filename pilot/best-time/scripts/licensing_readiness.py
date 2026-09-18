#!/usr/bin/env python3
"""Pilot Phase 1B - licensing / attribution / Copernicus readiness / T3 blockers.

Emits (pilot/best-time/reports/):
  nasa-attribution.json
  license-status.json
  copernicus-readiness.json
  t3-blockers.json

All content is sourced from official pages consulted on 2026-09-12 and cited
verbatim. Nothing is inferred from API accessibility or open-website status.
"""
import datetime
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REPORTS = ROOT / "pilot/best-time/reports"
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

# --------------------------------------------------------------------------
# 1. NASA POWER attribution  (official Referencing Guide)
# --------------------------------------------------------------------------
nasa_attribution = {
    "generatedAt": NOW,
    "status": "CONFIRMED",
    "scope": "attribution / citation only - NOT a commercial-use licence",
    "officialSource": {
        "name": "NASA POWER Referencing Guide",
        "url": "https://power.larc.nasa.gov/docs/referencing/",
        "retrievedAt": "2026-09-12",
    },
    "requiredStatements": [
        {
            "id": "power-reference",
            "when": "When POWER data products are used in a publication include both "
                    "POWER's Reference and POWER's Data Reference in any work product "
                    "or publication.",
            "text": "The data was obtained from National Aeronautics and Space "
                    "Administration (NASA) Langley Research Center's Prediction Of "
                    "Worldwide Energy Resources (POWER) project funded through the NASA "
                    "Earth Science Division. When referencing POWER data products please "
                    "include the service name, version number, and date accessed.",
        },
        {
            "id": "power-data-reference",
            "when": "Data reference template (service name, version, date accessed).",
            "text": "The data was obtained from the POWER Project's Hourly 2.x.x version "
                    "on YYYY/MM/DD.",
        },
        {
            "id": "acknowledgment-alt",
            "when": "NASA POWER ArcGIS item metadata (Data Use).",
            "text": "These data were obtained from the NASA Langley Research Center POWER "
                    "Project funded through the NASA Earth Science Directorate Applied "
                    "Science Program.",
            "url": "https://www.arcgis.com/home/item.html?id=cd8b70a2570647e6b82aab57c17928f3",
        },
    ],
    "providerNaming": "NASA POWER (NASA Langley Research Center)",
    "datasetNaming": "NASA Prediction of Worldwide Energy Resources (POWER)",
    "requestsNotRequirements": [
        {
            "id": "publication-notification",
            "text": "The POWER Project kindly requests that users of POWER data products "
                    "send a reference, web link and/or a reprint ... to "
                    "larc-power-project@mail.nasa.gov.",
            "kind": "request",
        },
        {
            "id": "redistribution-notification",
            "text": "To assist the POWER Project in providing the best service to the "
                    "scientific community, the Project requests notification if POWER "
                    "data is transmitted to other researchers.",
            "kind": "request",
        },
    ],
    "note": "'requests notification' is a courtesy request, not a prohibition - but it is "
            "also not a grant of commercial redistribution rights.",
}

# --------------------------------------------------------------------------
# 2. Licence status
# --------------------------------------------------------------------------
license_status = {
    "generatedAt": NOW,
    "principle": "API accessibility and open-website status never imply commercial "
                 "redistribution permission.",
    "nasaPower": {
        "status": "UNVERIFIED / LEGAL REVIEW REQUIRED",
        "formalLicenceInstrumentFound": False,
        "evidenceLocated": [
            {
                "source": "AWS Open Data Registry - NASA POWER",
                "url": "https://registry.opendata.aws/nasa-power/",
                "quote": "There are no restrictions on the use, access, and/or download of "
                         "data from the NASA POWER Project. We request that you cite the "
                         "NASA POWER Project when using the data provided from NASA POWER "
                         "Project.",
                "classification": "self-statement on a registry page - NOT a licence instrument",
            },
            {
                "source": "NASA POWER Referencing Guide",
                "url": "https://power.larc.nasa.gov/docs/referencing/",
                "quote": "The Project requests notification if POWER data is transmitted to "
                         "other researchers.",
                "classification": "attribution / notification guidance - NOT a licence",
            },
        ],
        "commercialUse": "UNVERIFIED",
        "redistributionOfDerivedStaticDataset": "UNVERIFIED",
        "attribution": "CONFIRMED (see nasa-attribution.json)",
        "hardPrerequisiteIfFallbackShips": True,
    },
    "copernicus": {
        "officialName": "Licence to use Copernicus Products (rev. 12)",
        "mustNotBeShortenedTo": "CC BY 4.0",
        "status": "official name confirmed; conditions as previously research-confirmed; "
                  "no new official text retrieved this round",
        "conditions": {
            "commercialUse": "permitted",
            "reproduction": "permitted",
            "distribution": "permitted",
            "modification": "permitted",
            "attribution": "required",
            "modificationNotice": "required where applicable",
            "disclaimer": "required as specified by the licence",
        },
        "attributionStatement": "Generated using Copernicus Climate Change Service "
                                "information (Year)",
        "modifiedNoticeStatement": "Contains modified Copernicus ... (Year)",
    },
    "databaseRights": {
        "status": "UNRESOLVED / LEGAL REVIEW REQUIRED",
        "note": "EU sui generis database rights; no legal basis located in the repository. "
                "Retain full transformation scripts and retrieval records.",
    },
}

# --------------------------------------------------------------------------
# 3. Copernicus readiness
# --------------------------------------------------------------------------
copernicus_readiness = {
    "generatedAt": NOW,
    "credentialStatus": {
        "cdsapiInstalled": False,
        "cdsapircPresent": False,
        "envVarsPresent": False,
        "result": "ERA5_PRIMARY_TEST = BLOCKED_BY_MISSING_CDS_CREDENTIALS",
    },
    "datasetIdsVerified": {
        "reanalysis-era5-single-levels-monthly-means": "verified 2026-09-12",
        "derived-era5-single-levels-daily-statistics": "verified 2026-09-12",
        "reanalysis-era5-land-monthly-means": "verified 2026-09-12",
        "derived-era5-land-daily-statistics": "verified 2026-09-12",
    },
    "canonicalFieldMatrix": [
        {"field": "tempMeanC", "dataset": "reanalysis-era5-single-levels-monthly-means",
         "variable": "2m_temperature", "temporalLevel": "monthly", "unit": "K",
         "aggregation": "1991-2020 mean of calendar-month mean", "utcSemantics": "not-applicable"},
        {"field": "precipMm", "dataset": "reanalysis-era5-single-levels-monthly-means",
         "variable": "total_precipitation", "temporalLevel": "monthly",
         "unit": "m of water equivalent PER DAY",
         "aggregation": "tp[m/day]*1000*N_days -> monthly total; 1991-2020 mean",
         "utcSemantics": "not-applicable"},
        {"field": "tempHighC", "dataset": "derived-era5-single-levels-daily-statistics",
         "variable": "2m_temperature", "daily_statistic": "daily_maximum",
         "temporalLevel": "daily", "unit": "K",
         "aggregation": "per-year calendar-month mean of daily max; 1991-2020 mean",
         "utcSemantics": "time_zone = utc+00:00"},
        {"field": "tempLowC", "dataset": "derived-era5-single-levels-daily-statistics",
         "variable": "2m_temperature", "daily_statistic": "daily_minimum",
         "temporalLevel": "daily", "unit": "K",
         "aggregation": "per-year calendar-month mean of daily min; 1991-2020 mean",
         "utcSemantics": "time_zone = utc+00:00"},
        {"field": "precipDaysGe1mm", "dataset": "derived-era5-single-levels-daily-statistics",
         "variable": "total_precipitation", "daily_statistic": "daily_sum",
         "temporalLevel": "daily", "unit": "m", "status": "UNRESOLVED - derived, not authorised"},
        {"field": "sunshineHours", "dataset": None, "variable": None,
         "status": "UNRESOLVED - no sunshine-duration parameter in the ERA5 family"},
        {"field": "daylightHours", "dataset": None, "variable": None,
         "status": "UNRESOLVED - astronomical; no vetted implementation"},
    ],
    "timezone": {
        "requestKey": "time_zone",
        "value": "utc+00:00",
        "officialSemantics": "option to shift to any local time zone in UTC; no shift means "
                             "the statistic is computed from UTC+00:00",
        "separation": "ERA5 daily time-zone boundary != destination display timezone",
    },
    "dailyStatisticsOptions": {
        "era5": ["daily_mean", "daily_maximum", "daily_minimum", "daily_sum (accumulated only)"],
        "era5land": ["daily_mean", "daily_maximum", "daily_minimum"],
    },
    "era5LandFieldMatrix": {
        "tempMeanC": "AVAILABLE (reanalysis-era5-land-monthly-means / 2m_temperature)",
        "tempHighC": "AVAILABLE (derived-era5-land-daily-statistics / daily_maximum)",
        "tempLowC": "AVAILABLE (derived-era5-land-daily-statistics / daily_minimum)",
        "precipMm": "AVAILABLE with caveat (reanalysis-era5-land-monthly-means / "
                    "total_precipitation; per-day rate -> x N days)",
        "precipDaysGe1mm": "NOT AVAILABLE - ERA5-Land daily statistics OMIT accumulated "
                           "variables (total precipitation absent at daily level)",
        "sunshineHours": "NOT AVAILABLE - no sunshine-duration parameter",
        "daylightHours": "NOT AVAILABLE - astronomical",
        "conclusion": "ERA5-Land CANNOT fully replace ERA5: no daily precipitation, so "
                      "precipDaysGe1mm can never originate from ERA5-Land.",
    },
    "precipitationUnitDefect": {
        "found": True,
        "description": "monthly averaged total_precipitation unit is 'm of water per day'; "
                       "previous template omitted the x N days factor (~30x under-estimate)",
        "fixedIn": "pilot/best-time/scripts/copernicus_request_template.py",
        "strategySectionsCorrected": ["S3.3", "S7.2 row B", "S19.2", "S23.0.1", "S23.2 B19"],
    },
    "requestBuilders": ["build_monthly_means_request", "build_daily_statistics_request",
                        "build_era5land_request"],
    "templateExecutable": False,
}

# --------------------------------------------------------------------------
# 4. T3 blockers by category
# --------------------------------------------------------------------------
t3_blockers = {
    "generatedAt": NOW,
    "t2": {
        "result": "BLOCKED",
        "reason": "Copernicus ERA5 PRIMARY is strategy-mandatory and has not been exercised; "
                  "NASA fallback 145/145 alone cannot satisfy T2.",
    },
    "t3": {
        "result": "BLOCKED",
        "reason": "T2 not passed; anchor elevation unapproved; NASA licence unresolved; "
                  "database rights unresolved.",
    },
    "categories": {
        "TECHNICAL": [
            {"id": "T-1", "blocker": "CDS credentials unavailable (no cdsapi, no ~/.cdsapirc, "
                                     "no CDSAPI_URL/KEY)",
             "closesWith": "obtain CDS account + API key, install cdsapi, accept dataset "
                           "licences, run the three request builders"},
            {"id": "T-2", "blocker": "ERA5 / ERA5-Land grid elevation unavailable (0/145 from CDS)",
             "closesWith": "CDS retrieval; then run elev_trigger_analysis.py"},
        ],
        "DATA": [
            {"id": "D-1", "blocker": "anchor elevation candidate coverage 145/145 but exact "
                                     "coverage 135/145; 10 records in review queue",
             "closesWith": "manual/final source approval per record; resolve 8 ICAO-code "
                           "conflicts and 2 anchor-coordinate conflicts"},
            {"id": "D-2", "blocker": "precipDaysGe1mm source UNRESOLVED (no official parameter "
                                     "in either family)",
             "closesWith": "methodology decision: authorise a deterministic derived field with "
                           "documented threshold, or keep null permanently"},
            {"id": "D-3", "blocker": "sunshineHours source UNRESOLVED (no ERA5/NASA sunshine "
                                     "duration; Open-Meteo is cross-check only)",
             "closesWith": "product decision: drop the field, or clear an Open-Meteo "
                           "commercial subscription"},
        ],
        "LEGAL": [
            {"id": "L-1", "blocker": "NASA POWER commercial / redistribution licence unresolved",
             "closesWith": "obtain formal licence text or written confirmation from NASA POWER; "
                           "or drop the NASA fallback family from production"},
            {"id": "L-2", "blocker": "database rights (EU sui generis) unresolved",
             "closesWith": "lightweight legal confirmation; retain transformation scripts"},
        ],
        "METHODOLOGY": [
            {"id": "M-1", "blocker": "daylightHours monthly aggregation only partially defined",
             "detail": "S6 states '逐日求月均' (mean of daily daylight over the month), which "
                       "defines the monthly statistic, but the leap-year February day-count "
                       "(28 vs 29 days) is not specified, and no vetted implementation is adopted",
             "closesWith": "fix the February day-count rule in the strategy, then adopt a "
                           "reproducible implementation"},
            {"id": "M-2", "blocker": "precipDaysGe1mm derived-field policy undefined",
             "closesWith": "strategy amendment authorising or forbidding derived fields"},
        ],
    },
    "counts": {"TECHNICAL": 2, "DATA": 3, "LEGAL": 2, "METHODOLOGY": 2},
    "total": 9,
}


def main():
    REPORTS.mkdir(parents=True, exist_ok=True)
    for name, obj in (("nasa-attribution.json", nasa_attribution),
                      ("license-status.json", license_status),
                      ("copernicus-readiness.json", copernicus_readiness),
                      ("t3-blockers.json", t3_blockers)):
        (REPORTS / name).write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding="utf-8")
        print("wrote", name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
