import os
import subprocess

def extract():
    try:
        # We know hwp5txt.exe is in the Scripts folder, or we can use the python module directly
        # hwp5txt "이용약관 예시.hwp" > terms.txt
        subprocess.run(['python', '-m', 'pyhwp.hwp5txt', '이용약관 예시.hwp'], stdout=open('terms.txt', 'w', encoding='utf-8'), check=True)
        print("Success")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    extract()
