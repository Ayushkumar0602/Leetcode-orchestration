import xml.etree.ElementTree as ET
import zipfile
import json
import os
import io
from PIL import Image

def compress_image(image_data, output_path, max_size_kb=20):
    """Compress image to webp and ensure it's under max_size_kb."""
    img = Image.open(io.BytesIO(image_data))
    
    # Ensure it's RGB (for JPG/WebP)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Try reducing quality first
    for quality in range(95, 10, -5):
        output_buffer = io.BytesIO()
        img.save(output_buffer, format='WEBP', quality=quality, method=6)
        if output_buffer.tell() <= max_size_kb * 1024:
            with open(output_path, "wb") as f:
                f.write(output_buffer.getvalue())
            return output_buffer.tell()
    
    # If still too large at quality 15, start resizing
    scale = 0.9
    while scale > 0.1:
        new_size = (int(img.width * scale), int(img.height * scale))
        if new_size[0] < 50 or new_size[1] < 50:
            break
        resized_img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        for quality in range(60, 10, -10):
            output_buffer = io.BytesIO()
            resized_img.save(output_buffer, format='WEBP', quality=quality, method=6)
            if output_buffer.tell() <= max_size_kb * 1024:
                with open(output_path, "wb") as f:
                    f.write(output_buffer.getvalue())
                return output_buffer.tell()
        scale -= 0.1

    # Final attempt at very low quality and small size
    resized_img = img.resize((int(img.width * 0.3), int(img.height * 0.3)), Image.Resampling.LANCZOS)
    output_buffer = io.BytesIO()
    resized_img.save(output_buffer, format='WEBP', quality=10, method=6)
    with open(output_path, "wb") as f:
        f.write(output_buffer.getvalue())
    return output_buffer.tell()

def extract_chapter(docx_path, start_para, end_para, chapter_num):
    book_id = "computernetworks"
    output_images_dir = f"public/books/{book_id}/chapter{chapter_num}"
    os.makedirs(output_images_dir, exist_ok=True)
    
    with zipfile.ZipFile(docx_path, 'r') as docx:
        doc_xml = docx.read('word/document.xml')
        rels_xml = docx.read('word/_rels/document.xml.rels')

        rels_root = ET.fromstring(rels_xml)
        ns_rels = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}
        rId_to_target = {}
        for rel in rels_root.findall('.//r:Relationship', ns_rels):
            rId_to_target[rel.get('Id')] = rel.get('Target')

        doc_root = ET.fromstring(doc_xml)
        ns_doc = {
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
            'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
            'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
            'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
        }

        blocks = []
        body = doc_root.find('.//w:body', ns_doc)
        paragraphs = body.findall('.//w:p', ns_doc)

        image_counter = 1
        
        # Adjust end_para if it's -1 (end of doc)
        if end_para == -1:
            end_para = len(paragraphs)

        for i in range(start_para, end_para):
            p = paragraphs[i]
            texts = p.findall('.//w:t', ns_doc)
            para_text = "".join(t.text for t in texts if t.text)
            stripped = para_text.strip()
            
            if stripped:
                # Headers: All caps or short text without ending punctuation
                if (stripped.isupper() and len(stripped) < 100) or (len(stripped) < 60 and not stripped.endswith((".", "?", ":", ")", ","))):
                    blocks.append({"type": "header", "text": stripped})
                elif stripped.startswith('•') or stripped.startswith('-') or (len(stripped) > 0 and stripped[0].isdigit() and '. ' in stripped[:4]):
                    blocks.append({"type": "bullet", "text": stripped})
                else:
                    blocks.append({"type": "paragraph", "text": stripped})
            
            # Extract images from this paragraph
            for blip in p.findall('.//a:blip', ns_doc):
                rId = blip.get(f"{{{ns_doc['r']}}}embed")
                if rId and rId in rId_to_target:
                    target = rId_to_target[rId]
                    img_data = docx.read(f"word/{target}")
                    
                    img_filename = f"image{image_counter}.webp"
                    img_output_path = os.path.join(output_images_dir, img_filename)
                    
                    try:
                        size = compress_image(img_data, img_output_path)
                        blocks.append({
                            "type": "image", 
                            "src": f"/books/{book_id}/chapter{chapter_num}/{img_filename}",
                            "caption": f"Figure {chapter_num}-{image_counter}"
                        })
                        print(f"  Extracted image {image_counter}: {size/1024:.1f}KB")
                        image_counter += 1
                    except Exception as e:
                        print(f"  Failed to process image: {e}")

    # Save to public/books/computernetworks/data/chapterN.json
    output_data_dir = f"public/books/{book_id}/data"
    os.makedirs(output_data_dir, exist_ok=True)
    with open(f"{output_data_dir}/chapter{chapter_num}.json", "w", encoding="utf-8") as f:
        json.dump(blocks, f, indent=2)
    
    print(f"Chapter {chapter_num} complete: {len(blocks)} blocks, {image_counter-1} images.")

if __name__ == "__main__":
    docx_file = "COMPUTER NETWORKS NOTES.docx"
    # Unified Chapter boundaries found during research
    chapters = [
        (59, 621, 1),   # UNIT I
        (621, 1210, 2), # UNIT II
        (1210, 1536, 3),# UNIT III
        (1536, 2802, 4),# UNIT IV (Transport)
        (2802, -1, 5)   # UNIT V (Application)
    ]
    
    for start, end, num in chapters:
        print(f"Processing Chapter {num} (Paras {start} to {end})...")
        extract_chapter(docx_file, start, end, num)
