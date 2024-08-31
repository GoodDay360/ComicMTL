from pprint import pprint
from WebScraping.utils import SeleniumScraper
from bs4 import BeautifulSoup
import json

def scrap(orderBy:str="weeklyCount",page:int=1):
    url = f"https://www.colamanga.com/show?orderBy={orderBy}&page={page}"
    
    scraper = SeleniumScraper(url=url)
    source = BeautifulSoup(scraper.page_source(), 'html.parser') 
    
    ul = source.select("ul.fed-list-info")[0]
    li_list = ul.find_all("li", {"class": "fed-list-item"})
    
    DATA = []
    for li in li_list:
        object = {}
        object["title"] = li.find("a", {"class": "fed-list-title"}).text
        object["url"] = li.find("a", {"class": "fed-list-pics"}).get("href")
        object["cover"] = li.find("a", {"class": "fed-list-pics"}).get("data-original")
        DATA.append(object)
    
    return DATA

if __name__ == "__main__":
    DATA = scrap(page=2)

    print (DATA)