import os

def rename_files():
    i = 0
    path = "."  # current directory
    for filename in os.listdir(path):
        new_name = str(i)
        source = os.path.join(path, filename)
        destination = os.path.join(path, new_name)
        
        # rename() function will rename all the files
        os.rename(source, destination)
        i += 1

rename_files()
