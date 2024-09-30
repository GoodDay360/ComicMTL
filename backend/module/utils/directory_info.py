import os
import concurrent.futures

def _get_file_size(path):
    return os.path.getsize(path)

def _get_size(directory, max_threads):
    total_size = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_threads) as executor:
        futures = []
        with os.scandir(directory) as entries:
            for entry in entries:
                if entry.is_file():
                    futures.append(executor.submit(_get_file_size, entry.path))
                elif entry.is_dir():
                    futures.append(executor.submit(_get_size, entry.path, max_threads))
        
        for future in concurrent.futures.as_completed(futures):
            total_size += future.result()
    
    return total_size

def GetDirectorySize(directory, max_threads=5):
    return _get_size(directory, max_threads)
