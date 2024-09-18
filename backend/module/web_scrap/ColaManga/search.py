from pprint import pprint
from ..utils import SeleniumScraper
from bs4 import BeautifulSoup
import json, uuid, threading, time, sqlite3, os 

from core.settings import BASE_DIR

from backend.module.utils import date_utils

scraper = None

def scrap(search:str="",page:int=1):
    if not search: raise ValueError("The 'search' parameter is required.")
    global scraper

    try:
        url = f"https://www.colamanga.com/search?type={search.get("type")}&page={page}&searchString={search.get("text").replace(" ", "%20")}"
        print(url)
        if not scraper: scraper = SeleniumScraper()
        driver = scraper.driver()
        driver.get(url)
        source = BeautifulSoup(driver.page_source, 'html.parser') 
        
        div = source.select("div.fed-part-layout")[0]
        
        dl_list = div.find_all("dl", {"class": "fed-deta-info"})
        
        DATA = []
        for dl in dl_list:
            object = {}
            dt = dl.find("dt",{"class": "fed-deta-images"})
            a = dt.find("a",{"class": "fed-list-pics"})
            
            id = a.get("href").strip("/")
            object["id"] = id
            
            cover_link_split = a.get("data-original").split("/")
            cover_id = cover_link_split[len(cover_link_split)-2]
            object["cover"] = f"/api/web_scrap/colamanga/get_cover/{id}/{cover_id}/"
            
            dd = dl.find("dd",{"class": "fed-deta-content"})

            h1 =  dd.find("h1",{"class": "fed-part-eone"})
            object["title"] = h1.find("a").text
            DATA.append(object)

        return DATA
    except Exception as e: 

        raise Exception(e)

if __name__ == "__main__":
    DATA = scrap(page=1,search="妖")

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)