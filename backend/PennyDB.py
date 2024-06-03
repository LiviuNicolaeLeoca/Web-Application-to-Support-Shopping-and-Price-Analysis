import time
import uuid
import requests
import pandas as pd
import datetime

today = datetime.date.today()

days_to_go_back = (today.weekday() - 2) % 7

last_wednesday = today - datetime.timedelta(days=days_to_go_back)

following_tuesday = last_wednesday + datetime.timedelta(days=6)

start_day_str = last_wednesday.strftime("%d")
start_month_str = last_wednesday.strftime("%m")
end_day_str = following_tuesday.strftime("%d")
end_month_str = following_tuesday.strftime("%m")
year_str = following_tuesday.strftime("%Y")

if start_month_str == end_month_str:
    url = f"https://www.penny.ro/api/categories/oferte-site-{start_day_str}{end_day_str}{start_month_str}{year_str}/products"
else:
    url = f"https://www.penny.ro/api/categories/oferte-site-{start_day_str}{start_month_str}{end_day_str}{end_month_str}{year_str}/products"

def generate_cookies():
    cookies = {
        'OptanonAlertBoxClosed': '2024-03-20T21:19:51.058Z',
        'AMCV_65BE20B35350E8DE0A490D45%40AdobeOrg': '179643557%7CMCMID%7C71119528482808951617949066941599424225%7CvVersion%7C5.5.0',
        '_gcl_aw': 'GCL.{}.CjwKCAjwkuqvBhAQEiwA65XxQFbGUfx6RF3qO1CV1MfFY1Sn-8kZogcRFifpbI1Wg05UzBYnliYcwBoCWKkQAvD_BwE'.format(int(time.time())),
        '_gcl_au': '1.1.{}.{}'.format(int(time.time()), int(time.time())),
        'XSRF-TOKEN': str(uuid.uuid4()),
        'OptanonConsent': 'isGpcEnabled=0&datestamp=Mon+Apr+29+2024+02%3A31%3A04+GMT%2B0300+(Eastern+European+Summer+Time)&version=202402.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=c75ee027-cf80-44ab-bd68-767bdd79be71&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0004%3A1&geolocation=%3B&AwaitingReconsent=false',
    }
    return cookies

cookies = {
    'OptanonAlertBoxClosed': '2024-03-20T21:19:51.058Z',
    'AMCV_65BE20B35350E8DE0A490D45%40AdobeOrg': '179643557%7CMCMID%7C71119528482808951617949066941599424225%7CvVersion%7C5.5.0',
    '_gcl_aw': 'GCL.1710969592.CjwKCAjwkuqvBhAQEiwA65XxQFbGUfx6RF3qO1CV1MfFY1Sn-8kZogcRFifpbI1Wg05UzBYnliYcwBoCWKkQAvD_BwE',
    '_gcl_au': '1.1.1075368604.1710969592',
    'OptanonConsent': 'isGpcEnabled=0&datestamp=Mon+Apr+29+2024+02%3A31%3A04+GMT%2B0300+(Eastern+European+Summer+Time)&version=202402.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=c75ee027-cf80-44ab-bd68-767bdd79be71&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0004%3A1&geolocation=%3B&AwaitingReconsent=false',
    'XSRF-TOKEN': '5acb3cd6-bcb2-4fe3-b4cd-2fe47ad813e9',
}

headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'authorization': 'Basic bG9jYWxVc2VyOmxvY2FsUGFzc3dvcmQ=',
    # 'cookie': 'OptanonAlertBoxClosed=2024-03-20T21:19:51.058Z; AMCV_65BE20B35350E8DE0A490D45%40AdobeOrg=179643557%7CMCMID%7C71119528482808951617949066941599424225%7CvVersion%7C5.5.0; _gcl_aw=GCL.1710969592.CjwKCAjwkuqvBhAQEiwA65XxQFbGUfx6RF3qO1CV1MfFY1Sn-8kZogcRFifpbI1Wg05UzBYnliYcwBoCWKkQAvD_BwE; _gcl_au=1.1.1075368604.1710969592; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Apr+29+2024+02%3A31%3A04+GMT%2B0300+(Eastern+European+Summer+Time)&version=202402.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=c75ee027-cf80-44ab-bd68-767bdd79be71&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0004%3A1&geolocation=%3B&AwaitingReconsent=false; XSRF-TOKEN=5acb3cd6-bcb2-4fe3-b4cd-2fe47ad813e9',
    'credentials': 'include',
    'referer': url,
    'sec-ch-ua': '"Opera";v="109", "Not:A-Brand";v="8", "Chromium";v="123"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
    'x-request-id': '10940a5f-d4c7-44b0-b47b-0c73df9f80c6-1714570994288',
    'x-xsrf-token': '5acb3cd6-bcb2-4fe3-b4cd-2fe47ad813e9',
}

params = {
    'page': '0',
    'pageSize': '30',
    'sortBy': 'relevance',
}
print (url)
all_products = []
for page_number in range(0, 20):
    params['page'] = str(page_number)

    response = requests.get(
        f'{url}',
        params=params,
        cookies=generate_cookies(),
        headers=headers,
    )
    
    if response.status_code == 200:
        products_on_page = response.json()['results']
        all_products.extend(products_on_page)
    else:
        print(f"Failed to retrieve data from page {page_number}. Status code: {response.status_code}")

df = pd.DataFrame(all_products)
df.dropna(axis=1, how='all', inplace=True)
df=df.iloc[:,:-9]

df['oldPrice'] = df['price'].apply(lambda x: x.get('crossed') if isinstance(x, dict) else None)
df['discountPercentage'] = df['price'].apply(lambda x: x.get('discountPercentage') if isinstance(x, dict) else None)
df['loyaltyValue'] = df['price'].apply(lambda x: x.get('loyalty').get('value') if isinstance(x, dict) and x.get('loyalty') else None)
df['value'] = df['price'].apply(lambda x: x.get('regular').get('value') if isinstance(x, dict) else None)

df.drop(columns=['descriptionLong','descriptionShort','medical','purchased'],inplace=True)

df['value'] = df['value'].astype(str)
df['oldPrice']=df['oldPrice'].astype(str)
df['loyaltyValue']=df['loyaltyValue'].astype(str)
df['value'] = df['value'].apply(lambda x: x.rstrip('.0') if '.0' in x else x)
df['oldPrice'] = df['oldPrice'].apply(lambda x: x.rstrip('.0') if '.0' in x else x)
df['loyaltyValue']=df['loyaltyValue'].apply(lambda x: x.rstrip('.0') if '.0' in x else x)
df['oldPrice'] = df['oldPrice'].apply(lambda x: x[:-2] + '.' + x[-2:] if x != 'nan' else x)
df['value'] = df['value'].apply(lambda x: x[:-2] + '.' + x[-2:] if x != 'nan' else x)
df['loyaltyValue']=df['loyaltyValue'].apply(lambda x: x[:-2] + '.' + x[-2:] if x != 'nan' else x)

df['oldPrice'] = df['oldPrice'].astype(float)
df['value'] = df['value'].astype(float)
df['loyaltyValue'] = df['loyaltyValue'].astype(float) 

df['oldPrice'] = df['oldPrice'].apply(lambda x: None if pd.isna(x) else x)  
df['value'] = df['value'].apply(lambda x: None if pd.isna(x) else x)
df['loyaltyValue'] = df['loyaltyValue'].apply(lambda x: None if pd.isna(x) else x)
print(df[['value', 'oldPrice', 'loyaltyValue']].head())

df.to_csv("penny_products_db.csv", index=False)
