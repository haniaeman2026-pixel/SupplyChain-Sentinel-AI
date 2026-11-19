
from crewai import Task


def create_tasks(agents, crisis):
    crisis_context = f"""
    Crisis type: {crisis.crisis_type}
    Description: {crisis.description}
    Affected product: {crisis.affected_product or "Not specified"}
    Affected region: {crisis.affected_region or "Not specified"}
    Urgency: {crisis.urgency}

    Use the available CSV data tools. Clearly distinguish verified
    dataset facts from assumptions. Do not invent live operational data.
    """

    risk_task = Task(
        description=(
            f"{crisis_context}\n"
            "Identify the main risks, affected products, stock pressure "
            "and likely operational impact. Provide evidence from the tools."
        ),
        expected_output=(
            "A concise risk assessment with identified risks, evidence, "
            "impact and urgency."
        ),
        agent=agents["demand"]
    )

    supplier_task = Task(
        description=(
            f"{crisis_context}\n"
            "Evaluate supplier options for the affected product category. "
            "Compare reliability, lead time, capacity and status."
        ),
        expected_output=(
            "Supplier comparison and recommended sourcing options, "
            "with reasons and limitations."
        ),
        agent=agents["supplier"],
        context=[risk_task]
    )

    inventory_task = Task(
        description=(
            f"{crisis_context}\n"
            "Evaluate available stock, minimum stock and daily demand. "
            "Identify shortage priorities and replenishment needs."
        ),
        expected_output=(
            "Inventory assessment with stock risks and replenishment priorities."
        ),
        agent=agents["inventory"],
        context=[risk_task]
    )

    logistics_task = Task(
        description=(
            f"{crisis_context}\n"
            "Review relevant shipment and route records. Identify delays "
            "and reasonable logistics alternatives."
        ),
        expected_output=(
            "Shipment and route assessment with possible mitigation options."
        ),
        agent=agents["logistics"],
        context=[risk_task]
    )

    recovery_task = Task(
        description=(
            f"{crisis_context}\n"
            "Combine all previous findings into an executive recovery plan. "
            "Rank actions by priority and time horizon. Include risks, "
            "assumptions, confidence limitations and human approval points."
        ),
        expected_output=(
            "A structured executive report containing executive summary, "
            "risk level, findings, prioritized actions, recovery timeline, "
            "human review requirements and data limitations."
        ),
        agent=agents["recovery"],
        context=[
            risk_task,
            supplier_task,
            inventory_task,
            logistics_task
        ]
    )

    return [
        risk_task,
        supplier_task,
        inventory_task,
        logistics_task,
        recovery_task
    ]
