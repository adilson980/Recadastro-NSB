import re

with open("src/App.tsx", "r") as f:
    content = f.read()

print("File size:", len(content))
