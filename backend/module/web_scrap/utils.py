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
    def __init__(self):

        WINDOW_SIZE = "1920,1080"
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--window-size=%s" % WINDOW_SIZE)
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument("--no-quit")
        
        chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
        self.__driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        
    
    def __enter__(self):
        pass
    
    def __exit__(self):
        pass
    
    
    def driver(self):
        return self.__driver
    
    

            

    
        