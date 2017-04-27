echo "============================"
echo "Begin Labeling image"
source activate tensorflow
export LD_LIBRARY_PATH=/usr/local/cuda/lib64/
python /home/cuda/tensorflow/models/tutorials/image/imagenet/classify_image.py --image_file=$1 > ~/clean_Street_Sink/temp/Result.json
echo "Processing Complete"
echo "============================"
