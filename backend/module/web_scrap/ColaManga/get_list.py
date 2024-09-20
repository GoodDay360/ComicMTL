if __name__ == "__main__": 
    import sys, pathlib
    MODULE_PATH = pathlib.Path(__file__).resolve().parent.parent;sys.path.append(str(MODULE_PATH))
    
    from utils import SeleniumScraper, attach_to_session
    from selenium.webdriver.common.by import By
    import argparse
else:
    from pprint import pprint
    from ..utils import SeleniumScraper
    from bs4 import BeautifulSoup



scraper = None

def job(executor_url,session_id):
    driver = attach_to_session(executor_url,session_id)
    print(driver.current_url)
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

if __name__ == "__main__":
    # DATA = scrap(page=2)
    parser = argparse.ArgumentParser(description="Get list of manga.")

    parser.add_argument('--executor-url', type=str, required=True, help='Selenium executor url')
    parser.add_argument('--session-id', type=str, required=True, help='Webdriver session id')

    # Parse the arguments
    args = parser.parse_args()
    # print(args.executor_url, args.session_id)
    job(args.executor_url,args.session_id)