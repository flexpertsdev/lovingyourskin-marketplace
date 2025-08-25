#!/usr/bin/env python3
import requests
import os
from urllib.parse import urlparse

# Create base directory
BASE_DIR = "/Users/jos/Developer/lovingyourskin-main/public/assets"

# Image data
images = [
    {
        "brand": "BAO H. LAB",
        "folder": "baohlab",
        "images": [
            {
                "url": "https://ecimg.cafe24img.com/pg1166b57472775036/baogen07/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/aca91dd8cca6ec2264880e26abe3f316.jpg",
                "filename": "hero_1.jpg"
            },
            {
                "url": "https://ecimg.cafe24img.com/pg1166b57472775036/baogen07/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/3295e621c8c81a6effba32f7db4cd672.jpg", 
                "filename": "hero_2.jpg"
            }
        ]
    },
    {
        "brand": "LALUCELL",
        "folder": "lalucell",
        "images": [
            {
                "url": "https://contents.sixshop.com/thumbnails/uploadedFiles/240215/default/image_1682583004318_2500.png",
                "filename": "hero_1.png"
            },
            {
                "url": "https://contents.sixshop.com/thumbnails/uploadedFiles/240215/default/image_1682666986630_750.jpeg",
                "filename": "hero_2.jpeg"
            }
        ]
    },
    {
        "brand": "SUNNICORN",
        "folder": "sunnicorn", 
        "images": [
            {
                "url": "https://en.sunnicorn.com/web/upload/images/press_img_02.jpg",
                "filename": "press_img_02.jpg"
            },
            {
                "url": "https://en.sunnicorn.com/web/upload/images/sus-bg-img-01.jpg",
                "filename": "sus_bg_img_01.jpg"
            },
            {
                "url": "https://en.sunnicorn.com/web/upload/images/brand-bg-img-03.jpg",
                "filename": "brand_bg_img_03.jpg"
            }
        ]
    },
    {
        "brand": "WISMIN",
        "folder": "wismin",
        "images": [
            {
                "url": "https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/upload/24052/main_v01.jpg",
                "filename": "main_v01.jpg"
            },
            {
                "url": "https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/upload/24052/main_story.jpg",
                "filename": "main_story.jpg"
            }
        ]
    }
]

def download_image(url, filepath):
    """Download an image from URL and save to filepath"""
    try:
        print(f"Downloading: {url}")
        
        # Set user agent to avoid blocking
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        file_size = os.path.getsize(filepath)
        print(f"✓ Saved: {filepath} ({file_size:,} bytes)")
        return True
        
    except Exception as e:
        print(f"✗ Failed to download {url}: {str(e)}")
        return False

def main():
    print("Starting image download...")
    
    total_images = 0
    successful_downloads = 0
    
    for brand_data in images:
        brand = brand_data["brand"]
        folder = brand_data["folder"]
        brand_images = brand_data["images"]
        
        print(f"\n--- {brand} ---")
        
        for img_data in brand_images:
            url = img_data["url"]
            filename = img_data["filename"]
            filepath = os.path.join(BASE_DIR, folder, filename)
            
            total_images += 1
            if download_image(url, filepath):
                successful_downloads += 1
    
    print(f"\n--- Summary ---")
    print(f"Total images: {total_images}")
    print(f"Successfully downloaded: {successful_downloads}")
    print(f"Failed: {total_images - successful_downloads}")
    
    print(f"\nNote: THE CELL LAB images are already in place:")
    thecelllab_dir = os.path.join(BASE_DIR, "thecelllab")
    if os.path.exists(thecelllab_dir):
        celllab_files = os.listdir(thecelllab_dir)
        for file in celllab_files:
            if file.endswith(('.jpg', '.jpeg', '.png')):
                filepath = os.path.join(thecelllab_dir, file)
                size = os.path.getsize(filepath) 
                print(f"✓ {filepath} ({size:,} bytes)")

if __name__ == "__main__":
    main()
