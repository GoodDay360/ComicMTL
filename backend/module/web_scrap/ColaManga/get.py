from bs4 import BeautifulSoup
from pprint import pprint
from ..utils import SeleniumScraper
from core.settings import BASE_DIR
import os

scraper = None

__is_get = False
def scrap(id:int=1):
    if not id: raise ValueError("The 'id' parameter is required.")
    global scraper, __is_get
    
    while __is_get: pass
    __is_get = True
    try:
        url = f"https://www.colamanga.com/{id}/"
        
        if not scraper: scraper = SeleniumScraper()
        driver = scraper.driver()
        driver.get(url)
        
        DATA = {}
        
        # Get info
        source = BeautifulSoup(driver.page_source, 'html.parser') 
        
        div = source.select("div.fed-part-layout")[0]
        
        dt = div.find("dt",{"class","fed-deta-images"})
        
        cover_id = dt.find("a",{"class":"fed-list-pics"}).get("data-original").split("/")[-2]
        DATA["cover"] = f"/api/web_scrap/colamanga/get_cover/{id}/{cover_id}/"
        
        dl = div.find("dl", {"class": "fed-deta-info"})
        
        dd = dl.find("dd", {"class": "fed-deta-content"})
        DATA["title"] = dd.find("h1", {"class": "fed-part-eone"}).text
        
        ul = dd.find("ul", {"class": "fed-part-rows"})
        
        DATA["status"] = ul.find_all("li")[0].find("a").text
        DATA["author"] = ul.find_all("li")[1].find("a").text
        DATA["updated"] = ul.find_all("li")[2].find("a").text
        
        category_li = ul.find_all("li")[4].find_all("a")
        array = []
        for c in category_li:
            array.append(c.text)
        DATA["category"] = array
        
        DATA["introduction"] = ul.find_all("li")[5].text
        
        # Get Synopsis
        div = source.select("div.all_data_list")[0]
        p = source.find("div",{"class": "fed-tabs-boxs"}).find("p",{"class": "fed-text-muted"})
        DATA["synopsis"] = p.text
        
        
        # Get Chapters
        div = source.select("div.all_data_list")[0]
        ul = div.find("ul",{"class": "fed-part-rows"})
        li_list = ul.find_all("li")
        chapter_array = []
        for li in li_list:
            obj = {}
            obj["title"] = li.find("a").get("title")
            obj["id"] = li.find("a").get("href").lstrip("/")
            chapter_array.append(obj)
        
        DATA["chapters"] = chapter_array
        
        __is_get = False
        return DATA
    except Exception as e:
        __is_get = False
        raise Exception(e)

if __name__ == "__main__":
    DATA = scrap(page=1,search="妖")

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)