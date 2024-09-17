from pprint import pprint
from ..utils import SeleniumScraper
from bs4 import BeautifulSoup
import json, uuid, threading, time

from backend.models.model_cache import RequestCache
from backend.module.utils import date_utils

scraper = None

RequestQueueRoom = "colamanga_search"
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


def scrap(type:int=1,page:int=1,search:str=""):
    if not search: raise ValueError("The 'search' parameter is required.")
    global scraper, RequestContextManager, RequestQueueID
    
    with RequestContextManager() as queue_id:
        while RequestQueueID != queue_id: pass
        try:
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
        except Exception as e: 

            raise Exception(e)

if __name__ == "__main__":
    DATA = scrap(page=1,search="妖")

    
    # with open("./temp.html","w", encoding='utf-8') as f:

    #     f.write(ul.prettify())  # Write each element prettified

    
    # pprint(DATA)