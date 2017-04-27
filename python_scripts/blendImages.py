#this code blends the image proposals into a single image
#argument is the number of proposal images to be blend should be of the form res1.jpg, res2.jpg and so on and the output is final.jpg

#from PIL import Image
import cv2
import sys
import exifread

n=sys.argv[1]
print('blending '+n+' images')

def blendImages(n):
    finalImage = ''
    if n>2:
        # Read Destination Image
        finalImage = cv2.imread('./res1.jpg')
        for index in range(1,int(n)):  # Second Example
            # Read Source Images
            srcImage = cv2.imread('./res'+str(index)+'.jpg')

            # Position Two Images Over each Other
            rows, cols, channels = srcImage.shape
            roi = finalImage[0:rows, 0:cols]

            # Now create a mask of Source Image, also Create the Inverted Mask for the Image
            srcImageMask = cv2.cvtColor(srcImage, cv2.COLOR_BGR2GRAY)
            ret, mask = cv2.threshold(srcImageMask, 10, 255, cv2.THRESH_BINARY)
            srcImageInvertedMask = cv2.bitwise_not(mask)

            # Black the Region of the Image from Source Image
            srcImageBackground = cv2.bitwise_and(roi, roi, mask=srcImageInvertedMask)

            # Extract the Image from Black Background
            finalImageForeground = cv2.bitwise_and(srcImage, srcImage, mask=mask)

            # Blend Src Image to Final Image
            dst = cv2.add(srcImageBackground, finalImageForeground)
            finalImage[0:rows, 0:cols] = dst
    else:
	print('dude! only one image is present');
        return
 
    print('done, returning')	
    #with open('final.jpg', 'wb') as f:
    #   f.write(finalImage)	
    cv2.imwrite('deepmask_output.jpg',finalImage)
    # Open image file for reading (binary mode)
   # f = open('final.jpg', 'rb')
    # Return Exif tags
    #tags = exifread.process_file(f)
    #print('printing exif')
    #print(tags)
    return

blendImages(n)

