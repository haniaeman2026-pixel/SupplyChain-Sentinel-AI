
from crewai import Agent
from backend.tools.supply_chain_tools import (
    inventory_lookup,
    supplier_lookup,
    shipment_lookup,
    route_lookup
)


def create_agents(llm):
    demand_analyst = Agent(
        role="Demand and Supply Chain Risk Analyst",
        goal="Identify supply chain risks, affected products and urgency.",
        backstory=(
            "You are an experienced supply chain risk analyst. "
            "You evaluate stock shortages, demand pressure and crisis severity."
        ),
        tools=[inventory_lookup, shipment_lookup],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    supplier_agent = Agent(
        role="Supplier Intelligence Agent",
        goal="Identify reliable suppliers and alternative sourcing options.",
        backstory=(
            "You analyze supplier reliability, capacity, lead times "
            "and availability to recommend sourcing options."
        ),
        tools=[supplier_lookup],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    inventory_agent = Agent(
        role="Inventory Planning Agent",
        goal="Evaluate inventory coverage and replenishment priorities.",
        backstory=(
            "You specialize in inventory planning, stock coverage, "
            "reorder priorities and shortage prevention."
        ),
        tools=[inventory_lookup],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    logistics_agent = Agent(
        role="Logistics Optimization Agent",
        goal="Assess shipment delays and identify better delivery routes.",
        backstory=(
            "You evaluate shipment conditions, route disruption, "
            "delivery delays and logistics alternatives."
        ),
        tools=[shipment_lookup, route_lookup],
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    recovery_agent = Agent(
        role="Recovery Strategy Coordinator",
        goal="Combine agent findings into a prioritized recovery plan.",
        backstory=(
            "You coordinate cross-functional supply chain recovery. "
            "You produce clear, evidence-based recommendations and "
            "highlight decisions requiring human approval."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

    return {
        "demand": demand_analyst,
        "supplier": supplier_agent,
        "inventory": inventory_agent,
        "logistics": logistics_agent,
        "recovery": recovery_agent
    }
