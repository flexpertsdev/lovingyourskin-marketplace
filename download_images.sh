#!/bin/bash
# Script to download brand images

# Create base directory
BASE_DIR="/Users/jos/Developer/lovingyourskin-main/public/assets"

# BAO H. LAB images  
echo "Downloading BAO H. LAB images..."
curl -L -o "$BASE_DIR/baohlab/hero_1.jpg" "https://ecimg.cafe24img.com/pg1166b57472775036/baogen07/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/aca91dd8cca6ec2264880e26abe3f316.jpg"
curl -L -o "$BASE_DIR/baohlab/hero_2.jpg" "https://ecimg.cafe24img.com/pg1166b57472775036/baogen07/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/3295e621c8c81a6effba32f7db4cd672.jpg"

# LALUCELL images
echo "Downloading LALUCELL images..."
curl -L -o "$BASE_DIR/lalucell/hero_1.png" "https://contents.sixshop.com/thumbnails/uploadedFiles/240215/default/image_1682583004318_2500.png"
curl -L -o "$BASE_DIR/lalucell/hero_2.jpeg" "https://contents.sixshop.com/thumbnails/uploadedFiles/240215/default/image_1682666986630_750.jpeg"

# SUNNICORN images  
echo "Downloading SUNNICORN images..."
curl -L -o "$BASE_DIR/sunnicorn/press_img_02.jpg" "https://en.sunnicorn.com/web/upload/images/press_img_02.jpg"
curl -L -o "$BASE_DIR/sunnicorn/sus_bg_img_01.jpg" "https://en.sunnicorn.com/web/upload/images/sus-bg-img-01.jpg"
curl -L -o "$BASE_DIR/sunnicorn/brand_bg_img_03.jpg" "https://en.sunnicorn.com/web/upload/images/brand-bg-img-03.jpg"

# WISMIN images
echo "Downloading WISMIN images..."
curl -L -o "$BASE_DIR/wismin/main_v01.jpg" "https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMg==/_/web/upload/24052/main_v01.jpg"
curl -L -o "$BASE_DIR/wismin/main_story.jpg" "https://cafe24.poxo.com/ec01/newglab01/65uN764GExGfUPmYExKJkv8FaV4Q7nqZ+yenCbN3T2Oa8siQwa9WPdSzrh052QtLm1ZmnqHbC1fl5UDpftrZMG==/_/web/upload/24052/main_story.jpg"

echo "Download complete!"
echo ""
echo "Note: THE CELL LAB images are local references:"
echo "- /assets/thecelllab/blue_01.jpg"  
echo "- /assets/thecelllab/blue_001.jpg"
echo "- /assets/thecelllab/blue_05.jpg"
echo "These need to be moved/copied to the thecelllab subfolder if they exist elsewhere."
