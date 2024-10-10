
from pprint import pprint
from ..utils import SeleniumScraper
from bs4 import BeautifulSoup

import threading




scraper = None


def scrap(orderBy:str="monthlyCount",page:int=1):
    global scraper
    

    try:
        url = f"https://www.colamanga.com/show?orderBy={orderBy}&page={page}"
        
        if not scraper: scraper = SeleniumScraper()
        driver = scraper.driver()
        driver.get(url)

        
        source = BeautifulSoup(driver.page_source, 'html.parser') 
        
        ul = source.select("ul.fed-list-info")[0]
        li_list = ul.find_all("li", {"class": "fed-list-item"})
        
        DATA = []
        for li in li_list:
            object = {}
            title = li.find("a", {"class": "fed-list-title"}).text

            object["title"] = title

            
            id = li.find("a", {"class": "fed-list-pics"}).get("href").strip("/")
            object["id"] = id
            cover_link_split = li.find("a", {"class": "fed-list-pics"}).get("data-original").split("/")
            cover_id = cover_link_split[len(cover_link_split)-2]
            object["cover"] = f"/api/web_scrap/colamanga/get_cover/{id}/{cover_id}/"
            
            DATA.append(object)
            
        return DATA
    except Exception as e: 
        raise Exception(e)
    finally: pass
