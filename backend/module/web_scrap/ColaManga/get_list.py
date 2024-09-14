from pprint import pprint
from ..utils import SeleniumScraper
from bs4 import BeautifulSoup
from backend.module.utils import text_translator
import json, threading, uuid, time

from backend.models.model_cache import RequestCache
from backend.module.utils import date_utils


scraper = None

RequestQueueRoom = "colamanga_get_list"
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
                RequestCache.objects.filter(room=RequestQueueRoom,client=self.id).delete()
                if RequestQueueID == self.id: RequestQueueID = None
                break
            except Exception as e: print(f"Error Exiting Room: {RequestQueueRoom}.\n {e}\nRetrying...")
        
def RequestQueueManager():
    while True:
        global RequestQueueRoom,RequestQueueID
        try:
            if not RequestQueueID: 
                if RequestCache.objects.filter(room=RequestQueueRoom).count():
                    RequestCache.objects.filter(room=RequestQueueRoom,datetime__lte= date_utils.utc_time().add((-5,'minute')).get()).delete()
                    RequestQueueID = RequestCache.objects.filter(room=RequestQueueRoom).order_by("datetime").values("client").first().get("client")
        except Exception as e: print(f"Error Room: {RequestQueueRoom}.\n {e}\nRetrying...")
        
thread = threading.Thread(target=RequestQueueManager)
thread.daemon = True
thread.start()


def scrap(translate={},orderBy:str="weeklyCount",page:int=1):
    global scraper, RequestContextManager, RequestQueueID
    with RequestContextManager() as queue_id:
        while RequestQueueID != queue_id: pass
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
                if translate.get("state"): 
                    object["title"] = text_translator.translate(
                        text=li.find("a", {"class": "fed-list-title"}).text,
                        from_code=translate.get("from"),
                        to_code=translate.get("to")
                    )
                else: object["title"] = li.find("a", {"class": "fed-list-title"}).text
                id = li.find("a", {"class": "fed-list-pics"}).get("href").strip("/")
                object["id"] = id
                cover_link_split = li.find("a", {"class": "fed-list-pics"}).get("data-original").split("/")
                cover_id = cover_link_split[len(cover_link_split)-2]
                object["cover"] = f"/api/web_scrap/colamanga/get_cover/{id}/{cover_id}/"
                
                DATA.append(object)
                
            return DATA
        except Exception as e: 
            raise Exception(e)

if __name__ == "__main__":
    DATA = scrap(page=2)

    print (DATA)