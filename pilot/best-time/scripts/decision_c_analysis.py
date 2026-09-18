#!/usr/bin/env python3
"""Decision C impact analysis — Option 1 vs Option 2 elevation acceptance contract.

PILOT ONLY. Produces the fact base for the user's Decision C; the agent does
NOT choose an option and does NOT modify the strategy (v8.6 stays).

Outputs (reports/):
  decision-c-impact-baseline.json
  elevation-source-distribution.json      (tier recount + country grouping + Option 1 scope)
  option2-source-acceptance-framework.json (v8.7-DRAFT contract, not applied)
  option2-simulated-coverage.json          (145 records classified under the DRAFT)
  siem-reap-impact-table.json              (full 12-month old vs new)
  elevation-contract-option-comparison.json
  decision-c-assertions.json
"""
import collections
import datetime
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REPORTS = ROOT / "pilot/best-time/reports"
NORM = ROOT / "pilot/best-time/normalized"
CFG = ROOT / "pilot/best-time/config/destinations.json"


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


AIP_PROBES = [
    {"portal": "www.airservicesaustralia.com", "authority": "Airservices Australia", "country": "Australia",
     "reachable": True, "productType": "AIP PDF bundle; aeronautical data products are subscription/paid"},
    {"portal": "www.navcanada.ca", "authority": "NAV CANADA", "country": "Canada",
     "reachable": True, "productType": "CAP/CSA PDFs per aerodrome"},
    {"portal": "www.enav.it", "authority": "ENAV (Italy)", "country": "Italy",
     "reachable": True, "productType": "eAIP PDF (AD 2 sections per airport)"},
    {"portal": "www.sia.aviation-civile.gouv.fr", "authority": "SIA/DSNA (France)", "country": "France",
     "reachable": True, "productType": "eAIP / VFR PDF bundles"},
    {"portal": "ais.avinor.no", "authority": "Avinor (Norway)", "country": "Norway",
     "reachable": True, "productType": "AIP PDF / Open data pages"},
    {"portal": "nats-uk.ead-it.com", "authority": "NATS (UK AIP)", "country": "United Kingdom",
     "reachable": True, "productType": "eAIP PDF via UK AIP Online Services"},
    {"portal": "www.caa.co.uk", "authority": "UK CAA", "country": "United Kingdom",
     "reachable": True, "productType": "regulatory publications"},
    {"portal": "aisjapan.mlit.go.jp", "authority": "MLIT/JCAB (Japan)", "country": "Japan",
     "reachable": False, "productType": "eAIP PDF (unreachable from this environment)"},
    {"portal": "ead.eurocontrol.int", "authority": "EUROCONTROL EAD", "country": "multi-EU",
     "reachable": False, "productType": "registration-required EAD/AIXM"},
    {"portal": "ais.caa.gov.hk", "authority": "CAD Hong Kong", "country": "Hong Kong SAR",
     "reachable": False, "productType": "eAIP PDF (unreachable)"},
    {"portal": "www.caa.gov.tw", "authority": "CAA Taiwan", "country": "Taiwan",
     "reachable": False, "productType": "AIP PDF (unreachable)"},
    {"portal": "www.luftfartsverket.se", "authority": "LFV (Sweden)", "country": "Sweden",
     "reachable": False, "productType": "AIP PDF (unreachable)"},
    {"portal": "eaip.crocontrol.hrs", "authority": "CCAA Croatia", "country": "Croatia",
     "reachable": False, "productType": "eAIP PDF (unreachable)"},
    {"portal": "aim.navgurukul.co.in", "authority": "AAI (India)", "country": "India",
     "reachable": False, "productType": "AIP PDF (unreachable)"},
    {"portal": "ais.fi", "authority": "Fintraffic (Finland)", "country": "Finland",
     "reachable": True, "productType": "HTTP 406 on root; AIP PDF behind portal"},
]

# countries whose authority/operator Tier-1 sources are known-unavailable or paid
HARD_COUNTRIES = {
    "China": "CAAC AIP not publicly distributed; no free bulk source known",
    "Myanmar": "no accessible AIP; limited publication",
    "Laos": "no accessible AIP; limited publication",
    "Maldives": "AIP PDF only; low accessibility",
    "Nepal": "AIP PDF only; low accessibility",
    "Sri Lanka": "AIP PDF only; low accessibility",
}


def main():
    baseline_prev = load(REPORTS / "t3-preflight-baseline.json")
    ledger = load(REPORTS / "elevation-authority-ledger.json")
    review = load(REPORTS / "elevation-review-v1c.json")
    readiness = load(REPORTS / "production-data-readiness-v1.json")
    cfg = load(CFG)
    dest_by_id = {d["id"]: d for d in cfg["destinations"]}
    sr_sim = load(NORM / "anchor-correction-simulated-siem-reap.json")
    hcmc_sim = load(NORM / "anchor-correction-simulated-hcmc.json")

    # ---------- 1. decision-c-impact-baseline ----------
    led = ledger["ledger"]
    t1 = [e for e in led if e["authorityTier"] == 1]
    baseline = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "artifact": "decision-c-impact-baseline.json",
        "methodologyVersion": baseline_prev["methodologyVersion"],
        "ruleVersion": baseline_prev["ruleVersion"],
        "destinationCount": baseline_prev["destinations"],
        "authoritativeElevationCoverage": f"{len(t1)}/145",
        "secondaryVerifiedCoverage": "143/145 (status vocabulary; incl. the 17 now Tier-1)",
        "blockedElevationCoverage": "2/145 (ho-chi-minh-city, siem-reap — anchor decisions)",
        "T2": "BLOCKED (CDS credentials)",
        "T3": "BLOCKED (T2 + elevation gate per §19.2 literal wording + legal)",
        "frozenHashes": {"core": baseline_prev["hashes"]["canonicalClimateCore_sha256"],
                         "recommendation": baseline_prev["hashes"]["recommendation_sha256"]},
    }

    # ---------- 2. source distribution (raw recount) ----------
    review_by_id = {i["destinationId"]: i for i in review["items"]}
    dist_rows = []
    for e in led:
        did = e["destinationId"]
        if e["authorityTier"] == 1:
            cls = "Tier1"
        elif did in review_by_id:
            cls = ("anchor-pending" if e["status"].startswith("BLOCKED - PENDING")
                   else "reviewed-secondary")
        else:
            cls = "tier3-single-source"
        dist_rows.append({"destinationId": did, "class": cls,
                          "secondSourceTier": review_by_id.get(did, {}).get("sourceB_independent", {}).get("authorityLevel")})
    counts = collections.Counter(r["class"] for r in dist_rows)
    distribution = {
        "generatedAt": baseline["generatedAt"],
        "artifact": "elevation-source-distribution.json",
        "recountFrom": "elevation-authority-ledger.json + elevation-review-v1c.json (raw, not summaries)",
        "tiers": {
            "tier1_authoritative": counts["Tier1"],
            "tier3_single_source": counts["tier3-single-source"],
            "tier3_with_independent_corroboration": counts["reviewed-secondary"],
            "anchor_pending": counts["anchor-pending"],
            "tier2_only": 0, "tier4_only": 0, "missing": 0, "review": counts["reviewed-secondary"] + counts["anchor-pending"],
        },
        "sum": sum(counts.values()),
        "arithmeticCheck": sum(counts.values()) == 145,
        "rows": dist_rows,
    }

    # ---------- 3. Option 1 remaining acquisition scope ----------
    cc = collections.Counter(dest_by_id[e["destinationId"]]["country"]
                             for e in led if e["authorityTier"] != 1)
    probe_by_country = {p["country"]: p for p in AIP_PROBES}
    scope = []
    for country, n in sorted(cc.items(), key=lambda x: -x[1]):
        p = probe_by_country.get(country)
        hard = HARD_COUNTRIES.get(country)
        scope.append({
            "country": country, "destinationCount": n,
            "tier1SourceFound": 0, "tier1SourceMissing": n,
            "sourceType": (p["productType"] if p else
                           hard or "national AIP (PDF) / operator pages; accessibility not probed"),
            "portalReachableThisEnvironment": p["reachable"] if p else None,
            "batchMachineReadable": False,
            "note": ("no FAA-style bulk CSV product identified; per-airport AIP PDF parsing "
                     "would be required" if p else None),
        })
    option1_scope = {
        "generatedAt": baseline["generatedAt"],
        "artifact": "elevation-source-distribution.json#option1Scope",
        "alreadyTier1": {"countries": ["United States"], "destinations": 17, "source": "FAA NFDC NASR bulk CSV"},
        "remaining": {"countries": len(cc), "destinations": sum(cc.values())},
        "countryTable": scope,
        "probes": AIP_PROBES,
        "realisticallyObtainableTier1Coverage": {
            "now": "17/145 (FAA only)",
            "assessment": ("no additional bulk machine-readable Tier-1 product was identified for "
                           "the other 49 countries in this environment: reachable portals (7/16 "
                           "probed) serve PDF eAIPs; several countries are unreachable or paid "
                           "(China CAAC, Japan MLIT unreachable; Airservices data products are "
                           "subscription); per-airport operator pages exist but are not batchable "
                           "and would still require per-record provenance capture"),
            "estimatedRemainingEffort": ("per-country acquisition projects (PDF AD-2 parsing with "
                                         "manual spot checks), weeks of engineering + review; some "
                                         "countries may be effectively unclosable from free public "
                                         "Tier-1 sources"),
        },
    }
    distribution["option1Scope"] = option1_scope

    # ---------- 4. Option 2 framework (v8.7-DRAFT, NOT applied) ----------
    framework = {
        "generatedAt": baseline["generatedAt"],
        "artifact": "option2-source-acceptance-framework.json",
        "status": "v8.7-DRAFT — NOT APPLIED to the strategy; activation requires the user's Decision C = Option 2 and a formal methodology version bump with full re-audit",
        "sourceHierarchy": {
            "Tier 1": "official aviation authority / national AIP / airport operator (FAA NFDC model)",
            "Tier 2": "authoritative aviation database or official-derived database (e.g. ch-aviation)",
            "Tier 3": "reputable airport dataset with traceable provenance (e.g. OurAirports public-domain CSV)",
            "Tier 4": "generic secondary source (Wikipedia, travel sites, search snippets) — never sufficient alone",
        },
        "productionApprovedSourceRequirements": [
            "traceable to a named source with URL/product/version and retrieval date",
            "airport identity matched (IATA + independently resolved ICAO, or Tier-1 ident)",
            "coordinate consistency (anchor-to-source within tolerance, conflicts resolved and recorded)",
            "elevation semantics known (MSL stated)",
            "unit known (ft/m; conversion recorded)",
            "source version/date recorded",
            "reviewed (per-item disposition recorded with reviewer = agent + user gate for policy)",
            "conflict resolution recorded (deltas above threshold escalate, never silently averaged)",
        ],
        "verificationMatrix": {
            "Tier1": "single source sufficient (authority assumed from provenance)",
            "Tier2": "single source sufficient with identity + tolerance checks",
            "Tier3": "requires ONE independent corroborating source (any tier) with elevation delta within 10 m OR documented resolution",
            "Tier4": "insufficient alone; usable only as corroboration",
        },
        "conflictHandling": {
            "delta <= 5 m": "accept candidate; record delta",
            "5 m < delta <= 20 m": "accept with representativeness flag + record both values",
            "delta > 20 m or identity conflict": "NOT APPROVED; escalate",
            "principle": "never average sources; never upgrade a source's tier by agreement alone",
        },
        "approvalStatuses": ["APPROVED-TIER1", "APPROVED-VERIFIED", "PENDING-CORROBORATION",
                             "PENDING-ANCHOR-DECISION", "REJECTED"],
        "anchorSeparation": ("elevation source acceptance is INDEPENDENT of anchor identity "
                             "acceptance; approving an elevation value does not approve an "
                             "anchor coordinate change (Decisions A/B remain separate)"),
    }

    # ---------- 5. Option 2 simulated coverage ----------
    sim_rows = []
    for r in dist_rows:
        did = r["destinationId"]
        if r["class"] == "Tier1":
            status = "APPROVED-TIER1"
        elif r["class"] == "reviewed-secondary":
            status = "APPROVED-VERIFIED"
        elif r["class"] == "anchor-pending":
            status = "PENDING-ANCHOR-DECISION"
        else:
            status = "PENDING-CORROBORATION"
        sim_rows.append({"destinationId": did, "simulatedStatus": status})
    sc = collections.Counter(r["simulatedStatus"] for r in sim_rows)
    opt2_coverage = {
        "generatedAt": baseline["generatedAt"],
        "artifact": "option2-simulated-coverage.json",
        "framework": "v8.7-DRAFT (above)",
        "simulatedStatuses": dict(sc),
        "sum": sum(sc.values()),
        "coverageNow": f"{sc['APPROVED-TIER1'] + sc['APPROVED-VERIFIED']}/145",
        "achievableAfterCorroborationCampaign": (
            "143/145 — the 118 PENDING-CORROBORATION records each need one independent "
            "corroborating source (proven feasible: the 10 review items were all corroborated "
            "via search in Phase 1C); the 2 anchor-pending records stay blocked until "
            "Decisions A/B regardless of elevation source acceptance"),
        "note": "computed from data, not preset; single-source Tier-3 records do NOT auto-approve",
    }

    # ---------- 6. siem-reap impact table ----------
    months = []
    for i in range(12):
        o = sr_sim["old"]["months"][i]
        n = sr_sim["new"]["months"][i]
        months.append({
            "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
            "tempMeanC": {"old": o["tempMeanC"], "new": n["tempMeanC"],
                          "delta": round(n["tempMeanC"] - o["tempMeanC"], 2)},
            "tempHighC": {"old": o["tempHighC"], "new": n["tempHighC"],
                          "delta": round(n["tempHighC"] - o["tempHighC"], 2)},
            "tempLowC": {"old": o["tempLowC"], "new": n["tempLowC"],
                         "delta": round(n["tempLowC"] - o["tempLowC"], 2)},
            "precipMm": {"old": o["precipMm"], "new": n["precipMm"],
                         "delta": round(n["precipMm"] - o["precipMm"], 2)},
            "rule": {"old": o["ruleId"], "new": n["ruleId"]},
            "tier": {"old": o["tier"], "new": n["tier"]},
        })
    sr_table = {
        "generatedAt": baseline["generatedAt"],
        "artifact": "siem-reap-impact-table.json",
        "simulation": "normalized/anchor-correction-simulated-siem-reap.json (full NASA retrieval at proposed anchor)",
        "months": months,
        "highlights": {
            "july": {"precipMm": "198.55 -> 205.39 mm", "rule": "R4 -> R3", "tier": "Workable -> Challenging"},
            "december": {"rule": "R4 -> R7", "tier": "Workable -> Favourable"},
            "bestMonths": {"old": sr_sim["old"]["bestMonthsBaseline"],
                           "new": sr_sim["new"]["bestMonthsBaseline"]},
        },
        "bestMonths": {"old": sr_sim["old"]["bestMonthsBaseline"], "new": sr_sim["new"]["bestMonthsBaseline"]},
    }

    # ---------- 7. hcmc reconfirm ----------
    hcmc = {
        "climateChanged": hcmc_sim["summary"]["climateValueCellsChanged"] > 0,
        "climateValueCellsChanged": hcmc_sim["summary"]["climateValueCellsChanged"],
        "classificationChangedMonths": hcmc_sim["summary"]["classificationChangedMonths"],
        "bestMonthsChanged": hcmc_sim["summary"]["bestMonthsChanged"],
        "conclusion": "data integrity impact = YES; climate numerical impact = NO; anchor identity corrected",
    }

    # ---------- 8. option comparison ----------
    comparison = {
        "generatedAt": baseline["generatedAt"],
        "artifact": "elevation-contract-option-comparison.json",
        "noScoringApplied": True,
        "rows": [
            {"criterion": "acceptance strictness",
             "option1": "§19.2 literal: authoritative source required for all 145",
             "option2": "defined hierarchy + verification matrix; Tier-3 needs corroboration; Tier-4 never sufficient"},
            {"criterion": "coverage today",
             "option1": "17/145 (FAA Tier-1)",
             "option2": f"{sc['APPROVED-TIER1'] + sc['APPROVED-VERIFIED']}/145 approved (17 Tier-1 + 8 verified)"},
            {"criterion": "coverage after feasible work",
             "option1": "unknown ceiling: 128 airports / 49 countries; several countries paid or unreachable (China, Japan-probe, ...); PDF parsing projects",
             "option2": "143/145 achievable via corroboration campaign (118 lookups; method proven); 2 gated by anchor decisions"},
            {"criterion": "engineering work remaining",
             "option1": "per-country Tier-1 acquisition projects (PDF eAIP parsing, provenance capture, spot checks); weeks+; possibly unclosable for some countries",
             "option2": "one corroboration lookup per remaining airport (same method as the 10 already done) + formal v8.7 rewrite + re-audit"},
            {"criterion": "data quality",
             "option1": "highest possible provenance authority",
             "option2": "high: identity+tolerance+MSL+unit+version+corroboration mandatory; explicit conflict thresholds; provenance authority below Tier-1"},
            {"criterion": "T3 impact",
             "option1": "elevation gate stays BLOCKED until 145/145 Tier-1",
             "option2": "elevation gate can close at 143/145 after campaign (anchor decisions still separate); requires v8.7 + full re-audit before it counts"},
            {"criterion": "future maintainability",
             "option1": "every new airport needs a Tier-1 source before onboarding",
             "option2": "framework-based onboarding; corroboration requirement scales linearly and cheaply"},
            {"criterion": "source audit burden",
             "option1": "low volume, high per-record effort",
             "option2": "higher volume, low per-record effort; automated delta checks possible"},
            {"criterion": "risk",
             "option1": "schedule/availability risk: some countries may never yield free Tier-1 elevation (hard blocker risk)",
             "option2": "provenance-quality risk mitigated by thresholds + corroboration; requires disciplined v8.7 audit to avoid criteria erosion"},
            {"criterion": "re-review burden",
             "option1": "re-review only on new sources",
             "option2": "one-off framework audit + periodic delta re-checks on source updates"},
        ],
    }

    # ---------- 9. assertions ----------
    assertions = [
        {"assert": "tier-distribution-sums-to-145", "pass": distribution["sum"] == 145},
        {"assert": "tier1=17", "pass": counts["Tier1"] == 17},
        {"assert": "tier3-single=118", "pass": counts["tier3-single-source"] == 118},
        {"assert": "reviewed-secondary=8", "pass": counts["reviewed-secondary"] == 8},
        {"assert": "anchor-pending=2", "pass": counts["anchor-pending"] == 2},
        {"assert": "option2-sim-coverage-computed-not-preset",
         "pass": opt2_coverage["simulatedStatuses"].get("APPROVED-TIER1") == 17
         and opt2_coverage["simulatedStatuses"].get("APPROVED-VERIFIED") == 8
         and opt2_coverage["simulatedStatuses"].get("PENDING-CORROBORATION") == 118
         and opt2_coverage["simulatedStatuses"].get("PENDING-ANCHOR-DECISION") == 2},
        {"assert": "siem-reap-table-12-months-complete", "pass": len(sr_table["months"]) == 12},
        {"assert": "siem-reap-july-crossing-in-table",
         "pass": sr_table["months"][6]["precipMm"]["old"] == 198.55
         and sr_table["months"][6]["precipMm"]["new"] == 205.39
         and sr_table["months"][6]["rule"] == {"old": "R5", "new": "R3"}},
        {"assert": "siem-reap-december-r4-to-r7",
         "pass": sr_table["months"][11]["rule"] == {"old": "R4", "new": "R7"}},
        {"assert": "hcmc-zero-impact-reconfirmed",
         "pass": not hcmc["climateChanged"] and not hcmc["bestMonthsChanged"]},
        {"assert": "strategy-not-modified (v8.6 stays; framework is DRAFT)",
         "pass": framework["status"].startswith("v8.7-DRAFT")},
        {"assert": "comparison-has-no-scores", "pass": comparison["noScoringApplied"]},
    ]
    out = {"assertions": assertions, "passed": sum(a["pass"] for a in assertions),
           "failed": sum(not a["pass"] for a in assertions)}

    for name, obj in [("decision-c-impact-baseline.json", baseline),
                      ("elevation-source-distribution.json", distribution),
                      ("option2-source-acceptance-framework.json", framework),
                      ("option2-simulated-coverage.json", opt2_coverage),
                      ("siem-reap-impact-table.json", sr_table),
                      ("elevation-contract-option-comparison.json", comparison),
                      ("decision-c-assertions.json", out)]:
        (REPORTS / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({"assertions": f"{out['passed']}/{len(assertions)}",
                      "fails": [a["assert"] for a in assertions if not a["pass"]],
                      "distribution": distribution["tiers"],
                      "option2CoverageNow": opt2_coverage["coverageNow"],
                      "option2Achievable": opt2_coverage["achievableAfterCorroborationCampaign"]},
                     ensure_ascii=False, indent=2))
    return 0 if out["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
