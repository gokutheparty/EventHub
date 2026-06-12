import requests
from bs4 import BeautifulSoup
from typing import Dict, Any, List
from agents.base import BaseAgent

class DiscoveryAgent(BaseAgent):
    def __init__(self):
        super().__init__("DiscoveryAgent")

    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        category = data.get("category", "event_center")
        city = data.get("city", "Accra")
        source_url = data.get("source_url")

        self.log(f"Initializing discovery process for category: {category} in city: {city}")
        discovered_urls: List[str] = []

        if source_url:
            self.log(f"Crawling targeted source URL directly: {source_url}")
            try:
                # Custom User-Agent to avoid quick blocks
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) EventHubCrawler/1.0"}
                res = requests.get(source_url, headers=headers, timeout=10)
                
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, 'html.parser')
                    # Find potential business page link anchors (e.g. standard directory result links)
                    links = soup.find_all("a", href=True)
                    for link in links:
                        href = link["href"]
                        # Filter for local directory links (mock patterns matching typical business details links)
                        if "/business/" in href or "/vendor/" in href or "/listing/" in href:
                            if href.startswith("/"):
                                # Convert relative to absolute
                                base_url = "/".join(source_url.split("/")[:3])
                                href = base_url + href
                            if href not in discovered_urls:
                                discovered_urls.append(href)
                    
                    self.log(f"Successfully scraped links. Parsed {len(discovered_urls)} match links from page.")
                else:
                    self.log(f"Crawling target returned status {res.status_code}. Using seeded fallbacks.")
            except Exception as e:
                self.log(f"Scraper error encountered: {str(e)}. Resolving fallback defaults.")

        # Fallback seeded links if crawler returns empty results
        if not discovered_urls:
            mock_url = f"https://www.ghana-yellowpages.com/search/{category.lower().replace(' ', '-')}/{city.lower()}"
            self.log(f"Seeding target index search fallbacks: {mock_url}")
            discovered_urls = [
                f"{mock_url}/kempinski-gold-coast",
                f"{mock_url}/deluxe-planners-tema",
                f"{mock_url}/accra-audio-djs"
            ]

        self.log(f"Discovery complete. Identified {len(discovered_urls)} candidate profiles to extract.")
        data["discovered_urls"] = discovered_urls
        return data
