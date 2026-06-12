from typing import Dict, Any, List
from agents.base import BaseAgent

class GrowthAgent(BaseAgent):
    def __init__(self):
        super().__init__("GrowthAgent")

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        records = data.get("extracted_records", [])
        self.log(f"Running growth campaigns for {len(records)} candidate listings.")

        for rec in records:
            name = rec.get("name", "")
            email = rec.get("email", "")
            
            # Growth Action 1: Formulate Claim invitation
            if email:
                claim_invite = f"Hi {name}, we discovered your services and created a pre-approved profile on EventHub. Claim it today to manage inquiries!"
                rec["claim_invitation"] = claim_invite
                self.log(f"Claim invite template compiled for '{name}' -> Sent to '{email}'")

            # Growth Action 2: Audit missing details for profile completeness
            missing = []
            if not rec.get("extracted_images") or len(rec.get("extracted_images", [])) == 0:
                missing.append("portfolio_projects")
            if not rec.get("website"):
                missing.append("website_link")
            if not rec.get("phone"):
                missing.append("contact_phone")
            
            if missing:
                self.log(f"Profile Completeness Campaign: '{name}' is missing {missing}. Generated completion prompts.")
                rec["missing_data_requests"] = missing

            # Growth Action 3: Vendor Re-Engagement Campaigns (Simulating inactive checks)
            # For demonstration we assume the candidate has been idle for >30 days
            self.log(f"Vendor Re-Engagement Campaign: Detected '{name}' has been idle. Sent automatic email reminder: 'Keep your portfolio up-to-date and respond to pending inquiries on EventHub!'")
            rec["reengagement_sent"] = True

        return data
