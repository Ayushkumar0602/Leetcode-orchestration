import json
import os

book_id = "computernetworks"
data_dir = f"public/books/{book_id}/data"
chapters = ["chapter1", "chapter2", "chapter3", "chapter4", "chapter5"]

# 1. Remove index from chapter1
c1_path = f"{data_dir}/chapter1.json"
if os.path.exists(c1_path):
    with open(c1_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # The index block is roughly the first 66 items (based on the user's list and my previous view)
    # User list ends at "APPLICATIONS LAYER PARADISMS 256"
    # Looking at my previous view, line 133 is the end of these blocks.
    # I'll look for "UNIT - I" and remove everything before it.
    split_index = -1
    for i, block in enumerate(data):
        if block.get('text') == "UNIT - I":
            split_index = i
            break
    
    if split_index != -1:
        data = data[split_index:]
        with open(c1_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Removed index from chapter1. New start: {data[0].get('text')}")

# 2. Remove small images (< 10KB)
# First, find all small images
small_images = []
for root, dirs, files in os.walk(f"public/books/{book_id}"):
    for file in files:
        if file.endswith(".webp"):
            path = os.path.join(root, file)
            if os.path.getsize(path) < 10 * 1024:
                # Store the relative path as used in JSON: /books/computernetworks/...
                rel_path = path.replace("public", "")
                small_images.append(rel_path)

print(f"Found {len(small_images)} small images to remove.")

for chapter in chapters:
    path = f"{data_dir}/{chapter}.json"
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        original_len = len(data)
        data = [block for block in data if not (block.get('type') == 'image' and block.get('src') in small_images)]
        
        if len(data) < original_len:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print(f"Cleaned {chapter}: removed {original_len - len(data)} images.")

# Optional: actually delete the files?
# for img in small_images:
#     abs_path = "public" + img
#     if os.path.exists(abs_path):
#         os.remove(abs_path)
