from bs4 import BeautifulSoup
from pprint import pprint
from ..utils import SeleniumScraper
from core.settings import BASE_DIR
import os, threading, uuid, time, sqlite3,sys

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from backend.module.utils import date_utils

scraper = None

def scrap(id:int=1):
    if not id: raise ValueError("The 'id' parameter is required.")
    global scraper
    try:
        url = f"https://www.colamanga.com/{id}/"
        
        if not scraper: scraper = SeleniumScraper()
        driver = scraper.driver()
        driver.get(url)
        
        DATA = {}
        
        # Get info
        
        cover_url = driver.find_element(By.CLASS_NAME, "fed-list-pics").get_attribute("data-original")
        cover_url_split = cover_url.split("/")
        cover_id = cover_url_split[len(cover_url_split)-2]
        DATA["cover"] = f"/api/web_scrap/colamanga/get_cover/{id}/{cover_id}/"
        
        
        content_info_element = driver.find_element(By.CLASS_NAME, "fed-deta-content")
        DATA["title"] = content_info_element.find_element(By.TAG_NAME, "h1").text
        li_info_elements = content_info_element.find_element(By.TAG_NAME, "ul").find_elements(By.CLASS_NAME, "fed-col-md6")
        
        DATA["status"] = li_info_elements[0].find_element(By.TAG_NAME,"a").text
        DATA["author"] =  li_info_elements[1].find_element(By.TAG_NAME,"a").text
        DATA["updated"] = li_info_elements[2].find_element(By.TAG_NAME,"a").text
        
        category_li = li_info_elements[4].find_elements(By.TAG_NAME,"a")
        array = []
        for c in category_li:
            array.append(c.text)
        DATA["category"] = array
        
        
        DATA["synopsis"] = driver.find_element(By.CLASS_NAME, "fed-tabs-boxs").find_element(By.CSS_SELECTOR, "p.fed-text-muted").get_attribute('innerHTML')
        
        li_elements = driver.find_element(By.CLASS_NAME, "all_data_list").find_element(By.TAG_NAME, "ul").find_elements(By.TAG_NAME, "li")
        
        chapter_array = []
        for li in li_elements:
            obj = {}
            obj["title"] = li.find_element(By.TAG_NAME, "a").get_attribute("title")
            obj["id"] = li.find_element(By.TAG_NAME, "a").get_attribute("href").lstrip("/")
            chapter_array.append(obj)
        
        DATA["chapters"] = chapter_array
        
        
        return DATA
    except Exception as e: 
        exc_type, exc_obj, exc_tb = sys.exc_info()
        line_number = exc_tb.tb_lineno
        print(f"Error on line {line_number}: {e}")
        raise Exception(e) 

if __name__ == "__main__":
    DATA = scrap(page=1,search="妖")

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)