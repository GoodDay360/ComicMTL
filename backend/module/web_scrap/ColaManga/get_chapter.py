from bs4 import BeautifulSoup
from pprint import pprint
from ..utils import SeleniumScraper
from selenium.webdriver.common.by import By
import io, base64
from PIL import Image
import json,time, threading,os, uuid

from backend.models.model_cache import RequestCache
from backend.module.utils import date_utils


scraper = SeleniumScraper()

RequestQueueRoom = "colamanga_get_chapter"
RequestQueueID = None


RequestCache.objects.filter(room=RequestQueueRoom).delete()
class RequestContextManager:
    def __init__(self):
        self.id = uuid.uuid4()
        
    def __enter__(self):
        RequestCache(room=RequestQueueRoom,client=self.id).save()
        return self.id


        
    def __exit__(self,*exc_info):
        global RequestQueueID
        while True:
            try:
                if RequestQueueID: RequestCache.objects.filter(room=RequestQueueRoom,client=self.id).delete()
                if RequestQueueID == self.id: RequestQueueID = None
                break
            except Exception as e: print(f"Error Exiting Room: {RequestQueueRoom}.\n {e}\nRetrying...")
        
def RequestQueueManager():
    while True:
        global RequestQueueRoom,RequestQueueID
        try:
            if not RequestQueueID: 
                if RequestCache.objects.filter(room=RequestQueueRoom).count():
                    RequestCache.objects.filter(room=RequestQueueRoom,datetime__lte= date_utils.utc_time().add(-5,'minute').get()).delete()
                    RequestQueueID = RequestCache.objects.filter(room=RequestQueueRoom).order_by("datetime").values("client").first().get("client")
        except Exception as e: print(f"Error Room: {RequestQueueRoom}.\n {e}\nRetrying...")
        
thread = threading.Thread(target=RequestQueueManager)
thread.daemon = True
thread.start()


def __scrollToBottom(driver:object=None):
    if not driver: raise ValueError("The 'driver' argument is required.")
    timeout = 10
    interval = [0]

    def timer(interval,timeout):
        while True:
            time.sleep(1)
            interval[0] = interval[0]+1
            if interval[0] >= timeout: break
    t = threading.Thread(target=timer, args=[interval,timeout])
    t.daemon = True
    t.start()
    
    previous_height = 0
    scrolledY = 0
    while True:
        # Scroll to the bottom of the page
        driver.execute_script(f"window.scrollBy(0, {scrolledY});")
        time.sleep(0.25)
        
        current_height = driver.execute_script("return document.documentElement.scrollHeight")
        
        if current_height > previous_height: 
            previous_height = current_height
            interval[0] = 0
        else:
            parent_div = driver.find_element(By.CLASS_NAME, "mh_mangalist")
            child_elements = parent_div.find_elements(By.XPATH, "./*")
            if child_elements[-1].tag_name != 'script' and child_elements[-1].get_attribute('text') != '__cad.read_periodical();':
                if interval[0] >= timeout: break
            else: interval[0] = 0
        scrolledY += 50
        


def scrap(id:str="",output_dir:str=""):
    if not id: raise ValueError("The 'id' parameter is required.")
    if not output_dir: raise ValueError("The 'output_dir' parameter is required.")
    global scraper, RequestContextManager, RequestQueueID
    
    with RequestContextManager() as queue_id:
        while RequestQueueID != queue_id: pass
        url = f"https://www.colamanga.com/{id}"
        
        if not scraper: scraper = SeleniumScraper()
        driver = scraper.driver()
        driver.get(url)
        
        __scrollToBottom(driver=driver)
        
        parent_element = driver.find_element(By.ID, "mangalist")
        child_list = parent_element.find_elements(By.CLASS_NAME, "mh_comicpic")
        
        blob_list = []
        
        for child in child_list:
            image_element = child.find_element(By.TAG_NAME, "img")
            url = image_element.get_attribute("src")
            if not url: continue
            if url.split(":")[0] == "blob":
                while True:
                    is_image_loaded = driver.execute_script(
                        "return arguments[0].complete", 
                        image_element
                    )
                    if is_image_loaded: break
                blob_list.append(url)
        
        
        def process_browser_log_entry(entry):
            
            response = json.loads(entry['message'])['message']
            return response

        browser_log = driver.get_log('performance') 
        events = [process_browser_log_entry(entry) for entry in browser_log]
        events = [event for event in events if 'Network.response' in event['method']]
        
        
        for e in events:
            if e.get("params").get("type") == "Image":
                url = e.get("params").get("response").get("url")
                if url.split(":")[0] == "blob":
                    request_id = e["params"]["requestId"]
                    response = driver.execute_cdp_cmd('Network.getResponseBody', {'requestId': request_id})
                    img = Image.open(io.BytesIO(base64.decodebytes(bytes(response.get("body"), "utf-8"))))
                    
                    chapter_id = id.split("/")[-1].split(".")[0]
                    
                    dir = os.path.join(output_dir,id.split("/")[0],chapter_id,"original")
                    
                    os.makedirs(dir, exist_ok=True)
                    img.save(os.path.join(dir,f"{blob_list.index(url)}.png"))
                
            
    return {"status":"success"}

if __name__ == "__main__":
    DATA = scrap(id="manga-gu881388",chapter=334)

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)