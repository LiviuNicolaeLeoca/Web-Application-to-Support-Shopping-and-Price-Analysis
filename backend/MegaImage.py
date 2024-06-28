import ast
import requests
import pandas as pd

session = requests.Session()

headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'apollographql-client-name': 'ro-mi-web-stores',
    'apollographql-client-version': '6b1cf33e20a033255268e85da95844abf60b3813',
    'content-type': 'application/json',
    # 'cookie': 'deviceSessionId=a640b4f3-320c-44a3-ae91-8c41a3ad710d; groceryCookieLang=ro; CookieConsent=1.1.1.1.1; v_cust=0; _ga=GA1.2.897499823.1710512071; _gcl_au=1.1.1700262878.1710512071; _fbp=fb.1.1711218224645.514704214; s_fid=363895855E963794-368AE566094CC8D7; _gcl_aw=GCL.1713281903.CjwKCAjww_iwBhApEiwAuG6ccA2gYzzYq9hs_Iibcqau5uqp1eMCPYl4U1Z2NB0DT4KRZhbhSzX8dhoCYiwQAvD_BwE; _gcl_dc=GCL.1713281903.CjwKCAjww_iwBhApEiwAuG6ccA2gYzzYq9hs_Iibcqau5uqp1eMCPYl4U1Z2NB0DT4KRZhbhSzX8dhoCYiwQAvD_BwE; _gac_UA-171396166-3=1.1713281903.CjwKCAjww_iwBhApEiwAuG6ccA2gYzzYq9hs_Iibcqau5uqp1eMCPYl4U1Z2NB0DT4KRZhbhSzX8dhoCYiwQAvD_BwE; _gac_UA-171396166-1=1.1713281903.CjwKCAjww_iwBhApEiwAuG6ccA2gYzzYq9hs_Iibcqau5uqp1eMCPYl4U1Z2NB0DT4KRZhbhSzX8dhoCYiwQAvD_BwE; at_check=true; s_pls=; liquidFeeThreshold=0; urgentMessage=a4c922e5-a520-42ed-ba61-3bbd2e4d8cc4; s_cc=true; dtCookie=v_4_srv_2_sn_4A26161B6F9D63CD8F2B372D6682562C_perc_100000_ol_0_mul_1_app-3A68b1205207fce6ad_0_app-3Aea7c4b59f27d43eb_1; mktz_client=%7B%22is_returning%22%3A1%2C%22uid%22%3A%221894788486250117471%22%2C%22session%22%3A%22sess.2.3091090045.1714619601447%22%2C%22views%22%3A1%2C%22referer_url%22%3A%22%22%2C%22referer_domain%22%3A%22%22%2C%22referer_type%22%3A%22direct%22%2C%22visits%22%3A4%2C%22landing%22%3A%22https%3A//www.mega-image.ro/search/promotii%3Fq%3Dpromotions%253Arelevance%253ArootCategoryNameFacet%253AApa%252Bsi%252Bsucuri%253ArootCategoryNameFacet%253ABauturi%253ArootCategoryNameFacet%253ADulciuri%252Bsi%252Bsnacks%253ArootCategoryNameFacet%253AFructe%252Bsi%252Blegume%252Bproaspete%253ArootCategoryNameFacet%253ALactate%252Bsi%252Boua%253ArootCategoryNameFacet%253AMezeluri%25252C%252Bcarne%252Bsi%252Bready%252Bmeal%253ArootCategoryNameFacet%253APaine%25252C%252Bcafea%25252C%252Bcereale%252Bsi%252Bmic%252Bdejun%253ArootCategoryNameFacet%253AProduse%252Bcongelate%253ArootCategoryNameFacet%253AIngrediente%252Bculinare%26utm_campaign%3DToate%2520promotiile%26utm_medium%3Dlabel%2520banner%26utm_source%3Dpromotii%2520mega-image%22%2C%22enter_at%22%3A%222024-05-2%7C6%3A13%3A21%22%2C%22first_visit%22%3A%222024-04-10%7C10%3A11%3A10%22%2C%22last_visit%22%3A%222024-05-1%7C1%3A23%3A45%22%2C%22last_variation%22%3A%22%22%2C%22utm_source%22%3A%22promotii%2520mega-image%22%2C%22utm_term%22%3Afalse%2C%22utm_campaign%22%3A%22Toate%2520promotiile%22%2C%22utm_content%22%3Afalse%2C%22utm_medium%22%3A%22label%2520banner%22%2C%22consent%22%3A%22%22%2C%22device_type%22%3A%22desktop%22%2C%22id_website%22%3A%2224091%22%7D; AMCV_2A6E210654E74B040A4C98A7%40AdobeOrg=179643557%7CMCIDTS%7C19858%7CMCMID%7C89023298112728141209048773896969594237%7CMCAID%7CNONE%7CvVersion%7C5.5.0; _gid=GA1.2.1266502750.1715721719; grocery-ccatc=m2lTNimmkxenPXk4CUwFMvoPlYs; ak_bmsc=623185679834A3E8364C9231F09080BA~000000000000000000000000000000~YAAQDVJzaD+xM2qPAQAA78V5fRdt1Ufv95pjM+p3SY3FzCnORE5UJZ2HnbFy2sIY8PWnFjHif7qkcVWKC4jgFvtLTPT7TNRLSaJBp25voZwn0+sxz4JEzkSBadi+RUcreP7kWe/zei7F9Fc75NToXhUJiP/SY/jEV609Inra4QeanPFP48l43da29WUAuih1zrYNX6Sybvpr2K2pS5dC2iYHo4wyrxCMd2d+jY1I7VAlSYpmI7r7P0HkKPIZEe54ZjEYQavBhdPw+7Nlk/4CrzReg8kl4KNBbxL8i7SeivKqGwwZCjr80H1IpeyWE7SvXItf3DfwxtWX1LV+pnZy4EdnJ/vVlpy57wrmuGsz5t9xwChFAEB4taFh6G9FRXYtk3/IZLR5hv/rKVt4kg==; _abck=2D0F4A938144028A97AF910DF105198F~0~YAAQDVJzaJaxM2qPAQAAu8l5fQvxSLSHQnFa2b2iGRWEGXOSD4q6AwFXvSnQnggCz/40YTJyP+zjgoVnnV9Eubusiom6CJ3CmD01zhDhy8STN/7iDnkQNeFpsiiQoDF3Rp+kz+sX7ylb+X9S4Oe2BFFbbm3WeONoU0Zzx954a0xKpdZFRQ1sS/ynlp3qKye9z8nM5azEdAy0cRPTr+UmsAR/Bj56X2v4wrWwPjyP7huGlZsVWHUFkeS1doLoW7VCL8uRnWNVwq7Z8nHjqLNsaqH6mM9KantLeIb9R10sMqzxlgN9GHkPTkni0vnu/8AjhMK+8CNXJRt4gp5uHaHMa/Kel2O3ly25pLC7k91GC6W2JeMtNKhqmXd40npIoUjeL+OpPFIxQi8EgT2HcDj2mTLTax4/fy6C91stfQKrBnL//2zETghoW9F7SKVlPakiVE4g~-1~-1~1715800684; AWSALB=5IFFODfX87lzoDbKqA5g3lFIjT6wCABuiRmpukLBLRWiv+yc7+IYSPk66nGcJAOedgPVQ03JvqiSlh8l0CYYXlyn/UJcX07365D9Z08ZXpUGQ877A/+6JUQTtINl; AWSALBCORS=5IFFODfX87lzoDbKqA5g3lFIjT6wCABuiRmpukLBLRWiv+yc7+IYSPk66nGcJAOedgPVQ03JvqiSlh8l0CYYXlyn/UJcX07365D9Z08ZXpUGQ877A/+6JUQTtINl; bm_sv=64590E407DAD1BBCCD63FCD73BB5C436~YAAQjmATAvZGxVqPAQAAZ5KVfRfA+ED7vFDohL366Gys5m34cGG/ZinbqjfXGyHWIweaHw1EwTbeHRyH0lOrPy+eQEjr1IvzClaRBqnNcwxz0bXyIYvjR1J+TT58UuYEihubeflWeGMeeqWPCTh+9WwKZVm7A07yHtWspa2bCSqy9DG9GWd2GjKTagJ9iGkhq/REC6iQNy+2T8AG/KPzqpK2pgvOQAND/+Z8E8XpD+PiaLSHUBhgGgdAHh54vZAZ9qx11Q==~1; bm_sz=82597BABE86687720CEF8A0CE6779017~YAAQjmATAvdGxVqPAQAAZ5KVfRc/3xTHf+uyuArnL/ROTHDOcb2F1mu5Rx63ejZw7GEz4GtOUp2/wtV9ZgsY2EUpLyWvNIXBRE0KgmR4+f+EnSteFHaZGAerLFOn6uPMP99W2CwnUmd54uzicKRHc8Z9SuY84EgyGbqnz1K2EMshvkOjxoOgUvpSHpS8/xpxwugSWjqhHWl51ssn+RPY6aJE6xkvrZyv0meL+Ck+zUKw3abyvcCNMDZjjMsNC3RhtSU2hr763tTN/ullj190Pxcny5GWhpf3OPQRddA1C1Z8mPEmmxNpPA0f3TE/JRQGEusYJEHiUGDvH7la25fCPTe+otHMh2hrN4qr0Y35cauFMmJMLYMutWG+bgD3TSznO9f3WRu4G018gVXgyNDNehMDq/A1IW+XwMt6m8GjnvAcyA41+hLnrpR97Vn1ktWpA+VlWQk+Pg==~3422007~3159622; mbox=PC#ff640872c8584855adcbf33d6eb9ab0c.37_0#1779043581|session#6ea35dc4f469404281b93f3b090fb7da#1715800767',
    'origin': 'https://www.mega-image.ro',
    'referer': 'https://www.mega-image.ro/search/promotii?q=promotions',
    'sec-ch-ua': '"Opera";v="109", "Not:A-Brand";v="8", "Chromium";v="123"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0',
    'x-apollo-operation-id': '165b8e6142299a8a626d2bdd850f956ee40e6be45bb9ecaacd0740558d322df4',
    'x-apollo-operation-name': 'QlProductList',
    'x-default-gql-refresh-token-disabled': 'true',
    'x-dtpc': '2$398905861_787h2vREUGARCLKRGTKQIORWUDVUQFUUCHIOKF-0e0',
}

json_data = {
    'operationName': 'QlProductList',
    'variables': {
        'productListingType': 'PROMOTION_SEARCH',
        'lang': 'ro',
        'productCodes': '4522,23896,14177,14203,86141,21644,65515,38139,71254,86527,40039,42336,9357,90147,29100,76437,24641,19773,51592,20079,69775,75604,3040,62950,3636,21819,52308,62968,3252,3691,62952,52191,33943,63173,62963,63149,63174,63247,3909,62951,75118,52200,66893,28815,93896,73478,61688,73034,62866,76392,62932,95198,3635,28827,62954,52207,62965,30046,70730,28665,21825,76145,46234,97697,1059,35354,52196,8387,75225,73628,56018,75511,62942,3841,62937,46995,89781,3705,25028,30082,52765,28828,82965,66024,3834,98206,6377,33566,16713,66116,98179,33853,3615,74103,75029,96213,65029,865,75171,75614,70545,3672,97030,55852,97447,65924,62992,44330,24227,4609,39202,74233,98966,72386,75610,21420,57451,11757,3674,44276,76446,74232,52205,64760,5598,38238,93831,98171,3236,3509,44314,27869,21438,91382,3256,75234,24235,48223,52180,73833,2939,44143,75939,85428,70602,28129,37692,46993,10375,52193,44129,52369,70892,3671,52766,2802,93829,72924,9340,70376,9489,51823,52194,54096,27284,26195,52507,98274,43618,95301,76443,34228,6813,52181,61516,21941,51828,39614,52771,52989,54100,62113,2474,10382,57967,52772,75181,70561,38395,57342,62683,2475,54979,21929,82079,62940,74548,75233,77242,37685,61587,52186,89328,13341,3680,13154,26971,31577,52132,49784,28816,3407,6729,76307,65925,30040,56729,94085,57456,95325,67521,8791,9655,6376,98421,68996,20823,57448,61686,70863,48855,68999,92366,3758,51261,54993,37534,61517,2456,37687,82648,52208,21960,66198,18220,54552,37532,45440,36066,61805,94617,68712,70562,3406,75603,61585,87350,37345,94033,18261,76852,54994,70377,68992,4606,70891,52234,25059,8415,51822,64686,54997,52175,39175,25896,3204,73988,61632,3677,10453,77239,21507,54553,52343,75235,45259,21661,15659,72056,74236,70858,55120,52769,68988,52575,36756,74417,55121,29286,48720,52523,5469,25053,76858,20717,69720,74480,68997,49332,75110,62037,44423,52341,93780,94084,68990,77241,52209,94137,44400,66895,6452,37754,6796,16322,94614,72888,52776,52212,67522,21469,92364,12741,61693,61631,49095,73814,5596,52344,28831,55122,61589,10463,54197,57951,44361,13669,30245,56017,57095,46992,6761,52770,54195,77243,56727,76853,92978,12514,53425,68987,92042,44296,53162,29905,75031,72040,98276,51265,73636,9012,42047,51246,90851,37535,52768,54102,75940,21150,52779,34156,75942,3234,90862,62802,53448,49137,21424,19474,99820,28130,24224,51271,44293,97003,62480,65821,74241,72041,51270,99800,6374,94616,61689,63005,53439,53447,14407,19419,59341,37684,98326,19719,30071,42924,52350,70860,20822,76194,31607,90375,99814,92976,62686,71773,72925,14411,15096,99801,92369,6200,32037,58893,52125,3315,13672,72641,57968,8404,52780,9487,92361,92372,30829,13343,50646,96674,49336,94035,13260,66511,67525,46236,97043,18359,34944,45172,57969,57975,57977,10460,72927,49103,51268,57452,94031,24232,99816,99819,99818,16319,20820,54206,94835,53449,80518,8403,52134,66204,15658,67311,51467,22329,24980,30300,75024,8919,24240,59345,21505,72004,94621,92508,99212,25895,94837,46994,51289,75830,98282,58899,72911,99826,46237,3220,74235,57974,98329,93838,53077,44297,99808,99832,99803,3164,3330,96777,31567,16198,99799,99829,99813,21757,72645,75026,27867,99809,99793,99794,99796,99802,99798,99830,99817,99804,74255,63717,63884,63355,52688,99795,99815,36771,58906,74251,74422,99797,22433,96026,44315,47080,52757,95199,44161,36755,62929,43627,89779,93836,44151,52217,99811,99825,62927,50650,75028,25138,25143,58125,58126,20821,52755,63551,63552,63553,63592,75042,75247,76103,77244,77245,77246,77247,77248,81401,81410,81416,81420,64690,3581,17685,46185,52197,61984,61998,45752,63859,63885,52668,63929,63606,63607,67334,67252,67338,67780,67774,67786,67795,67904,67905,67900,67819,67788,67779,67906,67909,67897,68348,68573,68574,68474,68639,62040,53309,62041,99812,99792,99805,99807,99806,46222,3302',
        'categoryCode': '',
        'excludedProductCodes': '',
        'brands': '',
        'keywords': '',
        'productTypes': '',
        'numberOfItemsToDisplay': 40,
        'lazyLoadCount': 10,
        'pageNumber': 0,
        'sort': '',
        'searchQuery': 'promotions',
        'hideUnavailableProducts': True,
        'maxItemsToDisplay': 0,
    },
    'query': 'query QlProductList($productListingType: String!, $productListingCode: String, $lang: String, $sort: String, $searchQuery: String, $productCodes: String, $categoryCode: String, $excludedProductCodes: String, $brands: String, $keywords: String, $productTypes: String, $numberOfItemsToDisplay: Int, $lazyLoadCount: Int, $pageNumber: Int, $offerId: String, $hideUnavailableProducts: Boolean, $maxItemsToDisplay: Int, $currentCountProducts: Int) {\n  qlProductList(\n    productListingType: $productListingType\n    productListingCode: $productListingCode\n    lang: $lang\n    sort: $sort\n    searchQuery: $searchQuery\n    productCodes: $productCodes\n    categoryCode: $categoryCode\n    excludedProductCodes: $excludedProductCodes\n    brands: $brands\n    keywords: $keywords\n    productTypes: $productTypes\n    numberOfItemsToDisplay: $numberOfItemsToDisplay\n    lazyLoadCount: $lazyLoadCount\n    pageNumber: $pageNumber\n    offerId: $offerId\n    hideUnavailableProducts: $hideUnavailableProducts\n    maxItemsToDisplay: $maxItemsToDisplay\n    currentCountProducts: $currentCountProducts\n  ) {\n    products {\n      ...ProductBlockDetails\n      __typename\n    }\n    breadcrumbs {\n      facetCode\n      facetName\n      facetValueName\n      facetValueCode\n      removeQuery {\n        query {\n          value\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    facets {\n      code\n      name\n      category\n      facetUiType\n      values {\n        code\n        count\n        name\n        query {\n          query {\n            value\n            __typename\n          }\n          __typename\n        }\n        selected\n        __typename\n      }\n      __typename\n    }\n    sorts {\n      name\n      selected\n      code\n      __typename\n    }\n    pagination {\n      currentPage\n      totalResults\n      totalPages\n      sort\n      __typename\n    }\n    freeTextSearch\n    currentQuery {\n      query {\n        value\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ProductBlockDetails on Product {\n  available\n  averageRating\n  numberOfReviews\n  manufacturerName\n  manufacturerSubBrandName\n  code\n  badges {\n    ...ProductBadge\n    __typename\n  }\n  badgeBrand {\n    ...ProductBadge\n    __typename\n  }\n  promoBadges {\n    ...ProductBadge\n    __typename\n  }\n  delivered\n  littleLion\n  freshnessDuration\n  freshnessDurationTipFormatted\n  frozen\n  recyclable\n  images {\n    format\n    imageType\n    url\n    __typename\n  }\n  isBundle\n  isProductWithOnlineExclusivePromo\n  maxOrderQuantity\n  limitedAssortment\n  mobileFees {\n    ...MobileFee\n    __typename\n  }\n  name\n  newProduct\n  onlineExclusive\n  potentialPromotions {\n    isMassFlashOffer\n    endDate\n    alternativePromotionMessage\n    alternativePromotionBadge\n    code\n    priceToBurn\n    promotionType\n    pickAndMix\n    qualifyingCount\n    freeCount\n    range\n    redemptionLevel\n    toDisplay\n    description\n    title\n    promoBooster\n    simplePromotionMessage\n    offerType\n    restrictionType\n    priority\n    percentageDiscount\n    __typename\n  }\n  price {\n    approximatePriceSymbol\n    currencySymbol\n    formattedValue\n    priceType\n    supplementaryPriceLabel1\n    supplementaryPriceLabel2\n    showStrikethroughPrice\n    discountedPriceFormatted\n    discountedUnitPriceFormatted\n    unit\n    unitPriceFormatted\n    unitCode\n    unitPrice\n    value\n    __typename\n  }\n  purchasable\n  productPackagingQuantity\n  productProposedPackaging\n  productProposedPackaging2\n  stock {\n    inStock\n    inStockBeforeMaxAdvanceOrderingDate\n    partiallyInStock\n    availableFromDate\n    __typename\n  }\n  url\n  previouslyBought\n  nutriScoreLetter\n  isLowPriceGuarantee\n  isHouseholdBasket\n  isPermanentPriceReduction\n  freeGift\n  plasticFee\n  __typename\n}\n\nfragment ProductBadge on ProductBadge {\n  code\n  image {\n    ...Image\n    __typename\n  }\n  tooltipMessage\n  name\n  __typename\n}\n\nfragment Image on Image {\n  altText\n  format\n  galleryIndex\n  imageType\n  url\n  __typename\n}\n\nfragment MobileFee on MobileFee {\n  feeName\n  feeValue\n  __typename\n}',
}

response = session.get('https://www.mega-image.ro/search/promotii?q=promotions%3Arelevance', headers=headers)

all_products = []
 
page_number = 0
batch_size = 50

while True:
    json_data['variables']['pageNumber'] = page_number
    
    response = requests.post('https://www.mega-image.ro/api/v1/', cookies=response.cookies, headers=headers, json=json_data)

    if response.status_code == 200:
        json_response = response.json()
        
        products = json_response.get('data', {}).get('qlProductList', {}).get('products', [])
        
        if products:
            all_products.extend(products)
            
            page_number += 1
        else:
            break
    else:
        print("Error:", response.status_code)
        break

df = pd.DataFrame(all_products)
df.dropna(axis=1, how='all', inplace=True)
df.drop(columns=['averageRating', '__typename', 'recyclable','productProposedPackaging','maxOrderQuantity','isBundle','limitedAssortment','stock','isLowPriceGuarantee'], inplace=True)
df.to_csv("mega_image_db.csv", index=False)

df = pd.read_csv('./backend/mega_image_db.csv')

df['price'] = df['price'].fillna('{}').apply(ast.literal_eval)


df['formattedValue'] = [price_info.get('formattedValue', '') for price_info in df['price']]
df['discountedPriceFormatted'] = [price_info.get('discountedPriceFormatted', '') for price_info in df['price']]

df['formattedValue'] = df['formattedValue'].str.replace(' Lei', '').str.replace(',', '.').astype(float)
df['discountedPriceFormatted'] = df['discountedPriceFormatted'].str.replace(' Lei', '').str.replace(',', '.').astype(float)

df.drop('price', axis=1, inplace=True)

df['mobileFees'] = df['mobileFees'].fillna('[]').apply(ast.literal_eval)

df['feeValue'] = [mobile_fee_info[0].get('feeValue', None) if mobile_fee_info else None for mobile_fee_info in df['mobileFees']]

df.drop('mobileFees', axis=1, inplace=True)

df['potentialPromotions'] = df['potentialPromotions'].apply(ast.literal_eval)

df['potentialPromotion'] = [' '.join([promo.get('title', '') for promo in promotions if isinstance(promo, dict)]) for promotions in df['potentialPromotions']]
df['potentialPromotionEndDate'] = [' '.join([promo.get('endDate', '') for promo in promotions if isinstance(promo, dict)]) for promotions in df['potentialPromotions']]

df.drop('potentialPromotions', axis=1, inplace=True)

def safe_literal_eval(x):
    try:
        return ast.literal_eval(x)
    except (SyntaxError, ValueError):
        return {}

df['images'] = df['images'].fillna('').apply(safe_literal_eval)

base_url = 'https://static.mega-image.ro'
df['images'] = [[base_url + img['url'] for img in images] for images in df['images']]

df['quantity'] = df['name'].str.extract(r'(\d+(\.\d+)?\s*(x\s*\d+(\.\d+)?)?\s*(g|kg|l|L|ml|plicuri|bucati|capsule|buc)\b)').iloc[:, 0]

df['name'] = df['name'].replace(r'(\d+(\.\d+)?\s*(x\s*\d+(\.\d+)?)?\s*(g|kg|l|L|ml|plicuri|bucati|capsule|buc)\b)', '', regex=True)

print(df.head())

df.to_csv("./backend/mega_image_db.csv", index=False)