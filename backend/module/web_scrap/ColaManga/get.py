from bs4 import BeautifulSoup
from pprint import pprint
from ..utils import SeleniumScraper
from core.settings import BASE_DIR
import os, threading, uuid, time

from backend.models.model_cache import RequestCache
from backend.module.utils import date_utils

scraper = SeleniumScraper()

RequestQueueRoom = "colamanga_get"
RequestQueueID = None


RequestCache.objects.filter(room=RequestQueueRoom).delete()
class RequestContextManager:
    def __init__(self):
        self.id = uuid.uuid4()
        
    def __enter__(self):
        RequestCache(room=RequestQueueRoom,client=self.id).save()
        return self.id


        
    def __exit__(self,*exc_info):
        global RequestQueueID
        while True:
            try:
                if RequestQueueID:RequestCache.objects.filter(room=RequestQueueRoom,client=self.id).delete()
                if RequestQueueID == self.id: RequestQueueID = None
                break
            except Exception as e: print(f"Error Exiting Room: {RequestQueueRoom}.\n {e}\nRetrying...")
        
def RequestQueueManager():
    while True:
        global RequestQueueRoom,RequestQueueID
        try:
            if not RequestQueueID: 
                if RequestCache.objects.filter(room=RequestQueueRoom).count():
                    RequestCache.objects.filter(room=RequestQueueRoom,datetime__lte= date_utils.utc_time().add(-5,'minute').get()).delete()
                    RequestQueueID = RequestCache.objects.filter(room=RequestQueueRoom).order_by("datetime").values("client").first().get("client")
        except Exception as e: print(f"Error Room: {RequestQueueRoom}.\n {e}\nRetrying...")
        
thread = threading.Thread(target=RequestQueueManager)
thread.daemon = True
thread.start()

def scrap(id:int=1):
    if not id: raise ValueError("The 'id' parameter is required.")
    global scraper, RequestContextManager, RequestQueueID
    
    with RequestContextManager() as queue_id:
        while RequestQueueID != queue_id: pass
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
            
            return DATA
        except Exception as e:
            raise Exception(e)

if __name__ == "__main__":
    DATA = scrap(page=1,search="妖")

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)