import os
from PIL import Image

def merge_images_vertically(input_dir, output_dir, max_size=10 * 1024 * 1024):
    os.makedirs(output_dir,exist_ok=True)
    
    filenames = sorted(os.listdir(input_dir), key=lambda x: int(x.split(".")[0]))
    
    merged_image = None
    merged_file_index = 0
    
    index = 0
    while True:
        if index > (len(filenames)-1): break
        file = filenames[index]
        if not merged_image:
            image = Image.open(os.path.join(input_dir, file))
            
            width, height = image.size

            new_image = Image.new("RGB", (width, height))
            
            # Paste the two images onto the new image
            new_image.paste(image, (0, 0))
            merged_image = new_image
            index += 1
        else:
            merged_width, merged_height = merged_image.size
            
            merged_image.save(os.path.join(output_dir, "temp.png"))
            file_size = os.stat(os.path.join(output_dir, "temp.png")).st_size

            
            if file_size >= max_size:
                output_path = os.path.join(output_dir, f"{merged_file_index}.png")
                if os.path.exists(output_path): os.remove(output_path)
                os.rename(os.path.join(output_dir, "temp.png"), output_path)
                merged_image = None
                merged_file_index += 1
            else:
                image = Image.open(os.path.join(input_dir, file))
                width, height = image.size

                # Create a new image with the combined width and the height of the tallest image
                new_width = max(merged_width, width)
                new_height = merged_height + height
                new_image = Image.new("RGB", (new_width, new_height))

                # Paste the two images onto the new image
                new_image.paste(merged_image, (0, 0))
                new_image.paste(image, (0, merged_height))
                merged_image = new_image
                index += 1
    
    if merged_image: 
        temp_path = os.path.join(output_dir, "temp.png")
        if os.path.exists(temp_path): os.remove(temp_path)
        merged_image.save(os.path.join(output_dir, f"{merged_file_index}.png"))
    

def split_image_vertically(input_dir, output_dir):
    os.makedirs(output_dir,exist_ok=True)
    
    filenames = sorted(os.listdir(input_dir), key=lambda x: int(x.split(".")[0]))
    file_index = 0
    for file in filenames:
        cropped_height = 0
        while True:
            merged_translated_image = Image.open(os.path.join(input_dir, file))
            max_width = merged_translated_image.width
            max_height = merged_translated_image.height
            
            height_to_crop = cropped_height + 1200
            
            if height_to_crop >= max_height: height_to_crop = max_height
            
            cropped_image = merged_translated_image.crop((0, cropped_height, max_width, height_to_crop))
            
            cropped_image.save(os.path.join(output_dir, f"{file_index}.png"))
            
            if height_to_crop < max_height: cropped_height = height_to_crop
            else: break
            file_index += 1
    

if __name__ == "__main__":
    input_dir = "media/manga-gu881388/334"
    output_dir = "media/manga-gu881388/334-merged"
    max_size = 10 * 1024 * 1024  # 10 MB

    count = merge_images_vertically(input_dir, output_dir, max_size)
    print(f"Merged {count} images.")

# if __name__ == "__main__":
#     input_dir = "media/manga-gu881388/334-merged-translated"
#     output_dir = "media/manga-gu881388/334-translated"
#     split_image_vertically(input_dir, output_dir)