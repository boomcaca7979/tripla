#!/usr/bin/env python3
"""Pilot Phase 1C — deterministic astronomical daylightHours implementation.

Closes methodology blocker M-1 by adopting an explicit, reproducible
implementation (methodology v8.6, S6/daylightHours):

Daily quantity
    daylightDuration(lat, date) = civil daylight duration for calendar
    `date` at latitude `lat`, i.e. the interval between sunrise and sunset
    with the standard convention: solar zenith angle at sunrise/sunset
    z0 = 90.833 deg (geometric centre 90 deg + 34' refraction + 16' solar
    upper limb). Solar declination is evaluated with the NOAA "General
    Solar Position Calculations" equations at 12:00 UT of that date.
    The duration depends only on (lat, date) — it does NOT depend on
    longitude or timezone (EoT shifts solar noon, not day length).
    Deterministic; no climate observation, no source family.

Monthly aggregation (contract, v8.6)
    daylightHours[destination, month] =
        mean over y = 1991..2020 of
            mean over calendar days of month m of year y of
                daylightDuration(lat, y-m-d)
    i.e. year-level monthly mean -> arithmetic mean over the 30 years,
    each year weighted equally. February leap years are handled exactly:
    8 of the 30 years are leap years and contribute a 29-day mean; the
    other 22 contribute a 28-day mean. No pooled weighting.

Polar handling
    If cos(ha) >= 1 the sun never rises that day -> duration 0.0 h.
    If cos(ha) <= -1 the sun never sets that day -> duration 24.0 h.
    (rovaniemi 66.5648 N is on the Arctic Circle, so both cases occur.)

Output
    reports/daylight_calc.json   per-destination 12 monthly values + meta
"""
import calendar
import datetime
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CFG = ROOT / "pilot/best-time/config/destinations.json"
REPORTS = ROOT / "pilot/best-time/reports"

YEARS = list(range(1991, 2021))
ZENITH_OFFSET_DEG = 90.833  # 90 + 34' refraction + 16' solar upper limb
FORMULA_VERSION = "noaa-solar-position-2026.09.v1"
METHODOLOGY_VERSION = "utrip-methodology-2026.09.v8.6"


def solar_declination_deg(year, month, day):
    """NOAA General Solar Position Calculations, evaluated 12:00 UT."""
    # Julian day at 12:00 UT (fraction 0.5 after the 12h meridian)
    a = (14 - month) // 12
    y = year + 4800 - a
    m = month + 12 * a - 3
    jdn = day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
    jd = jdn + 0.5
    t = (jd - 2451545.0) / 36525.0

    l0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360.0
    m_anom = 357.52911 + t * (35999.05029 - 0.0001537 * t)
    e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
    c = (math.sin(math.radians(m_anom)) * (1.914602 - t * (0.004817 + 0.000014 * t))
         + math.sin(math.radians(2 * m_anom)) * (0.019993 - 0.000101 * t)
         + math.sin(math.radians(3 * m_anom)) * 0.000289)
    true_long = l0 + c
    omega = 125.04 - 1934.136 * t
    app_long = true_long - 0.00569 - 0.00478 * math.sin(math.radians(omega))
    eps0 = 23.0 + (26.0 + ((21.448 - t * (46.815 + t * (0.00059 - t * 0.001813)))) / 60.0) / 60.0
    eps = eps0 + 0.00256 * math.cos(math.radians(omega))
    decl = math.degrees(math.asin(math.sin(math.radians(eps)) * math.sin(math.radians(app_long))))
    return decl


def daylight_duration_hours(lat, year, month, day):
    """Civil daylight duration in hours for one calendar date. Polar-safe."""
    decl = solar_declination_deg(year, month, day)
    phi = math.radians(lat)
    d = math.radians(decl)
    cos_ha = (math.cos(math.radians(ZENITH_OFFSET_DEG)) / (math.cos(phi) * math.cos(d))
              - math.tan(phi) * math.tan(d))
    if cos_ha >= 1.0:
        return 0.0     # polar night: sun never rises
    if cos_ha <= -1.0:
        return 24.0    # midnight sun: sun never sets
    ha = math.degrees(math.acos(cos_ha))
    return 2.0 * ha / 15.0


def monthly_daylight(lat):
    """Canonical v8.6 aggregation: mean over 1991-2020 of per-year monthly means."""
    out = []
    for m in range(1, 13):
        yearly = []
        for y in YEARS:
            ndays = calendar.monthrange(y, m)[1]
            yearly.append(math.fsum(daylight_duration_hours(lat, y, m, d)
                                    for d in range(1, ndays + 1)) / ndays)
        out.append(round(math.fsum(yearly) / len(yearly), 2))
    return out


def main():
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    dests = cfg["destinations"]

    # --- spot checks against widely published values (verification aids) ---
    checks = [
        ("singapore-equator", 1.3521, "JUN", 21, 6, 2000),
        ("london-51.5N", 51.5074, "JUN", 21, 6, 2000),
        ("london-dec", 51.5074, "DEC", 21, 12, 2000),
    ]
    spots = []
    for name, lat, _, d, m, y in checks:
        spots.append({"name": name, "date": f"{y}-{m:02d}-{d:02d}",
                      "durationH": round(daylight_duration_hours(lat, y, m, d), 3)})

    records = []
    for dest in dests:
        vals = monthly_daylight(dest["latitude"])
        records.append({"destinationId": dest["id"],
                        "latitude": dest["latitude"],
                        "daylightHours": vals})

    out = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "methodologyVersion": METHODOLOGY_VERSION,
        "field": "daylightHours",
        "nature": "astronomical calculation (NOT observed climate data; belongs to no climate source family)",
        "dailyFormula": {
            "name": "NOAA General Solar Position Calculations (declination) + standard sunrise/sunset hour angle",
            "zenithAtSunriseSunsetDeg": ZENITH_OFFSET_DEG,
            "zenithConvention": "90 deg geometric + 34 arcmin refraction + 16 arcmin solar upper limb (civil sunrise/sunset)",
            "declinationEvaluatedAt": "12:00 UT of the calendar date",
            "timeStandardNote": "duration is independent of longitude/timezone; EoT shifts solar noon, not day length",
            "formulaVersion": FORMULA_VERSION,
            "polarHandling": "cos(hour angle) >= 1 -> 0.0 h (polar night); <= -1 -> 24.0 h (midnight sun)",
        },
        "monthlyAggregation": "mean over 1991..2020 of the per-year calendar-month mean of daily duration (equal year weights; leap years exact)",
        "yearWeights": {"rule": "equal weight per calendar year", "years": 30, "leapYears": 8},
        "determinism": "pure arithmetic on (latitude, date); no external data, no RNG, byte-stable",
        "spotChecks": spots,
        "records": records,
    }
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "daylight_calc.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    print(json.dumps({"spotChecks": spots,
                      "sample": {r["destinationId"]: r["daylightHours"]
                                 for r in records if r["destinationId"] in
                                 ("rovaniemi", "singapore", "tokyo", "sydney", "denver")}},
                     ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
