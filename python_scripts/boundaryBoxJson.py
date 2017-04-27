import json

bb_path = "./bb.txt"
whiteSpaceRegex = "\s+";
bb_matrix =[]
coordinates = []

f = open(bb_path, "r")
np = 15


i=0
n=0
for line in f:
    coordinates = line.split(whiteSpaceRegex)
    j=0

    while j<len(coordinates[0]):
        n = 0
        coordinate = coordinates[0]
        k = []
        if not coordinate[j].isdigit():
            j=j+1
            continue
        else:
            while coordinate[j].isdigit():
                n = n*10 + int(coordinate[j])
                j=j+1
            bb_matrix.append(n)
            n=0
    i=i+1
    if(i>np-1):
        break
#print(bb_matrix)


bbstring = "["
p=0
j=0

while True:
    p=p+1
    bbstring+='{"bb'+str(p)+'"'+':{'
    bbstring+='"x":'+ str(bb_matrix[j])
    j=j+1
    bbstring+= ',"y":' + str(bb_matrix[j])
    j=j+1
    bbstring+= ',"w":' + str(bb_matrix[j])
    j=j+1
    bbstring+= ',"h":' + str(bb_matrix[j])
    j=j+1
    if (p == np):
        bbstring += '}}]'
    else:
        bbstring += '}},'
    if(p==np):
        break

print(bbstring)
