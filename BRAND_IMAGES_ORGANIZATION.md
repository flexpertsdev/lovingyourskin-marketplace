# Brand Images Organization

This document describes the organization of brand hero images for the Loving Your Skin project.

## Directory Structure

The images are organized in brand-specific subfolders under `/public/assets/`:

```
/public/assets/
├── baohlab/
├── lalucell/  
├── sunnicorn/
├── thecelllab/
└── wismin/
```

## Brand Image Mapping

### BAO H. LAB (`/assets/baohlab/`)
- **hero_1.jpg** - `https://ecimg.cafe24img.com/pg1166b57472775036/baogen07/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/aca91dd8cca6ec2264880e26abe3f316.jpg`
- **hero_2.jpg** - `https://ecimg.cafe24img.com/pg1166b57472775036/baogen07/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/3295e621c8c81a6effba32f7db4cd672.jpg`

### LALUCELL (`/assets/lalucell/`)
- **hero_1.png** - `https://contents.sixshop.com/thumbnails/uploadedFiles/240215/default/image_1682583004318_2500.png`
- **hero_2.jpeg** - `https://contents.sixshop.com/thumbnails/uploadedFiles/240215/default/image_1682666986630_750.jpeg`

### SUNNICORN (`/assets/sunnicorn/`)
- **press_img_02.jpg** - `https://en.sunnicorn.com/web/upload/images/press_img_02.jpg`
- **sus_bg_img_01.jpg** - `https://en.sunnicorn.com/web/upload/images/sus-bg-img-01.jpg` 
- **brand_bg_img_03.jpg** - `https://en.sunnicorn.com/web/upload/images/brand-bg-img-03.jpg`

### THE CELL LAB (`/assets/thecelllab/`)
*Note: These images were already present locally*
- **blue_01.jpg** - Local file (already exists)
- **blue_001.jpg** - Local file (already exists)
- **blue_05.jpg** - Local file (already exists)

### WISMIN (`/assets/wismin/`)
- **main_v01.jpg** - `https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/upload/24052/main_v01.jpg`
- **main_story.jpg** - `https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/upload/24052/main_story.jpg`

## Usage in Code

The images can now be referenced in your application using paths like:
- `/assets/baohlab/hero_1.jpg`
- `/assets/lalucell/hero_1.png`
- `/assets/sunnicorn/press_img_02.jpg`
- `/assets/thecelllab/blue_01.jpg`
- `/assets/wismin/main_v01.jpg`

## Download Instructions

To download the external images, run one of the following scripts:

### Option 1: Python Script (Recommended)
```bash
cd /Users/jos/Developer/lovingyourskin-main
python3 download_images.py
```

### Option 2: Bash Script
```bash
cd /Users/jos/Developer/lovingyourskin-main
chmod +x download_images.sh
./download_images.sh
```

## Original Data Mapping

This organization corresponds to the following JSON paths:
- `$['data']['baohlab']['heroImages']` → `/assets/baohlab/`
- `$['data']['lalucell']['heroImages']` → `/assets/lalucell/`
- `$['data']['sunnicorn']['heroImages']` → `/assets/sunnicorn/`
- `$['data']['thecelllab']['heroImages']` → `/assets/thecelllab/`
- `$['data']['wismin']['heroImages']` → `/assets/wismin/`

## Notes

1. THE CELL LAB images were already present in the project
2. All other images need to be downloaded from their respective URLs
3. File naming follows a consistent pattern for easy identification
4. All directories have been created and are ready for the images
