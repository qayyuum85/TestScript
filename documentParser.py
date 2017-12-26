#!/usr/bin/python
import sys
from tika import parser

fIn = sys.argv[1]
fOut = sys.argv[2]

parsed = parser.from_file(fIn)

with open(file=fOut, mode='w', encoding='utf8') as f:
    f.write(parsed['content'])