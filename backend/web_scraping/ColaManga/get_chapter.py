from bs4 import BeautifulSoup
from pprint import pprint
from web_scraping.utils import SeleniumScraper
from selenium.webdriver.common.by import By
import io, base64
from PIL import Image
import json,time, threading,os

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
        


def scrap(id:str="",chapter:int=None):
    if not id: raise ValueError("The 'id' parameter is required.")
    if not chapter: raise ValueError("The 'chapter' parameter is required.")
    
    url = f"https://www.colamanga.com/{id}/1/{chapter}.html"
    
    scraper = SeleniumScraper(url=url)
    driver = scraper.driver
    
    __scrollToBottom(driver=driver)
    
    def process_browser_log_entry(entry):
        
        response = json.loads(entry['message'])['message']
        return response

    browser_log = driver.get_log('performance') 
    events = [process_browser_log_entry(entry) for entry in browser_log]
    events = [event for event in events if 'Network.response' in event['method']]
    
    
    DATA = []
    page = 0
    for e in events:
        object = {}
        if e.get("params").get("type") == "Image":
            url = e.get("params").get("response").get("url")
            if url.split(":")[0] == "blob":
                request_id = e["params"]["requestId"]
                response = driver.execute_cdp_cmd('Network.getResponseBody', {'requestId': request_id})
                img = Image.open(io.BytesIO(base64.decodebytes(bytes(response.get("body"), "utf-8"))))
                os.makedirs(f'media/{id}/{chapter}', exist_ok=True)
                img.save(f'media/{id}/{chapter}/{page}.png')
                
                object["url"] = url
                object["file_path"] = f"media/my-image-{id}.png"
                DATA.append(response)
                
                page += 1
            
            
    with open("./temp.json","w", encoding='utf-8') as f:
        json.dump(DATA , f,indent=2)
            

if __name__ == "__main__":
    DATA = scrap(id="manga-gu881388",chapter=334)

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)