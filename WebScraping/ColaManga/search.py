from pprint import pprint
from WebScraping.utils import SeleniumScraper
from bs4 import BeautifulSoup
import json

def scrap(type:int=1,page:int=1,search:str=""):
    if not search: raise ValueError("The 'search' parameter is required.")
    
    url = f"https://www.colamanga.com/search?type={type}&page={page}&searchString={search}"
    
    scraper = SeleniumScraper(url=url)
    source = BeautifulSoup(scraper.page_source(), 'html.parser') 
    
    div = source.select("div.fed-part-layout")[0]
    
    dl_list = div.find_all("dl", {"class": "fed-deta-info"})
    
    DATA = []
    for dl in dl_list:
        object = {}
        dt = dl.find("dt",{"class": "fed-deta-images"})
        a = dt.find("a",{"class": "fed-list-pics"})
        
        object["cover"] = a.get("data-original")
        object["url"] = a.get("href")
        object["remarks"] = a.find("span",{"class": "fed-list-remarks"}).text
        
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