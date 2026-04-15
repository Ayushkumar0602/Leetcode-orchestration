import os
import json
import re

BASE_URL = "https://whizan.xyz"
BOOKS_DATA_DIR = "public/books"
OUTPUT_FILE = "public/sitemap-images.xml"

BOOKS = ["ml", "docker", "mysql", "systemdesign"]

def escape_xml(text):
    if not text:
        return ""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&apos;")

def clean_description(text):
    if not text:
        return ""
    
    # Remove Figure references: (Figure 1-5), Figure 30, Fig. 2, Chapter 1 - Figure 30
    # Handles various formats found in the extracted text
    patterns = [
        r'\(?\s*(?:Chapter\s*\d+\s*-\s*)?(?:Figure|Fig\.?|fig\.?)\s*\d+(?:-\d+)?\s*\)?',
        r'\|\s*\d+\s*', # Remove "30 | " style page numbers
        r'\d+\s*\|\s*', # Remove " | 30" style page numbers
    ]
    
    cleaned = text
    for pattern in patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    
    # Clean up whitespace and remaining punctuation
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    cleaned = re.sub(r'^[:\.\,\-\s]+', '', cleaned) # Leading punctuation
    cleaned = re.sub(r'[:\.\,\-\s]+$', '', cleaned) # Trailing punctuation
    
    return cleaned

def generate_image_sitemap():
    xml_header = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
'''
    xml_footer = '</urlset>'
    
    url_entries = []

    for book in BOOKS:
        data_dir = os.path.join(BOOKS_DATA_DIR, book, "data")
        if not os.path.exists(data_dir):
            continue
            
        json_files = [f for f in sorted(os.listdir(data_dir)) if f.endswith(".json")]
        
        for json_file in json_files:
            chapter_id = json_file.replace(".json", "")
            chapter_url = f"{BASE_URL}/books/{book}/{chapter_id}"
            
            json_path = os.path.join(data_dir, json_file)
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    blocks = json.load(f)
            except Exception as e:
                print(f"Error reading {json_path}: {e}")
                continue
            
            url_blocks = []
            current_header = f"{book.upper()} - {chapter_id.capitalize()}"
            
            for i, block in enumerate(blocks):
                if block.get("type") == "header":
                    current_header = clean_description(block.get("text", current_header))
                
                if block.get("type") == "image":
                    img_src = block.get("src", "")
                    if not img_src:
                        continue
                        
                    img_loc = f"{BASE_URL}{img_src}" if img_src.startswith("/") else img_src
                    
                    # Gather context from surrounding blocks
                    context_chunks = []
                    
                    # 1. Header is always useful
                    context_chunks.append(current_header)
                    
                    # 2. Preceding block (up to 2 ago)
                    for offset in range(1, 4):
                        if i - offset >= 0:
                            prev_block = blocks[i - offset]
                            if prev_block.get("type") in ["paragraph", "bullet"]:
                                text = clean_description(prev_block.get("text", ""))
                                if text and text not in context_chunks:
                                    context_chunks.append(text)
                                    break # Only take the first informative one
                                    
                    # 3. Following block
                    if i + 1 < len(blocks):
                        next_block = blocks[i + 1]
                        if next_block.get("type") in ["paragraph", "bullet"]:
                            text = clean_description(next_block.get("text", ""))
                            if text and text not in context_chunks:
                                context_chunks.append(text)

                    # 4. Filter and combine
                    final_desc_parts = []
                    for chunk in context_chunks:
                        if chunk and chunk not in final_desc_parts:
                            # If chunk is too long, take the first sentence
                            if len(chunk) > 250:
                                sentence_match = re.search(r'^(.*?[?\.!])(?:\s|$)', chunk)
                                if sentence_match:
                                    final_desc_parts.append(sentence_match.group(1))
                                else:
                                    final_desc_parts.append(chunk[:250])
                            else:
                                final_desc_parts.append(chunk)

                    # Join chunks into one "very detailed" description
                    detailed_description = ". ".join(final_desc_parts)
                    detailed_description = re.sub(r'\.\s*\.', '.', detailed_description) # Fix double dots
                    
                    entry = "    <image:image>\n"
                    entry += f"      <image:loc>{escape_xml(img_loc)}</image:loc>\n"
                    entry += f"      <image:caption>{escape_xml(detailed_description)}</image:caption>\n"
                    entry += f"      <image:title>{escape_xml(current_header)}</image:title>\n"
                    entry += "    </image:image>\n"
                    url_blocks.append(entry)
            
            if url_blocks:
                full_entry = f"  <url>\n    <loc>{chapter_url}</loc>\n" + "".join(url_blocks) + "  </url>"
                url_entries.append(full_entry)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(xml_header)
        f.write("\n".join(url_entries))
        f.write("\n" + xml_footer)
        
    print(f"Generated {OUTPUT_FILE} with technical detailed descriptions (no Figure labels).")

if __name__ == "__main__":
    generate_image_sitemap()
