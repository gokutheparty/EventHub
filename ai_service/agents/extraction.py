import re
from typing import Dict, Any, List
from agents.base import BaseAgent

class ExtractionAgent(BaseAgent):
    def __init__(self):
        super().__init__("ExtractionAgent")

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        urls = data.get("discovered_urls", [])
        self.log(f"Starting extraction pipeline across {len(urls)} target candidate URLs.")

        extracted_records: List[Dict[str, Any]] = []

        # Simulated crawling loop
        for idx, url in enumerate(urls):
            self.log(f"Downloading body payload for: {url}")
            
            # In a production scraper, we would run:
            # response = requests.get(url, timeout=10)
            # soup = BeautifulSoup(response.text, 'html.parser')
            # Here we structure mock parsed data depending on the simulated target
            
            if "kempinski" in url:
                raw_extracted = {
                    "name": "Kempinski Gold Coast Event Hall",
                    "phone": "024 123 4567",
                    "email": "events@kempinski.com",
                    "location": "Gamel Abdul Nasser Avenue, Ministries Area, Accra",
                    "website": "https://kempinski.com/accra",
                    "source_url": url,
                    "extracted_images": ["https://kempinski.com/hero.jpg", "https://kempinski.com/hall.jpg"]
                }
            elif "deluxe" in url:
                raw_extracted = {
                    "name": "Deluxe Planners Tema",
                    "phone": "233-30-222-3333",
                    "email": "hello@deluxeplanners.gh",
                    "location": "Community 10, Tema, Ghana",
                    "website": "www.deluxeplanners.gh",
                    "source_url": url,
                    "extracted_images": []
                }
            else:
                raw_extracted = {
                    "name": "Accra Audio DJs",
                    "phone": "030 999 8888",
                    "email": "accradjs@gmail.com",
                    "location": "Oxford Street, Osu, Accra",
                    "website": "",
                    "source_url": url,
                    "extracted_images": ["https://images.unsplash.com/photo-sound"]
                }

            self.log(f"Extracted payload for '{raw_extracted['name']}': Phone: {raw_extracted['phone']}, Email: {raw_extracted['email']}")
            extracted_records.append(raw_extracted)

        data["extracted_records"] = extracted_records
        return data
