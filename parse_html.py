from bs4 import BeautifulSoup
import sys

with open('SystemDesignInterview.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

content = "".join(lines[1567:2228])
soup = BeautifulSoup(content, 'html.parser')

text = soup.get_text(separator='\n')
clean_lines = [line.strip() for line in text.split('\n') if line.strip()]

with open('chapter1_text.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(clean_lines))

print("Extracted", len(clean_lines), "lines of text.")
