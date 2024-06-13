from collections import defaultdict
import csv
import sqlite3
from typing import List, Dict, Any, Tuple, Set
import re
def read_csv(file_path: str, source: str) -> List[Dict[str, Any]]:
    products = []
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                if source == 'mega':
                    manufacturer_name = row['manufacturerName'].strip()
                    manufacturer_sub_brand_name = row['manufacturerSubBrandName'].strip() if row['manufacturerSubBrandName'] else ""
                    name = row['name'].strip()
                    price = float(row['discountedPriceFormatted'].strip())
                    quantity = row['quantity'].strip().lower().replace(" ", "")
                    image_urls = row.get('images', '').strip().split(', ')
                    image_url = image_urls[-2] if len(image_urls) >= 2 else ''
                    if image_url:
                        image_url = image_url.replace("'", "")
                    brand = manufacturer_name + " " + manufacturer_sub_brand_name
                elif source == 'penny':
                    name = row['name'].strip()
                    price = float(row.get('value', '0').strip())
                    quantity = f"{row['amount'].strip().lower()} {row['volumeLabelShort'].strip().lower().replace(' ', '')}"
                    image_data = row.get('images', '').strip()
                    image_urls = image_data.split(', ')
                    image_url = image_urls[0] if image_urls else ''
                    if image_url:
                        image_url = image_url.replace("[", "").replace("'", "")
                    brand = row.get('brand', '').strip()

                if name and quantity:
                    products.append({
                        'name': name,
                        'brand': brand,
                        'price': price,
                        'quantity': quantity,
                        'source': source,
                        'image_url': image_url
                    })
            except (KeyError, ValueError):
                continue
    return products

# Calculating Jaccard Similarity
def jaccard_similarity(str1: str, str2: str) -> float:
    if not str1 or not str2:
        return 0.0

    set1 = set(str1.lower().split())
    set2 = set(str2.lower().split())
    intersection = set1 & set2
    union = set1 | set2
    return len(intersection) / len(union)

# Preprocessing product name for comparison
def preprocess_product_name(product: Dict[str, Any]) -> str:
    brand = (product.get('brand', '') or '').strip()
    name = product['name'].lower()
    if brand:
        name = re.sub(r'\b' + re.escape(brand) + r'\b', '', name).strip()
    return f"{brand} {name}".strip()

def read_sqlite(db_path: str, table_name: str) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name}")
    columns = [description[0] for description in cursor.description]

    rows = cursor.fetchall()
    products = [dict(zip(columns, row)) for row in rows]

    for product in products:
        product['price'] = float(product['price'])

    conn.close()

    source = db_path.split('/')[-1].split('Products')[0].lower()
    for product in products:
        product['source'] = source

    return products

def compare_products_using_jaccard(products_list: List[List[Dict[str, Any]]]) -> Tuple[List[Dict[str, Any]], List[List[Dict[str, Any]]]]:
    unique_products = defaultdict(lambda: {'products': [], 'allPrices': {}, 'image_urls': {}})
    similar_product_groups = []
    matched: Set[Tuple[str, str, str]] = set()

    # Iterate through each list of products
    for i, products1 in enumerate(products_list):
        for product1 in products1:
            product1_name = preprocess_product_name(product1)
            product1_quantity = product1['quantity'].replace(" ", "") if product1['quantity'] else ''
            product1_key = (product1_name, product1_quantity, product1['brand'])

            # Check if product1 has already been matched
            if product1_key not in matched:
                unique_products[product1_key]['products'].append(product1)
                unique_products[product1_key]['allPrices'][product1['source']] = product1['price']
                unique_products[product1_key]['image_urls'][product1['source']] = product1['image_url']
                matched.add(product1_key)

                # Iterate over subsequent products for comparison
                for j in range(i + 1, len(products_list)):
                    for product2 in products_list[j]:
                        product2_name = preprocess_product_name(product2)
                        product2_quantity = product2.get('quantity', '').replace(" ", "") if product2.get('quantity') else ''
                        product2_key = (product2_name, product2_quantity, product2['brand'])

                        # Check if product2 is not already matched and is similar to product1
                        if product2_key not in matched and jaccard_similarity(product1_name, product2_name) > 0.5 and product1_quantity == product2_quantity:
                            unique_products[product1_key]['products'].append(product2)
                            unique_products[product1_key]['allPrices'][product2['source']] = product2['price']
                            unique_products[product1_key]['image_urls'][product2['source']] = product2['image_url']
                            matched.add(product2_key)

                            # Iterate over subsequent products for the third match
                            for k in range(j + 1, len(products_list)):
                                for product3 in products_list[k]:
                                    product3_name = preprocess_product_name(product3)
                                    product3_quantity = product3.get('quantity', '').replace(" ", "") if product3.get('quantity') else ''
                                    product3_key = (product3_name, product3_quantity, product3['brand'])

                                    # Check if product3 is not already matched and is similar to product1 and product2
                                    if product3_key not in matched and jaccard_similarity(product1_name, product3_name) > 0.5 and product1_quantity == product3_quantity:
                                        unique_products[product1_key]['products'].append(product3)
                                        unique_products[product1_key]['allPrices'][product3['source']] = product3['price']
                                        unique_products[product1_key]['image_urls'][product3['source']] = product3['image_url']
                                        matched.add(product3_key)

                                        # Iterate over subsequent products for the fourth match
                                        for l in range(k + 1, len(products_list)):
                                            for product4 in products_list[l]:
                                                product4_name = preprocess_product_name(product4)
                                                product4_quantity = product4.get('quantity', '').replace(" ", "") if product4.get('quantity') else ''
                                                product4_key = (product4_name, product4_quantity, product4['brand'])

                                                # Check if product4 is not already matched and is similar to product1, product2, and product3
                                                if product4_key not in matched and jaccard_similarity(product1_name, product4_name) > 0.5 and product1_quantity == product4_quantity:
                                                    unique_products[product1_key]['products'].append(product4)
                                                    unique_products[product1_key]['allPrices'][product4['source']] = product4['price']
                                                    unique_products[product1_key]['image_urls'][product4['source']] = product4['image_url']
                                                    matched.add(product4_key)

                # Append matched products group to the result if the count meets the minimum requirement
                if len(unique_products[product1_key]['products']) >= 2:
                    similar_product_groups.append(unique_products[product1_key]['products'])

    # Prepare the final list of similar products for output
    similar_products = []
    for product_info in unique_products.values():
        if len(product_info['allPrices']) >= 2:
            best_price_source = min(product_info['allPrices'], key=product_info['allPrices'].get)
            similar_products.append({
                'name': product_info['products'][0]['name'],
                'brand': product_info['products'][0]['brand'],
                'quantity': product_info['products'][0]['quantity'],
                'lowestPrice': product_info['allPrices'][best_price_source],
                'lowestPriceSource': best_price_source,
                'image_urls': product_info['image_urls'],
                'allPrices': product_info['allPrices']
            })

    return similar_products, similar_product_groups

def main():
    csv_file_paths = {
        'mega': 'mega_image_db.csv',
        'penny': 'penny_products_db.csv'
    }
    sqlite_file_paths = [
        './KauflandProducts.db',
        './AuchanProducts.db'
    ]
    table_name = 'products'

    products_list = []

    for source, file_path in csv_file_paths.items():
        products = read_csv(file_path, source)
        products_list.append(products)

    for sqlite_path in sqlite_file_paths:
        products = read_sqlite(sqlite_path, table_name)
        products_list.append(products)

    similar_products, similar_product_pairs = compare_products_using_jaccard(products_list)

    for product in similar_products:
        print(f"Similar Product: {product}")

    print("\nSimilar Product Pairs:")
    for pair in similar_product_pairs:
            print(pair)

if __name__ == "__main__":
    main()