import re
from typing import Dict, Any, List
from agents.base import BaseAgent

class CleaningAgent(BaseAgent):
    def __init__(self):
        super().__init__("CleaningAgent")

    def clean_phone(self, phone: str) -> str:
        if not phone:
            return ""
        # Strip brackets, dashes, spaces
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        
        # If it starts with local "0" and is 10 digits, replace with standard +233
        if cleaned.startswith("0") and len(cleaned) == 10:
            cleaned = "+233" + cleaned[1:]
        elif cleaned.startswith("233") and not cleaned.startswith("+"):
            cleaned = "+" + cleaned
        elif not cleaned.startswith("+") and len(cleaned) == 9:
            cleaned = "+233" + cleaned
            
        return cleaned

    def clean_name(self, name: str) -> str:
        if not name:
            return ""
        # Strip excess whitespace, normalize title cases
        name = re.sub(r'\s+', ' ', name).strip()
        return name.title()

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        records = data.get("extracted_records", [])
        self.log(f"Initializing deduplication & cleaning checks on {len(records)} extracted candidates.")

        cleaned_records: List[Dict[str, Any]] = []

        for rec in records:
            old_phone = rec.get("phone", "")
            new_phone = self.clean_phone(old_phone)
            
            old_name = rec.get("name", "")
            new_name = self.clean_name(old_name)

            self.log(f"Normalized phone format from '{old_phone}' -> '{new_phone}'")
            self.log(f"Sanitized name from '{old_name}' -> '{new_name}'")

            rec["phone"] = new_phone
            rec["name"] = new_name
            cleaned_records.append(rec)

        data["extracted_records"] = cleaned_records
        return data
