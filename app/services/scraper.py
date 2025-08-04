import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import html


def scrape_website_with_depth(url, depth=1, visited=None):
    # print(f"Scraping... {url}")
    if visited is None:
        visited = set()
    if depth == 0 or url in visited:
        return ""
    try:
        response = requests.get(url, timeout=5)
        if not response.ok:
            return ""
    except Exception:
        return ""
    visited.add(url)
    soup = BeautifulSoup(response.text, "html.parser")
    for script in soup(["script", "style"]):
        script.extract()
    raw_text = soup.get_text(separator=" ", strip=True)
    clean_text = html.unescape(raw_text)
    base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
    links = set()
    for tag in soup.find_all("a", href=True):
        full_url = urljoin(base_url, tag["href"])
        if urlparse(full_url).netloc == urlparse(base_url).netloc:
            links.add(full_url)
    for link in links:
        clean_text += "\n" + scrape_website_with_depth(link, depth - 1, visited)
    return clean_text
