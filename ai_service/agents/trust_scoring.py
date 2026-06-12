from typing import Dict, Any, List
from agents.base import BaseAgent

class TrustScoringAgent(BaseAgent):
    def __init__(self):
        super().__init__("TrustScoringAgent")

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        records = data.get("extracted_records", [])
        self.log(f"Vetting domain authority and profile completeness for {len(records)} candidates.")

        scored_records: List[Dict[str, Any]] = []

        for rec in records:
            name = rec.get("name", "")
            phone = rec.get("phone", "")
            email = rec.get("email", "")
            website = rec.get("website", "")
            location = rec.get("location", "")

            # Calculate mock trust score
            score = 0.50 # Base score

            # Enforce parameters checking
            if phone:
                score += 0.15
            if email:
                score += 0.15
            if website and len(website) > 4:
                score += 0.10
            if location and len(location) > 10:
                score += 0.10

            confidence_score = 0.85 if website else 0.70

            self.log(f"Trust vetting for '{name}' finished. Confidence: {confidence_score:.2f}, Trust Score: {score:.2f}")

            rec["confidence_score"] = confidence_score
            rec["trust_score"] = score
            scored_records.append(rec)

        data["extracted_records"] = scored_records
        return data
