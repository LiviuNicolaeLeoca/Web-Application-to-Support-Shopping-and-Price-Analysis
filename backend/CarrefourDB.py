import math
import time
import pandas as pd
import json
from concurrent.futures import ThreadPoolExecutor
import requests

cookies = {
    '_pfbuid': 'b3e766c3-6507-3ca8-b265-b1b46cbfa319',
    'PHPSESSID_THE_0NE': '02de13ff999fa4a336616a6ac9941e81',
    'form_key': 'xCk7abMYgBXqEmHg',
    'mage-messages': '',
    'OptanonAlertBoxClosed': '2024-03-11T16:26:34.314Z',
    'eupubconsent-v2': 'CP7V-cvP7V-cvAcABBENDgCgAAAAAAAAAChQAAAAAAAA.YAAAAAAAAAAA',
    'mage-cache-storage': '%7B%7D',
    'mage-cache-storage-section-invalidation': '%7B%7D',
    'mage-cache-sessid': 'true',
    'recently_viewed_product': '%7B%7D',
    'recently_viewed_product_previous': '%7B%7D',
    'recently_compared_product': '%7B%7D',
    'recently_compared_product_previous': '%7B%7D',
    'product_data_storage': '%7B%7D',
    'pcdi': '1',
    'closed-popups': '["296"]',
    'currentreviewpage': '1',
    'cf_clearance': 'Gt_GU8IQMVFvIjVVLw.XV.ZI3Fa_84bTuZaDtm_Bpm0-1714400992-1.0.1.1-5eeKP6CBoMunUmOqUWonTki5BIjZFjNLjYlceWVsMkgszFTTIADaKagsi06Z9MIfukSUhDQ8zI8f9ExGUDKvfA',
    '__cf_bm': 'opXbCYzmPGWS03TRBcnYCQJfUbGRPeM7VHQKEXV5Lzo-1714402304-1.0.1.1-DvKqRRc9z6ZUEkx8MzmIdMOPIOKKJg6dofbKNFdcDXlmsgu0yN2Q0qV.d5b1kLW4kvahbMiMARaCx0IAhsU4oQ',
    'OptanonConsent': 'isIABGlobal=false&datestamp=Mon+Apr+29+2024+17%3A52%3A09+GMT%2B0300+(Eastern+European+Summer+Time)&version=6.12.0&hosts=&consentId=30162bb7-a7d6-497a-9536-c2299313a8da&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0033%3A0%2CC0039%3A0%2CC0023%3A0%2CC0056%3A0%2CC0004%3A0%2CC0052%3A0%2CC0051%3A0%2CC0007%3A0%2CSTACK1%3A0%2CSTACK42%3A0&geolocation=RO%3BB&AwaitingReconsent=false',
    'private_content_version': '7f303f034ec54b52c969f4e68f963244',
    'section_data_ids': '%7B%22ga_customer_section%22%3A1714402331%2C%22customer%22%3A1714402330%7D',
}

headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-US,en;q=0.9',
    # 'content-length': '0',
    # 'cookie': '_pfbuid=b3e766c3-6507-3ca8-b265-b1b46cbfa319; PHPSESSID_THE_0NE=02de13ff999fa4a336616a6ac9941e81; form_key=xCk7abMYgBXqEmHg; mage-messages=; OptanonAlertBoxClosed=2024-03-11T16:26:34.314Z; eupubconsent-v2=CP7V-cvP7V-cvAcABBENDgCgAAAAAAAAAChQAAAAAAAA.YAAAAAAAAAAA; mage-cache-storage=%7B%7D; mage-cache-storage-section-invalidation=%7B%7D; mage-cache-sessid=true; recently_viewed_product=%7B%7D; recently_viewed_product_previous=%7B%7D; recently_compared_product=%7B%7D; recently_compared_product_previous=%7B%7D; product_data_storage=%7B%7D; pcdi=1; closed-popups=["296"]; currentreviewpage=1; cf_clearance=Gt_GU8IQMVFvIjVVLw.XV.ZI3Fa_84bTuZaDtm_Bpm0-1714400992-1.0.1.1-5eeKP6CBoMunUmOqUWonTki5BIjZFjNLjYlceWVsMkgszFTTIADaKagsi06Z9MIfukSUhDQ8zI8f9ExGUDKvfA; __cf_bm=opXbCYzmPGWS03TRBcnYCQJfUbGRPeM7VHQKEXV5Lzo-1714402304-1.0.1.1-DvKqRRc9z6ZUEkx8MzmIdMOPIOKKJg6dofbKNFdcDXlmsgu0yN2Q0qV.d5b1kLW4kvahbMiMARaCx0IAhsU4oQ; OptanonConsent=isIABGlobal=false&datestamp=Mon+Apr+29+2024+17%3A52%3A09+GMT%2B0300+(Eastern+European+Summer+Time)&version=6.12.0&hosts=&consentId=30162bb7-a7d6-497a-9536-c2299313a8da&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0033%3A0%2CC0039%3A0%2CC0023%3A0%2CC0056%3A0%2CC0004%3A0%2CC0052%3A0%2CC0051%3A0%2CC0007%3A0%2CSTACK1%3A0%2CSTACK42%3A0&geolocation=RO%3BB&AwaitingReconsent=false; private_content_version=7f303f034ec54b52c969f4e68f963244; section_data_ids=%7B%22ga_customer_section%22%3A1714402331%2C%22customer%22%3A1714402330%7D',
    'origin': 'https://carrefour.ro',
    'referer': 'https://carrefour.ro/bacanie-carrefour?p=2&product_list_dir=desc&product_list_limit=48&product_list_order=discount_percentage',
    'sec-ch-ua': '"Opera";v="109", "Not:A-Brand";v="8", "Chromium";v="123"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
    'x-requested-with': 'XMLHttpRequest',
}

params = {
    'p': '0',
    'product_list_dir': 'desc',
    'product_list_limit': '48',
    'product_list_order': 'discount_percentage',
}

response = requests.post('https://carrefour.ro/catalog/category/ajax/id/10669/', params=params, cookies=cookies, headers=headers)


def fetch_page_data(page_number):
    retries = 5
    base_delay = 2
    max_delay = 32
    
    for attempt in range(retries):
        try:
            params['p'] = str(page_number)
            response = requests.post('https://carrefour.ro/catalog/category/ajax/id/10669/', params=params, cookies=cookies, headers=headers)
            if response.status_code == 200:
                product_list_str = json.loads(response.text)['product_list_obj']['push']
                product_list_obj = json.loads(product_list_str)
                impressions = product_list_obj['ecommerce']['impressions']
                return impressions
            else:
                print(f"Failed to retrieve data from page {page_number}. Status code: {response.status_code}")
                return []
        except Exception as e:
            print(f"Failed to process data from page {page_number} at attempt {attempt+1}: {str(e)}")
            delay = min(base_delay * math.pow(2, attempt), max_delay)
            print(f"Retrying in {delay} seconds...")
            time.sleep(delay)
    
    return []

all_products = []

max_threads = 50

with ThreadPoolExecutor(max_workers = max_threads) as executor:
    futures = [executor.submit(fetch_page_data, page_number) for page_number in range(0, 160)]
    
    for future in futures:
        all_products.extend(future.result())

df = pd.DataFrame(all_products)
df.drop_duplicates(subset=['name', 'brand'],inplace=True)
df.to_csv("carrefour_products_db.csv", index=False)