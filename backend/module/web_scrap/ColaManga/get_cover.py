
from ..utils import SeleniumScraper
import json, os
from core.settings import BASE_DIR

import  base64

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

scraper = None

__is_get_cover = False
def scrap(id:int=None,cover_id:int=None):
    if not id: raise ValueError("The 'id' parameter is required.")
    if not cover_id: raise ValueError("The 'url' parameter is required.")
    global scraper, __is_get_cover
    
    __is_get_cover = True
    try:
        
        url = f"https://www.colamanga.com/{id}/"
        
        if not scraper: scraper = SeleniumScraper()
        driver = scraper.driver()
        
        driver.get(url)
        
        
        image_src_url = f'https://res.colamanga.com/comic/{cover_id}/cover.jpg'

        # Find the image element by its src attribute

        origin_image_element = driver.find_elements(By.CLASS_NAME, "fed-list-pics")[0]
        
        # Execute JavaScript to check if the image is fully loaded
        driver.execute_script(f'arguments[0].innerHTML = "<img id=\\"injected_image\\" src=\\"{image_src_url}\\">";', origin_image_element)
        
        image_element = driver.find_element(By.ID, "injected_image")
        
        while True:
            is_image_loaded = driver.execute_script(
                "return arguments[0].complete", 
                image_element
            )
            if is_image_loaded: break

        DATA = None
        
        def process_browser_log_entry(entry):
            
            response = json.loads(entry['message'])['message']
            return response

        browser_log = driver.get_log('performance') 
        events = [process_browser_log_entry(entry) for entry in browser_log]
        events = [event for event in events if 'Network.response' in event['method']]
        
        for e in events:
            if e.get("params").get("type") == "Image":
                url = e.get("params").get("response").get("url")
                if url == image_src_url:
                    request_id = e["params"]["requestId"]
                    response = driver.execute_cdp_cmd('Network.getResponseBody', {'requestId': request_id})
                    image_data = base64.decodebytes(bytes(response.get("body"), "utf-8"))

                    DATA = image_data
                    break
        
        __is_get_cover = False
        return DATA
    except Exception as e: 
        __is_get_cover = False
        raise Exception(e)

if __name__ == "__main__":
    DATA = scrap(page=1,search="妖")

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)