import zipfile
import xml.etree.ElementTree as ET
import os

def extract_text_from_hwpx(file_path):
    try:
        with zipfile.ZipFile(file_path, 'r') as zf:
            # Find the section XML files
            section_files = [f for f in zf.namelist() if f.startswith('Contents/section') and f.endswith('.xml')]
            
            text_content = []
            for sec_file in sorted(section_files):
                xml_content = zf.read(sec_file)
                root = ET.fromstring(xml_content)
                
                # Extract text from all 't' elements which represent text runs in HWPX
                # HWPX namespaces
                ns = {'hp': 'http://www.hancom.co.kr/hwpml/2011/paragraph'}
                
                for t in root.iter('{http://www.hancom.co.kr/hwpml/2011/paragraph}t'):
                    if t.text:
                        text_content.append(t.text)
                
                # Also try without namespace just in case
                for t in root.iter('t'):
                    if t.text:
                        text_content.append(t.text)

            return '\n'.join(text_content)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    hwpx_path = '개인정보처리방침.hwpx'
    text = extract_text_from_hwpx(hwpx_path)
    with open('privacy.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Done")
