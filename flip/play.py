from playwright.sync_api import sync_playwright
import csv
import json
import time

def get_product_details(page):
    product_name = page.locator("//span[@class='mEh187']").inner_text()
    product_price = page.locator("//div[@class='Nx9bqj CxhGGd']").inner_text()
    product_rating = page.locator("//div[@class='XQDdHH _1Quie7']").inner_text()
    image_elements = page.locator("//div[@class='HXf4Qp jmR1E0']//img[@class='_0DkuPH']").all()
    image_urls = []
    for image in image_elements:
        image_url = image.get_attribute('src')  
        image_urls.append(image_url)
    # product_reviews = page.locator("//span[@class='_2_R_DZ']").inner_text()

    return {
        "name": product_name,
        "price": product_price,
        "rating": product_rating,
        "images": image_urls,
        
    }


def get_reviews(page):
    

    try:
        page.locator("//button[contains(text(),'✕')]").click(timeout=3000)
    except:
        pass

    time.sleep(3)

    try:
        page.locator("//span[contains(@class,'_6n9Uuq') and contains(text(),'All')]").click()
        time.sleep(5)
    except:
        pass

    reviews_and_ratings = []
    pc=0
    count=0
    while True:
        review_elements = page.locator("//div[@class='EKFha- T2wY6K']//div[@class='_11pzQk']").all()
        rating_elements = page.locator("//div[@class='XQDdHH Ga3i8K _9lBNRY']").all()

        for i in range(len(review_elements)):
            review_text = review_elements[i].inner_text()
            try:
                rating_text = rating_elements[i].inner_text().split()[0]
                rating = int(rating_text)
            except (IndexError, ValueError):
                rating = None  

            reviews_and_ratings.append({"stars": rating, "review": review_text,"count":count})
            count+=1
        print("scraped page", pc)
        pc+=1

        try:
            next_button = page.locator("//a[@class='_9QVEpD' and span[text()='Next']]")
            if next_button.is_visible():
                next_button.click()
                time.sleep(3)
            else:
                break
        except:
            break
    return reviews_and_ratings


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    product_url = "https://www.flipkart.com/u-s-polo-assn-octavia-2-0-slip-sneakers-men/p/itmef5ba38cea99c?pid=SHOGEFRHQ8CFP6GB"
    page.goto(product_url)
    pdetails=get_product_details(page)
    result=get_reviews(page)

   
    output_json_file = 'reviews.json'

    with open("product.json", mode='w', encoding='utf-8') as file:
        json.dump(pdetails, file, ensure_ascii=False, indent=4)

    with open(output_json_file, mode='w', encoding='utf-8') as file:
        json.dump(result, file, ensure_ascii=False, indent=4)

    browser.close()
