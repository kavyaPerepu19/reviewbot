from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import csv

driver = webdriver.Chrome() 
driver.maximize_window()


product_url = "https://www.flipkart.com/u-s-polo-assn-octavia-2-0-slip-sneakers-men/p/itmef5ba38cea99c?pid=SHOGEFRHQ8CFP6GB&lid=LSTSHOGEFRHQ8CFP6GB4FSBNP&marketplace=FLIPKART&q=shoes&store=osp&srno=s_1_14&otracker=AS_Query_HistoryAutoSuggest_6_0_na_na_na&otracker1=AS_Query_HistoryAutoSuggest_6_0_na_na_na&fm=search-autosuggest&iid=e1cdf047-d437-44d1-b283-fef9c0947cf4.SHOGEFRHQ8CFP6GB.SEARCH&ppt=sp&ppn=sp&qH=b0a8b6f820479900"

driver.get(product_url)

try:
    close_popup = driver.find_element(By.XPATH, "//button[contains(text(),'✕')]")
    close_popup.click()
except Exception as e:
    print("Login popup not found, proceeding.")

time.sleep(3)

try:
    read_all_reviews = driver.find_element(By.XPATH, "//span[contains(@class,'_6n9Uuq') and contains(text(),'All')]")
    read_all_reviews.click()
    time.sleep(120)
    
    next = driver.find_element(By.XPATH, "//a[contains(@class,'_1LKTO3') and contains(text(),'Next')]")
except Exception as e:
    print("No 'View all reviews' link found, proceeding.")


reviews = []

review_elements = driver.find_elements(By.XPATH, "//div[@class='EKFha- T2wY6K']//div[@class='_11pzQk']")
for review in review_elements:
    reviews.append(review.text)


output_file = 'flipkart_reviews.csv'
with open(output_file, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Review"])
    for review in reviews:
        writer.writerow([review])

print(f"Scraped {len(reviews)} reviews and saved to {output_file}")

driver.quit()