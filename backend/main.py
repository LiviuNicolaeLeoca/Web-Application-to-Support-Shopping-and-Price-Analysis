from collections import defaultdict
import csv
import json
import sqlite3
from typing import List, Dict, Any, Tuple, Set
import re

def read_csv(file_path: str, source: str) -> List[Dict[str, Any]]:
    products = []
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for i, row in enumerate(reader):
            try:
                name, brand, price, oldPrice, discount, quantity, image_url = '', '', 0.0, 0.0, '', '', ''
                
                if source == 'mega':
                    brand = row.get('manufacturerName', '').strip()
                    manufacturer_sub_brand_name = row.get('manufacturerSubBrandName', '').strip()
                    name = row.get('name', '').strip()
                    name = f"{name} {manufacturer_sub_brand_name}".strip()
                    price = float(row.get('discountedPriceFormatted', '0').strip() or '0')
                    oldPrice = float(row.get('formattedValue', '0').strip() or '0')
                    discount = row.get('potentialPromotion', '').strip()
                    quantity = row.get('quantity', '').strip().lower().replace(" ", "")
                    image_urls = row.get('images', '').strip().split(', ')
                    image_url = image_urls[-2] if len(image_urls) >= 2 else ''
                    image_url = image_url.replace("'", "")
                
                elif source == 'penny':
                    name = row.get('name', '').strip().replace('"', "'")
                    price = float(row.get('value', '0').strip() or '0')
                    oldPrice = float(row.get('oldPrice', '0').strip() or '0')
                    discount = row.get('discountPercentage', '').strip()
                    amount = row.get('amount', '').strip().lower()
                    volume_label = row.get('volumeLabelShort', '').strip().lower().replace(' ', '')
                    quantity = f"{amount} {volume_label}".strip()
                    image_data = row.get('images', '').strip()
                    image_urls = image_data.split(', ') if image_data else []
                    image_url = image_urls[0] if image_urls else ''
                    image_url = image_url.replace("[", "").replace("]", "").replace("'", "")
                
                if name and price > 0:
                    products.append({
                        'name': name,
                        'brand': brand,
                        'price': price,
                        'oldPrice': oldPrice,
                        'discount': discount,
                        'quantity': quantity,
                        'source': source,
                        'image_url': image_url
                    })
            except (KeyError, ValueError) as e:
                print(f"Error processing row {i + 1}: {e} - {row}")
                continue    
    return products

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

def create_tables(conn: sqlite3.Connection, sources: List[str]):
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS similar_products')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS similar_products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            brand TEXT,
            quantity TEXT,
            lowestPrice REAL,
            lowestPriceSource TEXT,
            image_urls TEXT,
            all_Prices TEXT
        )
    ''')
    for source in sources:
        cursor.execute(f'DROP TABLE IF EXISTS {source}_products')
        cursor.execute(f'''
           CREATE TABLE IF NOT EXISTS {source}_products (
                id INTEGER PRIMARY KEY,
                similar_product_id INTEGER,
                name TEXT,
                brand TEXT,
                quantity TEXT,
                price REAL,
                oldPrice REAL,
                discount TEXT,
                image_url TEXT,
                FOREIGN KEY (similar_product_id) REFERENCES similar_products(id)
                )
        ''')
        cursor.execute(f'DROP TABLE IF EXISTS all_{source}_products')
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS all_{source}_products (
                id INTEGER PRIMARY KEY,
                name TEXT,
                brand TEXT,
                quantity TEXT,
                price REAL,
                oldPrice REAL,
                discount TEXT,
                source TEXT,
                image_url TEXT
            )
        ''')
    
    conn.commit()

def insert_similar_products(conn: sqlite3.Connection, similar_products: List[Dict[str, Any]], source_specific_ids: Dict[str, List[int]]):
    cursor = conn.cursor()
    for product in similar_products:
        cursor.execute('''
            INSERT INTO similar_products (name, brand, quantity, lowestPrice, lowestPriceSource, image_urls, all_Prices)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            product['name'],
            product['brand'],
            product['quantity'],
            product['lowestPrice'],
            product['lowestPriceSource'],
            json.dumps(product['image_urls']),
            json.dumps(product['allPrices'])
        ))
        similar_product_id = cursor.lastrowid

        for source, ids in source_specific_ids.items():
            if source in product['allPrices']:
                for id_ in ids:
                    cursor.execute(f'SELECT similar_product_id, name, brand, image_url FROM {source}_products WHERE id = ?', (id_,))
                    result = cursor.fetchone()

                    if result:
                        source_product_image_url = result[3]

                        if source in product['image_urls'] and product['image_urls'][source] == source_product_image_url:
                            cursor.execute(f'''
                                UPDATE {source}_products
                                SET similar_product_id = ?
                                WHERE id = ? 
                            ''', (similar_product_id, id_))

    conn.commit()

def insert_source_specific_products(conn: sqlite3.Connection, products: List[Dict[str, Any]], source: str) -> List[int]:
    cursor = conn.cursor()
    inserted_ids = []

    for product in products:
        cursor.execute(f'''
            INSERT INTO {source}_products (name, brand, quantity, price, oldPrice, discount, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            product['name'],
            product['brand'],
            product['quantity'],
            product['price'],
            product['oldPrice'],
            product['discount'],
            product['image_url']
        ))
        inserted_ids.append(cursor.lastrowid)

    conn.commit()
    return inserted_ids

def jaccard_similarity(str1: str, str2: str) -> float:
    if not str1 or not str2:
        return 0.0

    set1 = set(str1.lower().split())
    set2 = set(str2.lower().split())
    intersection = set1 & set2
    union = set1 | set2
    return len(intersection) / len(union)

def preprocess_product_name(product: Dict[str, Any]) -> str:
    brand = (product.get('brand', '') or '').lower().strip()
    name = product['name'].lower()
    if brand:
        name = re.sub(r'\b' + re.escape(brand) + r'\b', '', name).strip()
    return f"{brand} {name}".strip()

def compare_products_using_jaccard(products_list: List[List[Dict[str, Any]]], conn: sqlite3.Connection) -> Tuple[List[Dict[str, Any]], List[List[Dict[str, Any]]]]:
    unique_products = defaultdict(lambda: {'products': [], 'allPrices': {}, 'image_urls': {}})
    similar_product_groups = []
    matched: Set[Tuple[str, str, str, str]] = set()

    for i, products1 in enumerate(products_list):
        for product1 in products1:
            product1_name = preprocess_product_name(product1)
            product1_quantity = product1['quantity'].replace(" ", "") if product1['quantity'] else ''
            product1_brand = product1['brand'].lower().strip() if product1['brand'] else ''
            product1_key = (product1_name, product1_quantity, product1_brand, product1['source'])
            if product1_key not in matched:
                unique_products[product1_key]['products'].append(product1)
                unique_products[product1_key]['allPrices'][product1['source']] = product1['price']
                unique_products[product1_key]['image_urls'][product1['source']] = product1['image_url']
                matched.add(product1_key)

                for j, products2 in enumerate(products_list):
                    if j <= i:
                        continue

                    for product2 in products2:
                        product2_name = preprocess_product_name(product2)
                        product2_quantity = product2['quantity'].replace(" ", "") if product2['quantity'] else ''
                        product2_brand = product2['brand'].lower().strip() if product2['brand'] else ''
                        product2_key = (product2_name, product2_quantity, product2_brand, product2['source'])

                        if product2_key not in matched and product1_quantity == product2_quantity and product1_brand == product2_brand:
                            jaccard_sim = jaccard_similarity(product1_name, product2_name)
                            if jaccard_sim > 0.666:
                                unique_products[product1_key]['products'].append(product2)
                                unique_products[product1_key]['allPrices'][product2['source']] = product2['price']
                                unique_products[product1_key]['image_urls'][product2['source']] = product2['image_url']
                                matched.add(product2_key)

                if len(unique_products[product1_key]['products']) >= 2:
                    similar_product_groups.append(unique_products[product1_key]['products'])

    similar_products = []
    source_specific_ids = defaultdict(list)

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

            for product in product_info['products']:
                inserted_ids = insert_source_specific_products(conn, [product], product['source'])
                source_specific_ids[product['source']].extend(inserted_ids)

    insert_similar_products(conn, similar_products, source_specific_ids)

def delete_orphaned_source_products(conn: sqlite3.Connection, sources: List[str]):
    cursor = conn.cursor()
    for source in sources:
        cursor.execute(f'''
            DELETE FROM {source}_products
            WHERE similar_product_id IS NULL
        ''')
    conn.commit()

def insert_all_source_products(conn: sqlite3.Connection, products_list: List[List[Dict[str, Any]]], sources: List[str]):
    cursor = conn.cursor()
    inserted_ids = []

    all_products = []
    
    for products in products_list:
        all_products.extend(products)

    for source in sources:
        existing_product_names = set()
        cursor.execute(f'SELECT name FROM {source}_products')
        results = cursor.fetchall()
        for result in results:
            existing_product_names.add(result[0].lower())

        for product in all_products:
            product_name = product['name'].lower()
            if product_name not in existing_product_names and product['source'] == source:
                cursor.execute(f'''
                    INSERT INTO all_{source}_products (name, brand, quantity, price, oldPrice, discount, source, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    product['name'],
                    product['brand'],
                    product['quantity'],
                    product['price'],
                    product['oldPrice'],
                    product['discount'],
                    product['source'],
                    product['image_url']
                ))
                inserted_ids.append(cursor.lastrowid)

    conn.commit()
    return inserted_ids

def extract_brand_from_name(name: str, brands: Set[str]) -> str:
    for brand in brands:
        if re.search(r'\b' + re.escape(brand.lower()) + r'\b', name.lower()):
            return brand
    return ''

def assign_brands_to_penny_products(penny_products: List[Dict[str, Any]], all_products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    brand_set = {product['brand'].lower() for product in all_products if product['brand']}
    
    for product in penny_products:
        if not product['brand']:
            product_name = preprocess_product_name(product)
            brand = extract_brand_from_name(product_name, brand_set)
            if brand:
                product['brand'] = brand.capitalize()
                product_name_without_brand = re.sub(r'\b' + re.escape(brand.lower()) + r'\b', '', product_name).strip()
                product['name'] = product_name_without_brand.capitalize()
        if product['brand']==product['quantity']:
            product['brand'] = ''
    return penny_products

def main():
    csv_file_paths = {
        'mega': './backend/mega_image_db.csv',
        'penny': './backend/penny_products_db.csv'
    }
    sqlite_file_paths = [
        './backend/KauflandProducts.db',
        './backend/AuchanProducts.db'
    ]
    table_name = 'products'

    products_list = []
    sources = {'penny', 'mega', 'auchan', 'kaufland'}
    
    for source, file_path in csv_file_paths.items():
        products = read_csv(file_path, source)
        products_list.append(products)

    for sqlite_path in sqlite_file_paths:
        products = read_sqlite(sqlite_path, table_name)
        products_list.append(products)

    all_products = [product for sublist in products_list for product in sublist]
    penny_products = [product for product in all_products if product['source'] == 'penny']

    penny_products = assign_brands_to_penny_products(penny_products, all_products)

    conn = sqlite3.connect('./backend/similar_products1.db')
    create_tables(conn, sources)

    compare_products_using_jaccard(products_list, conn)
    delete_orphaned_source_products(conn,sources)
    insert_all_source_products(conn, products_list, sources)
    conn.close()

if __name__ == "__main__":
    main()