import xml.etree.ElementTree as ET
import zipfile
import json
import os

def extract_chapter(docx_path, chapter_title, next_chapter_title, chapter_num):
    output_dir = f"public/books/systemdesign/chapter{chapter_num}"
    os.makedirs(output_dir, exist_ok=True)

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

        in_chapter = False
        chapter_started = False
        image_counter = 1

        for p in body.findall('.//w:p', ns_doc):
            texts = p.findall('.//w:t', ns_doc)
            para_text = "".join(t.text for t in texts if t.text)
            stripped = para_text.strip()
            
            if stripped == chapter_title:
                if not chapter_started:
                    in_chapter = True
                    chapter_started = True
                    blocks.append({"type": "header", "text": stripped})
                    continue
            
            if in_chapter:
                if stripped == next_chapter_title:
                    break
                    
                if stripped:
                    if stripped.startswith('•') or stripped.startswith('1.') or stripped.startswith('2.') or stripped.startswith('3.') or stripped.startswith('4.'):
                        blocks.append({"type": "bullet", "text": stripped})
                    elif len(stripped) < 50 and not stripped.endswith((".", "?", ":", ")", ",")):
                        blocks.append({"type": "header", "text": stripped})
                    else:
                        blocks.append({"type": "paragraph", "text": stripped})
                    
                for blip in p.findall('.//a:blip', ns_doc):
                    rId = blip.get(f"{{{ns_doc['r']}}}embed")
                    if rId and rId in rId_to_target:
                        target = rId_to_target[rId]
                        original_filename = target.split('/')[-1]
                        
                        img_data = docx.read(f"word/{target}")
                        img_path = os.path.join(output_dir, original_filename)
                        with open(img_path, "wb") as f:
                            f.write(img_data)
                        
                        blocks.append({
                            "type": "image", 
                            "src": f"/books/systemdesign/chapter{chapter_num}/{original_filename}",
                            "caption": f"Figure {chapter_num}-{image_counter}"
                        })
                        image_counter += 1

    js_output = f"export const chapter{chapter_num}Blocks = {json.dumps(blocks, indent=2)};\n"
    os.makedirs("src/books/systemdesign/data", exist_ok=True)
    with open(f"src/books/systemdesign/data/chapter{chapter_num}.js", "w", encoding="utf-8") as f:
        f.write(js_output)
    print(f"Chapter {chapter_num} complete: {len(blocks)} blocks, {image_counter-1} images.")

if __name__ == "__main__":
    docx = "SystemDesignInterview.docx"
    extract_chapter(docx, "CHAPTER 5: DESIGN CONSISTENT HASHING", "CHAPTER 6: DESIGN A KEY-VALUE STORE", 5)
    extract_chapter(docx, "CHAPTER 6: DESIGN A KEY-VALUE STORE", "CHAPTER 7: DESIGN A UNIQUE ID GENERATOR IN DISTRIBUTED SYSTEMS", 6)
    extract_chapter(docx, "CHAPTER 7: DESIGN A UNIQUE ID GENERATOR IN DISTRIBUTED SYSTEMS", "CHAPTER 8: DESIGN A URL SHORTENER", 7)
