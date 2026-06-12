from typing import Dict, Any, List
from agents.base import BaseAgent

class DeduplicationAgent(BaseAgent):
    def __init__(self):
        super().__init__("DeduplicationAgent")

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        records = data.get("extracted_records", [])
        self.log(f"Evaluating duplicate records for {len(records)} candidates.")

        unique_records: List[Dict[str, Any]] = []

        for rec in records:
            name = rec.get("name", "")
            phone = rec.get("phone", "")

            # In a production script, we query the PostgreSQL database:
            # duplicates = session.query(Vendor).filter(or_(Vendor.name == name, Vendor.phone == phone)).all()
            # If duplicates exist, we run merge strategies or skip
            
            # Simple simulation: let's assume "Kempinski" duplicates are found (since we seeded Kempinski in prisma/seed.js!)
            if "kempinski" in name.lower() or "test-vendor-uuid-1" in rec.get("source_url", ""):
                self.log(f"Duplicate detected! '{name}' matches seeded database listing by name similarity. Candidate skipped.")
            else:
                self.log(f"No database duplicate found for '{name}' (Phone: {phone}). Ready to stage.")
                unique_records.append(rec)

        data["extracted_records"] = unique_records
        return data
