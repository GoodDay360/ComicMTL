from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import time, threading


class SeleniumScraper:
    driver = None
    
    def __init__(self,url):
        self.url = url
        if not SeleniumScraper.driver:
            print("Webdriver not existed! Attempting to load one. This may take a while...")
            WINDOW_SIZE = "1920,1080"
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--window-size=%s" % WINDOW_SIZE)
            chrome_options.add_argument('--no-sandbox')
            

            chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})

            
            SeleniumScraper.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        self.driver = SeleniumScraper.driver
        self.driver.get(self.url)
    
    def __enter__(self):
        pass
    
    def __exit__(self):
        pass
    
    def page_source(self):
        return self.driver.page_source
    

            

    
        