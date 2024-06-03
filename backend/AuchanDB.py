import pandas as pd
import requests

cookies = {
    'biggy-anonymous': 'TCFuyYKlC8bF2Jlvg1u6Z',
    'vtex_binding_address': 'www.auchan.ro/',
    'checkout.vtex.com': '__ofid=c638876c1d1c48d4a337439b5215dcf2',
    'OptanonAlertBoxClosed': '2024-03-15T13:57:13.654Z',
    '_gcl_au': '1.1.1556653985.1710511034',
    '_ga': 'GA1.1.880401702.1710511034',
    'VtexRCMacIdv7': '655c6aee-9c62-46ee-8f2d-6451e7760df0',
    'cc_mktz_client': '%7B%22is_returning%22%3A0%2C%22uid%22%3A%221005915595884922571%22%2C%22session%22%3A%22sess.2.2683594565.1710696468190%22%2C%22views%22%3A2%2C%22referer_url%22%3A%22%22%2C%22referer_domain%22%3A%22%22%2C%22referer_type%22%3A%22direct%22%2C%22visits%22%3A1%2C%22landing%22%3A%22https%3A//www.auchan.ro/struguri-albi-seedless-500-g/p%22%2C%22enter_at%22%3A%222024-03-17%7C19%3A27%3A48%22%2C%22first_visit%22%3A%222024-03-17%7C19%3A27%3A48%22%2C%22last_visit%22%3A%222024-03-17%7C19%3A27%3A48%22%2C%22last_variation%22%3A%22%22%2C%22utm_source%22%3Afalse%2C%22utm_term%22%3Afalse%2C%22utm_campaign%22%3Afalse%2C%22utm_content%22%3Afalse%2C%22utm_medium%22%3Afalse%2C%22consent%22%3A%22%22%2C%22device_type%22%3A%22desktop%22%2C%22id_website%22%3A%2221014%22%7D',
    'VtexWorkspace': 'master%3A-',
    'biggy-session-auchan': 'zO8vAlgqZPuh65PUmq8bm',
    'vtex_session': 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjlCRDZENDFFNDg0NjZEMzU4M0FEMTEzMjU5QkU3RjZFMkREQTVBM0EiLCJ0eXAiOiJqd3QifQ.eyJhY2NvdW50LmlkIjoiNzRiMThjMmItOTliMS00MzFjLWEwMWYtNjcyNmMyYjhiMDllIiwiaWQiOiIzZDUxNDdmNC01Y2VkLTQ4NDgtODI1NC0xODkzZDY3ZjdjNWYiLCJ2ZXJzaW9uIjo0LCJzdWIiOiJzZXNzaW9uIiwiYWNjb3VudCI6InNlc3Npb24iLCJleHAiOjE3MTU0MzU5MDcsImlhdCI6MTcxNDc0NDcwNywiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6ImZjNGY4ZWYzLTQ0ZjQtNDBmNy1hNjMxLWU5ZDQwNGYzNmQ0YSJ9.0AiiKgclQgY-8AUriESxUa3KRAkeMdD1PzygXTgPI9vWF4lQ3V1NhJ87SvKR1GKy_hYwTcxIQEP0YeIuH7vuWQ',
    'vtex_segment': 'eyJjYW1wYWlnbnMiOm51bGwsImNoYW5uZWwiOiIxIiwicHJpY2VUYWJsZXMiOm51bGwsInJlZ2lvbklkIjoidjIuMTgzOTQzQUJDQzAwNjBCQTBGNDI2Q0ZBM0FENEE1REIiLCJ1dG1fY2FtcGFpZ24iOm51bGwsInV0bV9zb3VyY2UiOm51bGwsInV0bWlfY2FtcGFpZ24iOm51bGwsImN1cnJlbmN5Q29kZSI6IlJPTiIsImN1cnJlbmN5U3ltYm9sIjoibGVpIiwiY291bnRyeUNvZGUiOiJST1UiLCJjdWx0dXJlSW5mbyI6InJvLVJPIiwiY2hhbm5lbFByaXZhY3kiOiJwdWJsaWMifQ',
    'janus_sid': 'b36d3933-321d-4226-add9-32ccd0e2f970',
    'OptanonConsent': 'isGpcEnabled=0&datestamp=Fri+May+03+2024+18%3A52%3A17+GMT%2B0300+(Eastern+European+Summer+Time)&version=202302.1.0&isIABGlobal=false&hosts=&consentId=eecf075e-fe80-4373-9df2-f5ebc83ef944&interactionCount=2&landingPath=NotLandingPage&groups=C0004%3A1%2CC0003%3A1%2CC0002%3A1%2CC0001%3A1%2CC0007%3A1&geolocation=RO%3BB&AwaitingReconsent=false',
    '_ga_P6LMHV0KCW': 'GS1.1.1714753661.49.1.1714754033.60.0.0',
    'biggy-event-queue': 'eyJzZXNzaW9uIjoiek84dkFsZ3FaUHVoNjVQVW1xOGJtIiwiYW5vbnltb3VzIjoiVENGdXlZS2xDOGJGMkpsdmcxdTZaIiwidXJsIjoiaHR0cHM6Ly93d3cuYXVjaGFuLnJvL3Byb21vdGlpL3Byb2ZpdGE/cGFnZT0zIiwiYWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTIzLjAuMC4wIFNhZmFyaS81MzcuMzYgT1BSLzEwOS4wLjAuMCIsInR5cGUiOiJzZXNzaW9uLnBpbmciLCJ3b3Jrc3BhY2UiOiJtYXN0ZXIiLCJhYiI6Ii1tYXN0ZXIifQ==',
}

headers = {
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    # 'cookie': 'biggy-anonymous=TCFuyYKlC8bF2Jlvg1u6Z; vtex_binding_address=www.auchan.ro/; checkout.vtex.com=__ofid=c638876c1d1c48d4a337439b5215dcf2; OptanonAlertBoxClosed=2024-03-15T13:57:13.654Z; _gcl_au=1.1.1556653985.1710511034; _ga=GA1.1.880401702.1710511034; VtexRCMacIdv7=655c6aee-9c62-46ee-8f2d-6451e7760df0; cc_mktz_client=%7B%22is_returning%22%3A0%2C%22uid%22%3A%221005915595884922571%22%2C%22session%22%3A%22sess.2.2683594565.1710696468190%22%2C%22views%22%3A2%2C%22referer_url%22%3A%22%22%2C%22referer_domain%22%3A%22%22%2C%22referer_type%22%3A%22direct%22%2C%22visits%22%3A1%2C%22landing%22%3A%22https%3A//www.auchan.ro/struguri-albi-seedless-500-g/p%22%2C%22enter_at%22%3A%222024-03-17%7C19%3A27%3A48%22%2C%22first_visit%22%3A%222024-03-17%7C19%3A27%3A48%22%2C%22last_visit%22%3A%222024-03-17%7C19%3A27%3A48%22%2C%22last_variation%22%3A%22%22%2C%22utm_source%22%3Afalse%2C%22utm_term%22%3Afalse%2C%22utm_campaign%22%3Afalse%2C%22utm_content%22%3Afalse%2C%22utm_medium%22%3Afalse%2C%22consent%22%3A%22%22%2C%22device_type%22%3A%22desktop%22%2C%22id_website%22%3A%2221014%22%7D; VtexWorkspace=master%3A-; biggy-session-auchan=zO8vAlgqZPuh65PUmq8bm; vtex_session=eyJhbGciOiJFUzI1NiIsImtpZCI6IjlCRDZENDFFNDg0NjZEMzU4M0FEMTEzMjU5QkU3RjZFMkREQTVBM0EiLCJ0eXAiOiJqd3QifQ.eyJhY2NvdW50LmlkIjoiNzRiMThjMmItOTliMS00MzFjLWEwMWYtNjcyNmMyYjhiMDllIiwiaWQiOiIzZDUxNDdmNC01Y2VkLTQ4NDgtODI1NC0xODkzZDY3ZjdjNWYiLCJ2ZXJzaW9uIjo0LCJzdWIiOiJzZXNzaW9uIiwiYWNjb3VudCI6InNlc3Npb24iLCJleHAiOjE3MTU0MzU5MDcsImlhdCI6MTcxNDc0NDcwNywiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6ImZjNGY4ZWYzLTQ0ZjQtNDBmNy1hNjMxLWU5ZDQwNGYzNmQ0YSJ9.0AiiKgclQgY-8AUriESxUa3KRAkeMdD1PzygXTgPI9vWF4lQ3V1NhJ87SvKR1GKy_hYwTcxIQEP0YeIuH7vuWQ; vtex_segment=eyJjYW1wYWlnbnMiOm51bGwsImNoYW5uZWwiOiIxIiwicHJpY2VUYWJsZXMiOm51bGwsInJlZ2lvbklkIjoidjIuMTgzOTQzQUJDQzAwNjBCQTBGNDI2Q0ZBM0FENEE1REIiLCJ1dG1fY2FtcGFpZ24iOm51bGwsInV0bV9zb3VyY2UiOm51bGwsInV0bWlfY2FtcGFpZ24iOm51bGwsImN1cnJlbmN5Q29kZSI6IlJPTiIsImN1cnJlbmN5U3ltYm9sIjoibGVpIiwiY291bnRyeUNvZGUiOiJST1UiLCJjdWx0dXJlSW5mbyI6InJvLVJPIiwiY2hhbm5lbFByaXZhY3kiOiJwdWJsaWMifQ; janus_sid=b36d3933-321d-4226-add9-32ccd0e2f970; OptanonConsent=isGpcEnabled=0&datestamp=Fri+May+03+2024+18%3A52%3A17+GMT%2B0300+(Eastern+European+Summer+Time)&version=202302.1.0&isIABGlobal=false&hosts=&consentId=eecf075e-fe80-4373-9df2-f5ebc83ef944&interactionCount=2&landingPath=NotLandingPage&groups=C0004%3A1%2CC0003%3A1%2CC0002%3A1%2CC0001%3A1%2CC0007%3A1&geolocation=RO%3BB&AwaitingReconsent=false; _ga_P6LMHV0KCW=GS1.1.1714753661.49.1.1714754033.60.0.0; biggy-event-queue=eyJzZXNzaW9uIjoiek84dkFsZ3FaUHVoNjVQVW1xOGJtIiwiYW5vbnltb3VzIjoiVENGdXlZS2xDOGJGMkpsdmcxdTZaIiwidXJsIjoiaHR0cHM6Ly93d3cuYXVjaGFuLnJvL3Byb21vdGlpL3Byb2ZpdGE/cGFnZT0zIiwiYWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTIzLjAuMC4wIFNhZmFyaS81MzcuMzYgT1BSLzEwOS4wLjAuMCIsInR5cGUiOiJzZXNzaW9uLnBpbmciLCJ3b3Jrc3BhY2UiOiJtYXN0ZXIiLCJhYiI6Ii1tYXN0ZXIifQ==',
    'referer': 'https://www.auchan.ro/promotii/profita?page=3',
    'sec-ch-ua': '"Opera";v="109", "Not:A-Brand";v="8", "Chromium";v="123"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
}

params = {
    'page': '3',
    '__pickRuntime': 'appsEtag,blocks,blocksTree,components,contentMap,extensions,messages,page,pages,query,queryData,route,runtimeMeta,settings',
    '__device': 'phone',
}

response = requests.get('https://www.auchan.ro/promotii/profita', params=params, cookies=cookies, headers=headers)


headers = {
    'sec-ch-ua': '"Opera";v="109", "Not:A-Brand";v="8", "Chromium";v="123"',
    'accept': 'application/json',
    'Referer': 'https://www.auchan.ro/promotii/profita?page=3',
    'sec-ch-ua-mobile': '?0',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
    'sec-ch-ua-platform': '"Windows"',
}

params = {
    'page': '3',
    '__pickRuntime': 'appsEtag,blocks,blocksTree,components,contentMap,extensions,messages,page,pages,query,queryData,route,runtimeMeta,settings',
    '__device': 'phone',
}

response = requests.get('https://www.auchan.ro/promotii/profita', params=params, headers=headers)

all_products = []
 
page_number = 0
batch_size = 50

if response.status_code == 200:
    # Extract the JSON data from the response
    json_data = response.json()
    
    # Extract the product information from the JSON data
    
    # Convert the list of products to a DataFrame
    df = pd.DataFrame(json_data)
    
    # Drop any columns with all NaN values
    df.dropna(axis=1, how='all', inplace=True)
    
    # Save the DataFrame to a CSV file
    df.to_csv('auchan_products.csv', index=False)
    
    print("Data saved to auchan_products.csv.")
else:
    print("Error:", response.status_code)