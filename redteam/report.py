"""
Turn a DeepTeam RiskAssessment into a short, readable markdown report -
the kind you'd actually put in a portfolio README, not a raw JSON dump.
"""


def _fmt_pct(x):
    return f"{x * 100:.0f}%"


def build_markdown_report(risk_assessment, target_url):
    overview = risk_assessment.overview
    test_cases = risk_assessment.test_cases

    total = len(test_cases)
    failing_cases = [tc for tc in test_cases if tc.score is not None and tc.score <= 0]
    passing_cases = [tc for tc in test_cases if tc.score is not None and tc.score > 0]
    overall_pass_rate = len(passing_cases) / total if total else 0.0

    lines = []
    lines.append("# Red Team Report - Ask My Portfolio")
    lines.append("")
    lines.append(f"Target: `{target_url}`  ")
    lines.append(f"Test cases run: {total}  ")
    lines.append(f"Run duration: {overview.run_duration:.1f}s  ")
    lines.append(f"Overall mitigation rate: **{_fmt_pct(overall_pass_rate)}** ({len(passing_cases)} passed / {len(failing_cases)} failed)")
    if overview.cvss_score is not None:
        lines.append(f"CVSS score: {overview.cvss_score}")
    lines.append("")

    lines.append("## By vulnerability type")
    lines.append("")
    lines.append("| Vulnerability | Type | Mitigation rate | Passed | Failed | Errored |")
    lines.append("|---|---|---|---|---|---|")
    for r in overview.vulnerability_type_results:
        vtype = getattr(r.vulnerability_type, "value", r.vulnerability_type)
        lines.append(
            f"| {r.vulnerability} | {vtype} | {_fmt_pct(r.pass_rate)} | {r.passing} | {r.failing} | {r.errored} |"
        )
    lines.append("")

    lines.append("## By attack method")
    lines.append("")
    lines.append("| Attack | Mitigation rate | Passed | Failed | Errored |")
    lines.append("|---|---|---|---|---|")
    for r in overview.attack_method_results:
        lines.append(
            f"| {r.attack_method} | {_fmt_pct(r.pass_rate)} | {r.passing} | {r.failing} | {r.errored} |"
        )
    lines.append("")

    lines.append("## Findings")
    lines.append("")
    if not failing_cases:
        lines.append(
            "No test case in this run got the app to do something it shouldn't - "
            "no successful prompt injection, no fabricated facts, no leaked "
            "instructions, across the vulnerability types and attack methods "
            "tested. That is not the same as proof of complete safety: it "
            "covers the specific vulnerabilities and attacks configured in "
            "`redteam/run_redteam.py`, not every possible one. See 'Expanding "
            "coverage' in that file's docstring for how to test more."
        )
    else:
        lines.append(f"{len(failing_cases)} test case(s) got the app to do something it shouldn't:")
        lines.append("")
        for i, tc in enumerate(failing_cases, 1):
            vtype = getattr(tc.vulnerability_type, "value", tc.vulnerability_type)
            lines.append(f"### {i}. {tc.vulnerability} - {vtype} (via {tc.attack_method})")
            lines.append("")
            lines.append(f"**Attack prompt:** {tc.input}")
            lines.append("")
            lines.append(f"**App's response:** {tc.actual_output}")
            lines.append("")
            if tc.reason:
                lines.append(f"**Why this failed:** {tc.reason}")
                lines.append("")

    lines.append("## What this covers")
    lines.append("")
    lines.append(
        "This run tests a deliberately scoped set of vulnerabilities relevant "
        "to a grounded Q&A chatbot with no tool access and no database write "
        "path: prompt/instruction leakage, PII fabrication, misinformation "
        "and hallucination under pressure, goal hijacking, and social-"
        "engineering goal theft, probed with prompt injection, roleplay, "
        "system-override, and goal-redirection attacks. It does not test "
        "vulnerability classes that do not apply here (SQL injection, SSRF, "
        "tool/agent abuse), since this app has no tools and no database "
        "query surface reachable from user input."
    )
    lines.append("")

    return "\n".join(lines)
