from crewai import Task


def create_tasks(agents, crisis):
    """
    Create concise, evidence-led tasks.

    The first task captures the crisis context. The next three tasks receive
    that short risk assessment as context, while the final task receives
    four deliberately compact outputs rather than long repeated reports.
    """

    crisis_context = f"""
Crisis: {crisis.crisis_type}
Incident: {crisis.description}
Product: {crisis.affected_product or "Not specified"}
Region: {crisis.affected_region or "Not specified"}
Urgency: {crisis.urgency}

Use the available CSV tools. Separate verified dataset facts from
assumptions. Never invent suppliers, stock, shipments, routes, dates,
prices, capacities, or live operational status. If records are missing,
state that clearly and give conditional recommendations.
""".strip()

    risk_task = Task(
        description=(
            f"{crisis_context}\n\n"
            "Assess the disruption using relevant available tools. Identify "
            "the main operational risks and their likely impact. Avoid "
            "repeating the incident description. Keep the assessment concise."
        ),
        expected_output=(
            "Risk brief in no more than 120 words: severity, up to 3 key "
            "risks, verified evidence, missing data, and immediate concern."
        ),
        agent=agents["demand"],
    )

    supplier_task = Task(
        description=(
            "Assess supplier options for the affected product/category. "
            "Use supplier tools where relevant. Use the risk brief for "
            "context; do not restate it. If no matching records exist, say so. "
            "Do not invent alternative suppliers or lead times."
        ),
        expected_output=(
            "Supplier brief in no more than 100 words: matching records, "
            "reliability/lead-time evidence if available, gaps, and a "
            "conditional sourcing recommendation."
        ),
        agent=agents["supplier"],
        context=[risk_task],
    )

    inventory_task = Task(
        description=(
            "Assess stock availability, minimum stock, and demand using "
            "inventory tools. Use the risk brief for context; do not restate "
            "it. If the product has no matching inventory record, state that "
            "and avoid estimating stock or days of cover."
        ),
        expected_output=(
            "Inventory brief in no more than 100 words: verified stock "
            "position, shortage exposure, missing data, and replenishment "
            "priority if supported by records."
        ),
        agent=agents["inventory"],
        context=[risk_task],
    )

    logistics_task = Task(
        description=(
            "Review relevant shipment and route records using available "
            "tools. Use the risk brief for context; do not restate it. "
            "If no matching shipment or route records exist, state that. "
            "Do not invent transit times or route availability."
        ),
        expected_output=(
            "Logistics brief in no more than 100 words: verified shipment/"
            "route findings, likely impact, data gaps, and conditional "
            "mitigation options."
        ),
        agent=agents["logistics"],
        context=[risk_task],
    )

    recovery_task = Task(
        description=(
            "Prepare the final executive recovery plan using only the four "
            "preceding task outputs and the crisis details. Do not reproduce "
            "their reports. Resolve conflicting findings conservatively. "
            "Clearly label verified facts, assumptions, and unknowns. "
            "Prioritize actions by urgency and time horizon. Do not invent "
            "suppliers, inventory quantities, shipment status, costs, or "
            "delivery dates. Include explicit human approval checkpoints. "
            "Keep the final report concise and decision-ready."
        ),
        expected_output=(
            "Executive recovery report, maximum 350 words, with: "
            "1) situation summary; 2) top risks; 3) prioritized actions "
            "(immediate, next 24-48 hours, next 7 days); 4) data gaps and "
            "assumptions; 5) human approval decisions. Use concise bullets."
        ),
        agent=agents["recovery"],
        context=[
            risk_task,
            supplier_task,
            inventory_task,
            logistics_task,
        ],
    )

    return [
        risk_task,
        supplier_task,
        inventory_task,
        logistics_task,
        recovery_task,
    ]
