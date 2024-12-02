import requests
import pandas as pd
from bs4 import BeautifulSoup
from datetime import datetime
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def scrape_amazon_reviews(product_url, len_page=4):
    headers = {
        'authority': 'www.amazon.com',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'en-US,en;q=0.9,bn;q=0.8',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
    }

    def extract_product_info(url):
        pattern_in = r"amazon\.in/([^/]+)/dp/([^/?]+)"
        pattern_com = r"amazon\.com/([^/]+)/dp/([^/?]+)"
        
        if re.search(pattern_in, url):
            pattern = pattern_in
            domain = 'amazon.in'
        else:
            pattern = pattern_com
            domain = 'amazon.com'

        match = re.search(pattern, url)
        if match:
            product_name = match.group(1)
            product_id = match.group(2)
            return product_name, product_id, domain
        else:
            return None, None, None

    def reviews_html(url, len_page):
        soups = []
        for page_no in range(1, len_page + 1):
            params = {
                'ie': 'UTF8',
                'reviewerType': 'all_reviews',
                'filterByStar': 'critical',
                'pageNumber': page_no,
            }
            response = requests.get(url, headers=headers, params=params)
            soup = BeautifulSoup(response.text, 'lxml')
            soups.append(soup)
        return soups

    def get_reviews(html_data, start_index):
        data_dicts = []
        boxes = html_data.select('div[data-hook="review"]')
        for i, box in enumerate(boxes):
            try:
                stars = box.select_one('[data-hook="review-star-rating"]').text.strip().split(' out')[0]
            except:
                stars = 'N/A'

            try:
                description = box.select_one('[data-hook="review-body"]').text.strip()
            except:
                description = 'N/A'

            data_dicts.append({
                'Index': start_index + i + 1,
                'Stars': stars,
                'Description': description
            })

        return data_dicts

    product_name, product_id, domain = extract_product_info(product_url)
    if not product_name or not product_id:
        return "Invalid product URL"

    reviews_url = f'https://{domain}/{product_name}/product-reviews/{product_id}'
    html_datas = reviews_html(reviews_url, len_page)

    all_reviews = []
    start_index = 0
    for html_data in html_datas:
        reviews = get_reviews(html_data, start_index)
        all_reviews.extend(reviews)
        start_index += len(reviews)

    df_reviews = pd.DataFrame(all_reviews)
    return df_reviews

@app.route('/scrape', methods=['GET'])
def scrape():
    product_url = request.args.get('url')
    len_page = request.args.get('len_page', default=4, type=int)

    if not product_url:
        return jsonify({"error": "Product URL is required"}), 400

    try:
        df_reviews = scrape_amazon_reviews(product_url, len_page)
        reviews_json = df_reviews.to_dict(orient='records')
        return jsonify(reviews_json), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)
