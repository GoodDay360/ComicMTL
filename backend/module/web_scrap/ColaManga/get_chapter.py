from bs4 import BeautifulSoup
from pprint import pprint
from ..utils import SeleniumScraper
from selenium.webdriver.common.by import By
from core.settings import BASE_DIR
from PIL import Image


from backend.module.utils import date_utils

import json,time, threading,os, uuid, sqlite3, io, base64, sys
MAX_TIMEOUT = 10

scraper = None



def __scrollToBottom(driver:object=None):
    if not driver: raise ValueError("The 'driver' argument is required.")
    
    timeout = date_utils.utc_time().add(60,'second').get()
    
    previous_height = 0
    scrolledY = 0
    while True:
        if date_utils.utc_time().get() >= timeout: raise Exception("[Get Chapter] Finding lastest element Timed out!")
        # Scroll to the bottom of the page
        driver.execute_script(f"window.scrollBy(0, {scrolledY});")
        
        current_height = driver.execute_script("return document.documentElement.scrollHeight")
        
        if current_height > previous_height: 
            previous_height = current_height
        else:
            parent_div = driver.find_element(By.CLASS_NAME, "mh_mangalist")
            child_elements = parent_div.find_elements(By.XPATH, "./*")
            if child_elements[-1].get_attribute('text') != '__cad.read_periodical();': break
        scrolledY += 50
        


def scrap(comic_id:str="",chapter_id:str="",output_dir:str=""):
    if not comic_id: raise ValueError("The 'comic_id' parameter is required.")
    if not chapter_id: raise ValueError("The 'chapter_id' parameter is required.")
    if not output_dir: raise ValueError("The 'output_dir' parameter is required.")
    global scraper
    

    try:
        url = f"https://www.colamanga.com/{chapter_id}"
        
        if not scraper: scraper = SeleniumScraper()
        driver = scraper.driver()
        driver.get(url)
        
        __scrollToBottom(driver=driver)
        
        parent_element = driver.find_element(By.ID, "mangalist")
        child_list = parent_element.find_elements(By.CLASS_NAME, "mh_comicpic")
        
        blob_list = []
        for child in child_list:
            timeout = date_utils.utc_time().add(5,'second').get()
            while True:
                if date_utils.utc_time().get() > timeout: break
                image_element = child.find_element(By.TAG_NAME, "img")
                driver.execute_script("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", image_element)
                
                url = image_element.get_attribute("src")
                if url: 
                    is_image_loaded = driver.execute_script(
                        "return arguments[0].complete", 
                        image_element
                    )
                    if is_image_loaded: 
                        blob_list.append(url)
                        break
                    
                    
        
        
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
                    
                    chapter_id = chapter_id.split("/")[-1].split(".")[0]
                    
                    dir = os.path.join(output_dir)
                    
                    os.makedirs(dir, exist_ok=True)
                    img.save(os.path.join(dir,f"{blob_list.index(url)}.png"))
                
                
        return {"status":"success"}
    except Exception as e: 
        exc_type, exc_obj, exc_tb = sys.exc_info()
        line_number = exc_tb.tb_lineno
        print(f"Error on line {line_number}: {e}")
        raise Exception(e) 
    finally: pass

if __name__ == "__main__":
    DATA = scrap(chapter_id="manga-gu881388",chapter=334)

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)