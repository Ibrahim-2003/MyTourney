import glob, os, pyperclip

result = ''  # store for your lines
files = glob.glob("E:/MyTourney/Mobile Web Frontend/views/*.ejs")
for fle in files:
    result += '\'/'
    result += os.path.basename(fle)
    result += '\',\n'
pyperclip.copy(result)
print(result)