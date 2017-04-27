import urllib
import json
from PIL import Image
import base64
from io import StringIO
import re
import sys

print(sys.argv[1])
im = open(str(sys.argv[1]), "rb")
with open('/home/cuda/clean_street_sink/temp/Phase2Result.json') as data_file:
	data = json.load(data_file)
print(data[0]['bb1']['x'])
image = Image.open(im).convert("RGBA")
i = 0
j = 0
left = 0
right = 0
bottom = 0
top = 0
while j < len(data):
    boundary = data[j]['bb'+str(j+1)]
    top = boundary['x']
    left = boundary['y']
    right = left + boundary['w']
    bottom = top + boundary['h']
    print(left)
    print(right)
    print(top)
    print(bottom)
    im2 = image.crop((top, left, bottom, right))
    print("im2",type(im2))
    im2.save("/home/cuda/clean_street_sink/images/result/cropimage"+str(j)+".jpeg",format="JPEG")
    i = i + 4
    j = j + 1

