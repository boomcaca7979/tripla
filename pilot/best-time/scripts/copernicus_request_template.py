#!/usr/bin/env python3
"""Pilot Phase 1B - Copernicus CDS request TEMPLATE (three explicit requests).

STATUS: TEMPLATE ONLY. DO NOT EXECUTE.
  - No credentials, no tokens, no secrets.
  - No network request on import.
  - Execution requires ~/.cdsapirc (or CDSAPI_URL + CDSAPI_KEY), which is
    NOT present in this environment (verified 2026-09-12).

Dataset identifiers, variables and unit semantics below were re-verified
against the CDS catalogue pages and the ECMWF Confluence documentation on
2026-09-12 (see SOURCES), and re-verified a second time on 2026-09-13 against
the official CDS retrieve process schemas:
  https://cds.climate.copernicus.eu/api/retrieve/v1/processes/derived-era5-single-levels-daily-statistics
  https://cds.climate.copernicus.eu/api/retrieve/v1/processes/reanalysis-era5-single-levels-monthly-means

CORRECTIONS APPLIED 2026-09-13 (schema-verified, no canonical data impact):
  F-1: derived-era5-single-levels-daily-statistics has NO data_format input.
       Official inputs: product_type, variable, year, month, day,
       daily_statistic, time_zone, frequency, area. Output is netCDF-in-zip
       (ECMWF daily statistics documentation). build_daily_statistics_request
       no longer sends data_format (it previously did -> request would be
       rejected by the CDS API as an unknown input).
  F-2: year is a SINGLE string (not an array) for
       derived-era5-single-levels-daily-statistics -> 1991-2020 daily
       statistics must be requested one year per request (30 x 3 statistics).
  F-3: time_zone official default is utc+00:00 (schema enum default);
       UTRIPLA still sets it explicitly.

=============================================================================
CRITICAL UNIT SEMANTICS (defect found in Phase 1B; corrected here)
=============================================================================
ERA5 / ERA5-Land **monthly averaged** `total_precipitation` is NOT a monthly
total. ECMWF documentation:

  "The accumulations in monthly means (of daily means, stream=moda/edmo) have
   been scaled to have an 'effective' processing period of one day, so for
   accumulations in these streams: The hydrological parameters have effective
   units of 'm of water per day' ..."

Conversion table (ECMWF, "Conversion table for accumulated variables"):

  tp[mm per month] = tp[m/day] * 1000 * N      (N = days in the month)

The previous template said "m -> mm (x1000)" only, which would have produced
a ~30x under-estimate. This template now encodes the correct conversion and
the per-year, per-month day count.
"""
from __future__ import annotations

# ---------------------------------------------------------------------------
# 0. Credentials / environment prerequisites (BLOCKER)
# ---------------------------------------------------------------------------
PREREQUISITES = {
    "cdsapi_installed": False,          # verified absent 2026-09-12
    "cdsapirc_present": False,          # ~/.cdsapirc not found
    "env_vars_present": False,          # CDSAPI_URL / CDSAPI_KEY not set
    "install": "pip install cdsapi",
    "config": "~/.cdsapirc  ->  url: https://cds.climate.copernicus.eu/api\n"
              "                 key: <UID>:<API key>",
    "licence_acceptance": "Each dataset must be accepted in the CDS user profile "
                          "before a request is queued.",
}

SOURCES = [
    "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels-monthly-means",
    "https://cds.climate.copernicus.eu/datasets/derived-era5-single-levels-daily-statistics",
    "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-monthly-means",
    "https://cds.climate.copernicus.eu/datasets/derived-era5-land-daily-statistics",
    "https://confluence.ecmwf.int/pages/viewpage.action?pageId=185075856  (ERA5 data documentation)",
    "https://confluence.ecmwf.int/x/N1k7E  (Conversion table for accumulated variables)",
    "https://confluence.ecmwf.int/display/CKB/ERA5+family+post-processed+daily+statistics+documentation",
]

# ---------------------------------------------------------------------------
# 1. Datasets (official CDS identifiers, re-verified)
# ---------------------------------------------------------------------------
DATASETS = {
    "era5_monthly_means": "reanalysis-era5-single-levels-monthly-means",
    "era5_daily_statistics": "derived-era5-single-levels-daily-statistics",
    "era5land_monthly_means": "reanalysis-era5-land-monthly-means",
    "era5land_daily_statistics": "derived-era5-land-daily-statistics",
}

RESOLUTION = {
    "era5": "0.25 deg x 0.25 deg (atmosphere, reanalysis)",
    "era5_ensemble": "0.5 deg x 0.5 deg",
    "era5land": "0.1 deg x 0.1 deg (native 9 km)",
}

TIMEZONE_AND_DAY_BOUNDARY = {
    "request_key": "time_zone",
    "value": "utc+00:00",
    "official_semantics": "The option to shift to any local time zone in UTC exists; "
                          "no shift means the statistic is computed from UTC+00:00.",
    "utrip_methodology": "dailyAggregationBoundary = UTC+00:00 (UTRIPLA choice).",
    "separation": "ERA5 daily time-zone boundary != destination display timezone.",
    "note": "Official capability (configurable) != UTRIPLA methodology (fixed UTC+00:00).",
}

FREQUENCY = {"request_key": "frequency", "value": "1_hourly",
             "allowed": ["1_hourly", "3_hourly", "6_hourly"]}

DAILY_STATISTICS = {
    "era5": ["daily_mean", "daily_maximum", "daily_minimum", "daily_sum*"],
    "era5land": ["daily_mean", "daily_maximum", "daily_minimum"],
    "footnote": "* daily_sum is only available for accumulated variables; "
                "ERA5-Land daily statistics OMIT accumulated variables entirely, "
                "so daily_sum / daily precipitation is NOT available for ERA5-Land.",
}

# ---------------------------------------------------------------------------
# 2. ERA5-Land field matrix (Phase 1B deliverable)
# ---------------------------------------------------------------------------
ERA5_LAND_FIELD_MATRIX = {
    "tempMeanC": {
        "dataset": DATASETS["era5land_monthly_means"],
        "variable": "2m_temperature", "available": True,
        "unit": "K", "convert": "K -> degC (-273.15)",
        "aggregation": "1991-2020 average of calendar-month mean",
    },
    "tempHighC": {
        "dataset": DATASETS["era5land_daily_statistics"],
        "variable": "2m_temperature", "daily_statistic": "daily_maximum",
        "available": True, "unit": "K", "convert": "K -> degC",
        "aggregation": "mean of per-year calendar-month mean of daily max, then 1991-2020",
    },
    "tempLowC": {
        "dataset": DATASETS["era5land_daily_statistics"],
        "variable": "2m_temperature", "daily_statistic": "daily_minimum",
        "available": True, "unit": "K", "convert": "K -> degC",
        "aggregation": "mean of per-year calendar-month mean of daily min, then 1991-2020",
    },
    "precipMm": {
        "dataset": DATASETS["era5land_monthly_means"],
        "variable": "total_precipitation", "available": True,
        "unit": "m of water equivalent PER DAY",
        "convert": "tp[m/day] * 1000 * N_days_in_month = mm per month",
        "aggregation": "1991-2020 average of the monthly total",
        "warning": "monthly-mean field is a per-day rate; multiplying by N is mandatory",
    },
    "precipDaysGe1mm": {
        "dataset": None, "variable": None, "available": False,
        "reason": "ERA5-Land daily statistics OMIT accumulated variables "
                  "(total precipitation is not available at daily level) -> "
                  "a >=1 mm day count cannot be produced from ERA5-Land",
    },
    "sunshineHours": {
        "dataset": None, "variable": None, "available": False,
        "reason": "No sunshine-duration parameter exists in the ERA5 family; "
                  "only radiative flux variables (e.g. surface_solar_radiation_downwards)",
    },
    "daylightHours": {
        "dataset": None, "variable": None, "available": False,
        "reason": "astronomical quantity, not an observed climate product",
    },
    "conclusion": "ERA5-Land CANNOT fully replace ERA5: it cannot supply daily "
                  "precipitation, therefore precipDaysGe1mm can never come from "
                  "ERA5-Land. ERA5-Land satisfies temperature + monthly precipitation only.",
}

# ---------------------------------------------------------------------------
# 3. Canonical field -> Copernicus (ERA5, PRIMARY) request plan
# ---------------------------------------------------------------------------
FIELD_PLAN = {
    "tempMeanC": {
        "dataset": DATASETS["era5_monthly_means"],
        "variable": "2m_temperature", "statistic": None,
        "unit_in_file": "K",
        "post_processing": "K -> degC (-273.15); then mean over 1991..2020",
    },
    "precipMm": {
        "dataset": DATASETS["era5_monthly_means"],
        "variable": "total_precipitation", "statistic": None,
        "unit_in_file": "m of water equivalent PER DAY",
        "post_processing": "tp_mm = tp_m_per_day * 1000 * days_in_month(year, month); "
                           "then mean over 1991..2020",
        "defect_fixed": "previous template used 'm -> mm (x1000)' only (~30x under-estimate)",
    },
    "tempHighC": {
        "dataset": DATASETS["era5_daily_statistics"],
        "variable": "2m_temperature", "statistic": "daily_maximum",
        "unit_in_file": "K",
        "post_processing": "K -> degC; per-year calendar-month mean of daily max; "
                           "then mean over 1991..2020",
    },
    "tempLowC": {
        "dataset": DATASETS["era5_daily_statistics"],
        "variable": "2m_temperature", "statistic": "daily_minimum",
        "unit_in_file": "K",
        "post_processing": "K -> degC; per-year calendar-month mean of daily min; "
                           "then mean over 1991..2020",
    },
    "precipDaysGe1mm": {
        "dataset": DATASETS["era5_daily_statistics"],
        "variable": "total_precipitation", "statistic": "daily_sum",
        "unit_in_file": "m",
        "post_processing": "APPROVED as derived field in methodology v8.6 (Option A): "
                           "count(daily total precipitation >= 1.0 mm, WMO rain-day "
                           "convention) per calendar month per year, then mean over "
                           "1991-2020. daily_sum output is metres per day of accumulation; "
                           "the >= 1 mm comparison is on the daily SUM (1 mm = 0.001 m). "
                           "Provenance must record derived=true + threshold + formula; "
                           "no official-product claim for the count itself.",
        "status": "APPROVED-DERIVED (v8.6)",
    },
    "sunshineHours": {
        "dataset": None, "variable": None, "statistic": None, "status": "UNRESOLVED",
        "post_processing": "null - no official sunshine-duration parameter in the ERA5 family",
    },
    "daylightHours": {
        "dataset": None, "variable": None, "statistic": None, "status": "UNRESOLVED",
        "post_processing": "null - astronomical; no vetted implementation adopted",
    },
}

PERIOD = {"years": [str(y) for y in range(1991, 2021)],
          "months": [f"{m:02d}" for m in range(1, 13)],
          "days": [f"{d:02d}" for d in range(1, 32)]}

KNOWN_CONSTRAINTS = [
    "F-1 (2026-09-13, schema-verified): derived-era5-single-levels-daily-statistics "
    "accepts NO data_format input; output is netCDF inside a zip archive. "
    "build_daily_statistics_request must not send data_format.",
    "F-2 (2026-09-13, schema-verified): year is a single string for "
    "derived-era5-single-levels-daily-statistics -> one request per year "
    "(30 years x 3 statistics = 90 daily requests for the 1991-2020 pilot).",
    "ERA5-Land daily statistics omit accumulated variables -> no daily precipitation, "
    "no daily_sum for ERA5-Land.",
    "Daily statistics are computed during retrieval and are NOT part of a permanently "
    "archived dataset - every request must be logged for reproducibility.",
    "Only UTC or time zones west of UTC are retrievable for the first available day "
    "(1940-01-01 ERA5 / 1950-01-01 ERA5-Land).",
    "Daily statistics output is netCDF inside a zip archive.",
    "Monthly means of total_precipitation are per-day rates; multiply by days in month.",
    "CDS requests are queued; latency ranges from hours to days.",
]


# ---------------------------------------------------------------------------
# 4. Three explicit request builders (not one vague template)
# ---------------------------------------------------------------------------
def _area(lat: float, lon: float, half: float):
    """CDS area order is [North, West, South, East]."""
    return [lat + half, lon - half, lat - half, lon + half]


def build_monthly_means_request(field: str, year: str, month: str,
                                lat: float, lon: float, half: float = 0.25) -> dict:
    """ERA5 Monthly Means (tempMeanC, precipMm)."""
    spec = FIELD_PLAN[field]
    if spec["dataset"] != DATASETS["era5_monthly_means"]:
        raise ValueError(f"{field} is not served by ERA5 Monthly Means")
    return {
        "dataset": spec["dataset"],
        "request": {
            "product_type": "monthly_averaged_reanalysis",
            "variable": spec["variable"],
            "year": year,
            "month": [month],
            "time": ["00:00"],
            "area": _area(lat, lon, half),
            "data_format": "netcdf",
        },
        "post_processing": spec["post_processing"],
    }


def build_daily_statistics_request(field: str, year: str, month: str,
                                   lat: float, lon: float, half: float = 0.25) -> dict:
    """ERA5 Derived Daily Statistics (tempHighC, tempLowC; candidate precipDays)."""
    spec = FIELD_PLAN[field]
    if spec["dataset"] != DATASETS["era5_daily_statistics"]:
        raise ValueError(f"{field} is not served by ERA5 daily statistics")
    return {
        "dataset": spec["dataset"],
        "request": {
            "product_type": "reanalysis",
            "variable": spec["variable"],
            # F-2: official schema defines year as a single string, NOT an array
            # -> callers must iterate one year per request.
            "year": year,
            "month": [month],
            "day": PERIOD["days"],
            "daily_statistic": spec["statistic"],
            "time_zone": TIMEZONE_AND_DAY_BOUNDARY["value"],
            "frequency": FREQUENCY["value"],
            "area": _area(lat, lon, half),
            # F-1: NO data_format here - not a schema input for this dataset;
            # output is netCDF-in-zip regardless.
        },
        "post_processing": spec["post_processing"],
    }


def build_era5land_request(field: str, year: str, month: str,
                           lat: float, lon: float) -> dict:
    """ERA5-Land (0.1 deg) monthly means or daily statistics, per field matrix."""
    spec = ERA5_LAND_FIELD_MATRIX[field]
    if not spec.get("available"):
        raise ValueError(f"{field} is NOT available from ERA5-Land: {spec.get('reason')}")
    monthly = spec["dataset"] == DATASETS["era5land_monthly_means"]
    req = {
        "product_type": "monthly_averaged_reanalysis" if monthly else "reanalysis",
        "variable": spec["variable"],
        "year": year,
        "month": [month],
        "area": _area(lat, lon, 0.1),
        # F-1: data_format is a schema input ONLY for the monthly-means dataset.
        # For daily statistics (monthly=False) it must be omitted; output is
        # netCDF-in-zip regardless. Also note F-2: daily year is a single string.
    }
    if monthly:
        req["data_format"] = "grib"
        req["time"] = ["00:00"]
    else:
        req["day"] = PERIOD["days"]
        req["daily_statistic"] = spec["daily_statistic"]
        req["time_zone"] = TIMEZONE_AND_DAY_BOUNDARY["value"]
        req["frequency"] = FREQUENCY["value"]
    return {"dataset": spec["dataset"], "request": req,
            "post_processing": spec.get("convert", "") + "; " + spec.get("aggregation", "")}


if __name__ == "__main__":
    raise SystemExit(
        "TEMPLATE ONLY - not executable.\n"
        "Missing prerequisites:\n"
        f"  cdsapi installed : {PREREQUISITES['cdsapi_installed']}\n"
        f"  ~/.cdsapirc      : {PREREQUISITES['cdsapirc_present']}\n"
        f"  env vars         : {PREREQUISITES['env_vars_present']}\n"
        "ERA5_PRIMARY_TEST = BLOCKED_BY_MISSING_CDS_CREDENTIALS"
    )
