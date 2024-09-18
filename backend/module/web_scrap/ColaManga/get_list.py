from pprint import pprint
from ..utils import SeleniumScraper
from bs4 import BeautifulSoup
import json, threading, uuid, time, sqlite3, os

from backend.module.utils import date_utils

from core.settings import BASE_DIR


scraper = None
# RequestQueueRoom = "colamanga_get_list"
# RequestQueueID = None

# class RequestContextManager:
#     def __init__(self):
#         self.id = str(uuid.uuid4())

        
#     def __enter__(self):
#         conn = sqlite3.connect(os.path.join(BASE_DIR,"cache.sqlite3"))
#         cursor = conn.cursor()
#         cursor.execute("INSERT INTO backend_requestcache (room, client, datetime) VALUES (?, ?, ?)", 
#                    [RequestQueueRoom, self.id, date_utils.utc_time().get()])
#         conn.commit()
#         conn.close()
#         return self.id
    
#     def __exit__(self,*exc_info):
#         global RequestQueueID
        
#         conn = sqlite3.connect(os.path.join(BASE_DIR,"cache.sqlite3"))
#         cursor = conn.cursor()
        
#         while True:
#             try:
#                 if RequestQueueID: 
#                     cursor.execute(
#                         "DELETE FROM backend_requestcache WHERE room = ? AND client = ?",
#                         [RequestQueueRoom, self.id]
#                     )
#                     conn.commit()
#                     conn.close()
#                 else: conn.close()
#                 if RequestQueueID == self.id: RequestQueueID = None
#                 break
#             except Exception as e: 
#                 print(f"Error Exiting Room: {RequestQueueRoom}.\n {e}\nRetrying...")
            
        
# def RequestQueueManager():
#     global RequestQueueRoom,RequestQueueID
#     conn = sqlite3.connect(os.path.join(BASE_DIR,"cache.sqlite3"))
#     cursor = conn.cursor()
    
#     cursor.execute(
#         "DELETE FROM backend_requestcache WHERE room = ?",
#         [RequestQueueRoom]
#     )
#     conn.commit()
    
#     while True:
#         try:
#             if not RequestQueueID: 

#                 cursor.execute(
#                     "DELETE FROM backend_requestcache WHERE room = ? AND datetime <= ?",
#                     [RequestQueueRoom, date_utils.utc_time().add(-5,'minute').get()]
#                 )
#                 conn.commit()
                
#                 cursor.execute(
#                     """
#                         SELECT client FROM backend_requestcache
#                         WHERE room = ?
#                         ORDER BY datetime ASC
#                         LIMIT 1
#                     """,
#                     [RequestQueueRoom]
#                 )
#                 result = cursor.fetchone()
#                 RequestQueueID= result[0] if result else None
                    
#         except Exception as e: 
#             print(f"Error Room: {RequestQueueRoom}.\n {e}\nRetrying...")
        
        
# thread = threading.Thread(target=RequestQueueManager)
# thread.daemon = True
# thread.start()

def scrap(orderBy:str="weeklyCount",page:int=1):
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

if __name__ == "__main__":
    DATA = scrap(page=2)

    print (DATA)