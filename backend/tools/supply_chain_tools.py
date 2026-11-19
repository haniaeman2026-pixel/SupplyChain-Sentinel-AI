
import csv
from pathlib import Path
from crewai.tools import tool

# CSV files are stored inside backend/data
DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def read_csv(filename):
    path = DATA_DIR / filename

    if not path.exists():
        return []

    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


@tool("Inventory Lookup")
def inventory_lookup(product_name: str) -> str:
    """Find stock, minimum stock and demand information for a product."""
    inventory = read_csv("inventory.csv")
    matches = [
        item for item in inventory
        if product_name.lower() in item.get("product_name", "").lower()
        or product_name.lower() in item.get("product_id", "").lower()
    ]

    return str(matches) if matches else "No matching inventory record found in the dataset."


@tool("Supplier Intelligence")
def supplier_lookup(category: str) -> str:
    """Find suppliers, reliability, lead times and supplier status by category."""
    suppliers = read_csv("suppliers.csv")
    matches = [
        supplier for supplier in suppliers
        if category.lower() in supplier.get("product_category", "").lower()
    ]

    return str(matches) if matches else "No matching supplier records found in the dataset."


@tool("Shipment Tracking")
def shipment_lookup(product_id: str) -> str:
    """Find shipment status and delay information for a product."""
    shipments = read_csv("shipments.csv")
    matches = [
        shipment for shipment in shipments
        if product_id.lower() in shipment.get("product_id", "").lower()
    ]

    return str(matches) if matches else "No shipment records found in the dataset."


@tool("Route Assessment")
def route_lookup(destination: str) -> str:
    """Find route travel times and disruption conditions for a destination."""
    routes = read_csv("routes.csv")
    matches = [
        route for route in routes
        if destination.lower() in route.get("destination", "").lower()
    ]

    return str(matches) if matches else "No route records found in the dataset."
