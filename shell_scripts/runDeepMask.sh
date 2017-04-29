#!this script will call compute proposals.lua
#!export all the env variables
#!receive a path as a argument and process the image and put the result files back on the given path

echo "image file is at: $1"
export DEEPMASK="/home/cuda/cleanstreets/deepmask/deepmask"
export DEEPMASKMODEL="/home/cuda/cleanstreets/deepmask/deepmask/pretrained/deepmask"

pwd=`pwd`

echo "starting deepmask and generating 15 proposal images"
cd $DEEPMASK
th computeProposals.lua $DEEPMASKMODEL  -img $1 -np 15

echo "finished deepmask... now blending the proposals"
python blendImages.py 15

echo "finally ... moving the file"
mv $DEEPMASK/deepmask_output.jpg ~/clean_street_sink/temp

echo "returning boundarybox as string"
exec 3> result.json

python boundaryBoxJson.py >&3

exec 3>&-

mv $DEEPMASK/result.json ~/clean_street_sink/temp


echo "output : deepmask_output.jpg and boundaryBox.json located in ~/clean_street_sink/temp"
echo "Bye!"
