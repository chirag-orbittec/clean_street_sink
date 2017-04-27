echo "============================"
echo "Begin Labeling image"
source activate tensorflow
export LD_LIBRARY_PATH=/usr/local/cuda/lib64/
python CropImages.py $1
> ~/clean_street_sink/temp/Result.json
noofimg=$(ls -1 | wc -l)
echo "{" >> ~/clean_street_sink/temp/Result.json
for ((i=0; i<noofimg; i++)); do
imgName="~/clean_street_sink/images/result/cropimage"${i}".jpeg"
echo $imgName
echo "\"bb"${1}"\":" >> ~/clean_street_sink/temp/Result.json
python /home/cuda/tensorflow/models/tutorials/image/imagenet/classify_image.py --image_file=$imgName  >> ~/clean_Street_Sink/temp/Result.json
if [ i -ne noofimg-1 ];then
    echo "," >> ~/clean_street_sink/temp/Result.json
fi
done
echo "}" >> ~/clean_street_sink/temp/Result.json
echo "Processing Complete"
echo "============================"
