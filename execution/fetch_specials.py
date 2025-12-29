import requests
import json
import os
import re
from datetime import datetime

# Standard headers to mimic a browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

FB_PAGE_URL = "https://www.facebook.com/hypermeatklerksdorp/"
OUTPUT_DIR = "public/images"
DATA_FILE = "public/data/specials.json"

def fetch_facebook_page():
    print(f"Fetching {FB_PAGE_URL}...")
    try:
        response = requests.get(FB_PAGE_URL, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching page: {e}")
        return None

def extract_image_urls(html_content):
    # Quick regex attempt to find standard FB image URLs (high res)
    # This is brittle but works for a basic implementation without lighter scraping logic
    # We look for "scontent" urls that end in jpg/png
    
    print("Extracting images...")
    # Regex to find potential image URLs in the soup
    # FB often puts them in JSON blobs or src attributes
    
    # Strategy: Find any URL starting with https://scontent and ending with .jpg
    # and select distinct ones.
    
    candidates = re.findall(r'(https:\/\/scontent[^\s"\']+\.jpg[^\s"\']*)', html_content)
    
    # Filter for high quality (often marked with s720x720 or similar, but let's just take unique ones)
    unique_candidates = list(set(candidates))
    
    # We want valid-looking ones.
    # On FB, the main post images usually don't have too many weird sizing parameters in the raw html
    # Let's simple return the first 3 unique ones we find.
    
    valid_images = []
    for url in unique_candidates:
        # Decode HTML entities if any
        url = url.replace('\\/', '/')
        url = url.replace('&amp;', '&')
        
        # Simple heuristic: ignore tiny icons (often have p50x50 or s50x50)
        if 'p50x50' not in url and 's50x50' not in url:
            valid_images.append(url)
            
    print(f"Found {len(valid_images)} potential images.")
    return valid_images[:3]

def download_image(url, filename):
    print(f"Downloading {url} to {filename}...")
    try:
        response = requests.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        with open(filename, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"Failed to download image: {e}")
        return False

def update_json_data():
    # Update the JSON file to point to our local files
    # We assume we always save to special1.jpg, special2.jpg, special3.jpg
    
    data = [
        {
            "title": "Weekly Special",
            "subtitle": "Limited Offer",
            "image": "/images/special1.jpg"
        },
        {
            "title": "Fresh Cut",
            "subtitle": "Butcher's Choice",
            "image": "/images/special2.jpg"
        },
        {
            "title": "Deal of the Week",
            "subtitle": "Don't Miss Out",
            "image": "/images/special3.jpg"
        }
    ]
    
    # Add a cache-buster or timestamp if we wanted, but Vercel redeploy handles it
    
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)
    print("Updated specials.json")

def main():
    html = fetch_facebook_page()
    if not html:
        print("Scraping failed.")
        return

    images = extract_image_urls(html)
    
    if len(images) < 3:
        print("Not enough images found to update.")
        # We could choose to not update or just update what we have.
        # For safety, let's not break the site if we can't find 3.
        return

    # Download images
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    success_count = 0
    for i, url in enumerate(images):
        filename = os.path.join(OUTPUT_DIR, f"special{i+1}.jpg")
        if download_image(url, filename):
            success_count += 1
            
    if success_count == 3:
        update_json_data()
        print("Successfully updated weekly specials.")
    else:
        print("Failed to download all images.")

if __name__ == "__main__":
    main()
