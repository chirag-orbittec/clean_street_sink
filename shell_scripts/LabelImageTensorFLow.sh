echo "============================"
echo "Begin Labeling image"
source activate tensorflow
export LD_LIBRARY_PATH=/usr/local/cuda/lib64/
python ~/clean_street_sink/python_scripts/CropImages.py $1
> ~/clean_street_sink/temp/result.json
pwd=`pwd`
cd /home/cuda/clean_street_sink/images/result/
noofimg=$(ls -1 | wc -l)
noofimg=$(($noofimg-1))
cd $pwd
echo $noofimg
echo "{" >> ~/clean_street_sink/temp/result.json
i=0
while [ $i -le $noofimg ]
do
    imgName="/home/cuda/clean_street_sink/images/result/cropimage"${i}".jpeg"
    echo $imgName
    echo "\"bb"${i}"\":" >> ~/clean_street_sink/temp/result.json
    python /home/cuda/tensorflow/models/tutorials/image/imagenet/classify_image.py --image_file=$imgName  >> ~/clean_street_sink/temp/result.json
    if [ $i -ne $noofimg ];then
        echo "," >> ~/clean_street_sink/temp/result.json
    fi
    i=$(($i+1))
done
echo "}" >> ~/clean_street_sink/temp/result.json
echo "Processing Complete"
echo "============================"
