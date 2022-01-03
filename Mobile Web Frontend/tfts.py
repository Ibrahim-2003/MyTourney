import glob, os, pyperclip

result = ''  # store for your lines
files = glob.glob("E:/MyTourney/Mobile Web Frontend/*js")
for fle in files:
    result += '\'/css/'
    result += os.path.basename(fle)
    result += '\',\n'
pyperclip.copy(result)
print(result)