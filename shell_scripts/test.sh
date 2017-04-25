#!this script will call compute proposals.lua
#!export all the env variables
#!receive a path as a argument and process the image and put the result files back on the given path

echo "file is at: $# $1"
pwd=`pwd`

echo "pwd is $pwd"

export DEEPMASK="/home/cuda/cleanstreets/deepmask/deepmask"
export DEEPMASKMODEL="/home/cuda/cleanstreets/deepmask/deepmask/pretrained/deepmask"

echo "starting deepmask"
cd $DEEPMASK
th computeProposals.lua $DEEPMASKMODEL  -img $pwd/$1 -np 15

echo "finished deepmask... now blending the proposals"
python blendImages.py 15

echo "finally ... moving the file"
mv $DEEPMASK/final.jpg $pwd

echo "Bye!"
