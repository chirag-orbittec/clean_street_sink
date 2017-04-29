echo "============================"
echo "Begin Labeling image"
source activate tensorflow
export LD_LIBRARY_PATH=/usr/local/cuda/lib64/
python ~/clean_street_sink/python_scripts/CropImages.py $1
pwd=`pwd`
cd /home/cuda/clean_street_sink/images/result/
noofimg=$(ls -1 | wc -l)
noofimg=$(($noofimg))
cd $pwd
echo $noofimg
result=$(echo "{")
i=1
while [ $i -le $noofimg ]
do
    imgName="/home/cuda/clean_street_sink/images/result/cropimage"$(($i-1))".jpeg"
    echo $imgName
    result=$result$(echo "\"bb"${i}"\":")
    result=$result$(python /home/cuda/tensorflow/models/tutorials/image/imagenet/classify_image.py --image_file=$imgName)
    if [ $i -ne $noofimg ];then
        result=$result$(echo ",")
    fi
    i=$(($i+1))
done
result=$result$(echo "}")
echo $result
exec 3> ~/clean_street_sink/temp/result.json
echo "$result" >&3
exec 3>&-
echo "Processing Complete"
echo "============================"