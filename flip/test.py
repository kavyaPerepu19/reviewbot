from playwright.sync_api import sync_playwright
import json
import time

def solve_captcha(page):
    try:
        page.wait_for_selector('img')
        print("Please solve the CAPTCHA manually and then press Enter.")
        page.pause()
    except:
        print("No CAPTCHA found")
    time.sleep(5)

def sign_in(page, email, password):
    
    page.wait_for_selector('input#ap_email')
    try:
       
        page.fill('input#ap_email', email)
        print("Email entered.")
        
        
        page.click('input#continue')
        # time.sleep(2)
        
        
        page.wait_for_selector('input#ap_password')
        
        
        page.fill('input#ap_password', password)
        print("Password entered.")
        
        
        page.click('input#signInSubmit')
        print("Clicked on Sign-In")
        

        
        time.sleep(5)  
        page.screenshot(path='screenshot.png')

        solve_captcha(page)

        

    except Exception as e:
        print(f"Error: {e}")


def click_on_see_more_reviews(page):
    page.wait_for_selector('a.a-link-emphasis.a-text-bold')
    try:
        review_link = page.locator('a.a-link-emphasis.a-text-bold')
        review_link.nth(0).click()
        print("Clicked on 'See more reviews'")

        # time.sleep(50)
    except Exception as e:
        print(f"Error: {e}")

def fetch_product_data(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)

        # This is to solve captcha in head mode
        solve_captcha(page)

        try:
            title = page.locator('span#productTitle').inner_text() or 'Title not found'
        except:
            title = 'Title not found'

        try:
            price = 'Price not found'
            price_elements = page.locator('span.a-price-whole')
            fraction_elements = page.locator('span.a-price-fraction')
            if price_elements.count() > 0:
                price = price_elements.nth(0).inner_text()
                if fraction_elements.count() > 0:
                    price += fraction_elements.nth(0).inner_text()
        except:
            price = 'Price not found'

        try:
            description = page.locator('#feature-bullets').inner_text() or 'Description not found'
        except:
            description = 'Description not found'

        try:
            image = page.locator('img#landingImage').get_attribute('src') or 'Image not found'
        except:
            image = 'Image not found'

        click_on_see_more_reviews(page)
        email = "9441369805"
        password = "susselA123"
        sign_in(page, email, password)

        browser.close()

        return {
            'title': title.strip(),
            'price': price.strip().replace('\n', ''),
            'description': description.strip(),
            'image': image.strip()
        }

url = "https://www.amazon.com/AmazonBasics-15W-Certified-Wireless-Charging/dp/B0872RLX6Z/"
product = fetch_product_data(url)

try:
    with open("product.json", 'w', encoding='utf-8') as json_file:
        json.dump(product, json_file, ensure_ascii=False, indent=4)
    print(f"Data successfully written to product.json")
except Exception as e:
    print(f"Error writing to file: {e}")
