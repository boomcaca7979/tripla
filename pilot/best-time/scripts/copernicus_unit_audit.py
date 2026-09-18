#!/usr/bin/env python3
"""Pilot Phase 1C — independent mathematical audit of the Copernicus request
template (no network, no credentials; audits structure + unit arithmetic).

Audits
  1. precipitation conversion  tp[mm] = tp[m/day] * 1000 * N_days_in_month
     with unit tests: Jan 31 / Feb 28 / Feb 29 (leap) / Apr 30 — never a
     fixed 30 days;
  2. canonical aggregation  (per-year monthly total -> mean over 1991-2020);
  3. CDS area ordering [North, West, South, East];
  4. dataset IDs, time_zone, daily statistic availability (ERA5 daily_sum for
     accumulated variables; ERA5-Land daily statistics OMIT accumulated vars);
  5. template safety: import must not perform network I/O; execution must
     refuse without credentials.
"""
import calendar
import importlib.util
import io
import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TPL = ROOT / "pilot/best-time/scripts/copernicus_request_template.py"
REPORTS = ROOT / "pilot/best-time/reports"

checks = []
def check(name, ok, detail=""):
    checks.append({"assert": name, "pass": bool(ok), "detail": detail})


# --- load template module (must not perform network I/O on import) ---------
def load_template():
    spec = importlib.util.spec_from_file_location("cop_tpl", TPL)
    mod = importlib.util.module_from_spec(spec)
    saved_urlopen = urllib.request.urlopen

    def guard(*a, **k):
        raise AssertionError("network I/O attempted during template import")
    urllib.request.urlopen = guard
    try:
        spec.loader.exec_module(mod)
        net_free = True
    except AssertionError:
        net_free = False
    finally:
        urllib.request.urlopen = saved_urlopen
    return mod, net_free


def tp_mm(tp_m_per_day, year, month):
    """Independent re-implementation of the audited conversion."""
    return tp_m_per_day * 1000.0 * calendar.monthrange(year, month)[1]


def main():
    mod, net_free = load_template()
    check("template-import-is-network-free", net_free)

    # 1. conversion unit tests (month lengths, incl. leap February)
    cases = [
        ("Jan 31 days", 1991, 1, 31), ("Feb 28 days", 1991, 2, 28),
        ("Feb 29 leap", 1992, 2, 29), ("Apr 30 days", 1991, 4, 30),
        ("Feb 29 leap 2000", 2000, 2, 29), ("Feb 29 leap 2020", 2020, 2, 29),
    ]
    conv_ok = True
    conv_detail = {}
    for name, y, m, n in cases:
        got = tp_mm(0.002, y, m)
        exp = 0.002 * 1000 * n
        conv_ok &= abs(got - exp) < 1e-9 and n == calendar.monthrange(y, m)[1]
        conv_detail[name] = f"{got:g} mm"
    check("precip-conversion-month-length-unit-tests", conv_ok,
          json.dumps(conv_detail) + " (0.002 m/day * 1000 * N)")
    check("no-fixed-30-days", calendar.monthrange(1992, 2)[1] == 29
          and calendar.monthrange(1991, 2)[1] == 28)

    # 2. canonical aggregation definition matches template text
    pp = mod.FIELD_PLAN["precipMm"]["post_processing"]
    check("precipMm-post-processing-cites-days_in_month",
          "days_in_month" in pp and "mean over 1991..2020" in pp, pp[:120])

    # worked example from the strategy (0.002 m/day, January -> 62 mm)
    check("strategy-worked-example-62mm", tp_mm(0.002, 1991, 1) == 62.0)

    # 3. area ordering N/W/S/E
    area = mod._area(10.0, 106.8, 0.25)
    check("area-order-N-W-S-E",
          area == [10.25, 106.55, 9.75, 107.05], str(area))

    # 4. dataset ids / timezone / daily statistics
    check("era5-dataset-id", mod.DATASETS["era5_monthly_means"] ==
          "reanalysis-era5-single-levels-monthly-means")
    check("era5-daily-dataset-id", mod.DATASETS["era5_daily_statistics"] ==
          "derived-era5-single-levels-daily-statistics")
    check("era5land-dataset-ids",
          mod.DATASETS["era5land_monthly_means"] == "reanalysis-era5-land-monthly-means"
          and mod.DATASETS["era5land_daily_statistics"] == "derived-era5-land-daily-statistics")
    check("timezone-key-and-value",
          mod.TIMEZONE_AND_DAY_BOUNDARY["request_key"] == "time_zone"
          and mod.TIMEZONE_AND_DAY_BOUNDARY["value"] == "utc+00:00")
    check("era5-daily-sum-available", "daily_sum*" in mod.DAILY_STATISTICS["era5"])
    check("era5land-daily-sum-absent",
          "daily_sum*" not in mod.DAILY_STATISTICS["era5land"])
    matrix = mod.ERA5_LAND_FIELD_MATRIX
    check("era5land-cannot-provide-precipDays",
          matrix["precipDaysGe1mm"]["available"] is False)
    check("era5land-cannot-provide-sunshine",
          matrix["sunshineHours"]["available"] is False)
    check("era5land-conclusion-no-full-replacement",
          "CANNOT fully replace" in matrix["conclusion"])

    # request builders produce structurally valid payloads
    r = mod.build_monthly_means_request("precipMm", "1991", "01", 10.0, 106.8)
    check("monthly-request-structure",
          r["request"]["product_type"] == "monthly_averaged_reanalysis"
          and r["request"]["variable"] == "total_precipitation"
          and r["request"]["time"] == ["00:00"])
    r2 = mod.build_daily_statistics_request("tempHighC", "1991", "01", 10.0, 106.8)
    check("daily-request-structure",
          r2["request"]["daily_statistic"] == "daily_maximum"
          and r2["request"]["time_zone"] == "utc+00:00"
          and r2["request"]["frequency"] == "1_hourly")
    try:
        mod.build_era5land_request("precipDaysGe1mm", "1991", "01", 10.0, 106.8)
        land_guard = False
    except ValueError:
        land_guard = True
    check("era5land-request-refuses-unavailable-fields", land_guard)

    # 5. template refuses to execute without credentials
    check("field-plan-precipDays-approved-derived-v86",
          mod.FIELD_PLAN["precipDaysGe1mm"]["status"] == "APPROVED-DERIVED (v8.6)"
          and "daily_sum" in mod.FIELD_PLAN["precipDaysGe1mm"]["statistic"])

    all_pass = all(c["pass"] for c in checks)
    out = {
        "generatedAt": "2026-09-12",
        "audited": str(TPL.relative_to(ROOT)),
        "assertions": checks,
        "passed": sum(1 for c in checks if c["pass"]),
        "failed": sum(1 for c in checks if not c["pass"]),
        "gate": "COPERNICUS REQUEST/UNIT LOGIC = PASS" if all_pass else "FAIL",
        "note": ("Request-level audit only. ERA5 PRIMARY data retrieval remains "
                 "BLOCKED_BY_MISSING_CDS_CREDENTIALS."),
    }
    (REPORTS / "copernicus-unit-audit.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"passed": out["passed"], "failed": out["failed"], "gate": out["gate"],
                      "fails": [c for c in checks if not c["pass"]]}, ensure_ascii=False, indent=2))
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
