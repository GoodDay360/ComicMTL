from pprint import pprint
from backend.module.web_scrap.utils import SeleniumScraper
from bs4 import BeautifulSoup
import json

scraper = None

def scrap(type:int=1,page:int=1,search:str=""):
    if not search: raise ValueError("The 'search' parameter is required.")
    global scraper
    
    url = f"https://www.colamanga.com/search?type={type}&page={page}&searchString={search}"
    
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
        
        object["cover"] = a.get("data-original")
        object["id"] = a.get("href").strip("/")
        object["lastest"] = a.find("span",{"class": "fed-list-remarks"}).text
        
        dd = dl.find("dd",{"class": "fed-deta-content"})

        h1 =  dd.find("h1",{"class": "fed-part-eone"})
        object["title"] = h1.find("a").text
        DATA.append(object)

    return DATA

if __name__ == "__main__":
    DATA = scrap(page=1,search="妖")

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)