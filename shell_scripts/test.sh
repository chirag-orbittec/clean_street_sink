#!this script will call compute proposals.lua
#!export all the env variables
#!receive a path as a argument and process the image and put the result files back on the given path

echo "file is at: $# $1"
pwd=`pwd`

echo "pwd is $pwd"

export DEEPMASK="/home/cuda/cleanstreets/deepmask/deepmask"
export DEEPMASKMODEL="/home/cuda/cleanstreets/deepmask/pretrained/deepmask"

echo "starting deepmask"
cd $DEEPMASK
th computeProposals.lua $DEEPMASKMODEL  -img $pwd/$1

echo "finished deepmask... now moving files"

mv $DEEPMASK/res1.jpg $pwd
mv $DEEPMASK/res2.jpg $pwd
mv $DEEPMASK/res3.jpg $pwd
mv $DEEPMASK/res4.jpg $pwd
mv $DEEPMASK/res5.jpg $pwd

echo "Bye!"
