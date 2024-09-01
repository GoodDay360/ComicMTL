from bs4 import BeautifulSoup
from pprint import pprint
from backend.module.web_scrap.utils import SeleniumScraper

scraper = None

def scrap(id:int=1):
    if not id: raise ValueError("The 'id' parameter is required.")
    global scraper
    
    url = f"https://www.colamanga.com/{id}/"
    
    if not scraper: scraper = SeleniumScraper()
    driver = scraper.driver()
    driver.get(url)
    
    DATA = {}
    
    # Get info
    source = BeautifulSoup(driver.page_source, 'html.parser') 
    
    div = source.select("div.fed-part-layout")[0]
    
    dt = div.find("dt",{"class","fed-deta-images"})
    
    DATA["cover"] = dt.find("a",{"class":"fed-list-pics"}).get("data-original")
    
    dl = div.find("dl", {"class": "fed-deta-info"})
    
    dd = dl.find("dd", {"class": "fed-deta-content"})
    DATA["title"] = dd.find("h1", {"class": "fed-part-eone"}).text
    
    ul = dd.find("ul", {"class": "fed-part-rows"})
    
    DATA["status"] = ul.find_all("li")[0].find("a").text
    DATA["updated"] = ul.find_all("li")[2].find("a").text
    category_li = ul.find_all("li")[4].find_all("a")
    array = []
    for c in category_li:
        array.append(c.text)
        
    DATA["category"] = array
    
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
    return DATA

if __name__ == "__main__":
    DATA = scrap(page=1,search="妖")

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)