from typing import Dict, Any, List
from agents.base import BaseAgent

class EnrichmentAgent(BaseAgent):
    def __init__(self):
        super().__init__("EnrichmentAgent")

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        records = data.get("extracted_records", [])
        self.log(f"Starting classification and geo-tag enrichment for {len(records)} candidates.")

        enriched_records: List[Dict[str, Any]] = []

        for rec in records:
            name = rec.get("name", "")
            location = rec.get("location", "")

            # 1. Category Classification Mapping
            # In a production pipeline, this would run LLM prompts matching categories
            categories = []
            if "hall" in name.lower() or "center" in name.lower():
                categories.append("Event Centers")
            elif "planner" in name.lower():
                categories.append("Event Planners")
            elif "usher" in name.lower():
                categories.append("Ushering Agencies")
            elif "cater" in name.lower():
                categories.append("Caterers")
            elif "decor" in name.lower():
                categories.append("Decorators")
            elif "dj" in name.lower() or "sound" in name.lower():
                categories.append("DJs")
            else:
                # Fallback category
                categories.append("Live Bands")

            # 2. Location Enrichment & Geo-Coordinates Lookup
            # Mocks geocoding response based on city matches
            city = "Accra"
            region = "Greater Accra"
            latitude = 5.5539
            longitude = -0.1983

            if "kumasi" in location.lower():
                city = "Kumasi"
                region = "Ashanti"
                latitude = 6.6906
                longitude = -1.6244
            elif "tema" in location.lower():
                city = "Tema"
                region = "Greater Accra"
                latitude = 5.6698
                longitude = -0.0166

            self.log(f"Categorized '{name}' as dynamic category: {categories}")
            self.log(f"Resolved coordinates for '{location}': City: {city}, Coordinates: ({latitude}, {longitude})")

            rec["categories"] = categories
            rec["city"] = city
            rec["region"] = region
            rec["country"] = "Ghana"
            rec["latitude"] = latitude
            rec["longitude"] = longitude
            enriched_records.append(rec)

        data["extracted_records"] = enriched_records
        return data
