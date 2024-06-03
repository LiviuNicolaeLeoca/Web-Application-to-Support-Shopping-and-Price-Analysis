import csv
import sqlite3
from typing import List, Dict, Any

def read_csv_mega(file_path: str) -> List[Dict[str, Any]]:
    products = []
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                manufacturer_name = row['manufacturerName'].strip()
                manufacturer_sub_brand_name = row['manufacturerSubBrandName'].strip() if row['manufacturerSubBrandName'] else ""
                name = row['name'].strip()
                price = float(row['formattedValue'].strip())
                quantity = row['quantity'].strip().lower().replace(" ", "")
                image_urls = row.get('images', '').strip().split(', ')
                image_url = image_urls[-2] if len(image_urls) >= 2 else ''
                if manufacturer_name and name and not isinstance(price, str) and quantity:
                    products.append({
                        'brand': manufacturer_name + manufacturer_sub_brand_name,
                        'name': name,
                        'price': price,
                        'quantity': quantity,
                        'source': 'mega',
                        'image_url': image_url
                    })
            except (KeyError, ValueError):
                continue
    return products

def read_csv_penny(file_path: str) -> List[Dict[str, Any]]:
    products = []
    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                name = row['name'].strip()
                price = float(row.get('value', '0').strip())
                old_price = float(row.get('oldPrice', '0').strip()) if row.get('oldPrice') else 0.0
                loyalty_value = float(row.get('loyaltyValue', '0').strip()) if row.get('loyaltyValue') else 0.0
                quantity = f"{row['amount'].strip().lower()} {row['volumeLabelShort'].strip().lower().replace(' ', '')}" 
                image_data = row.get('images', '').strip()
                image_urls = image_data.split(', ')
                image_url = image_urls[0] if image_urls else ''
                if(image_url):
                    image_url = image_url.replace("[","")
                if name and quantity:
                    products.append({
                        'name': name,
                        'price': price,
                        'old_price': old_price,
                        'loyalty_value': loyalty_value,
                        'quantity': quantity,
                        'source': 'penny',
                        'image_url': image_url
                    })
            except (KeyError, ValueError):
                continue
    return products

def jaccard_similarity(str1: str, str2: str) -> float:
    if not str1 or not str2:
        return 0.0 

    set1 = set(str1.lower().split())
    set2 = set(str2.lower().split())
    intersection = set1 & set2
    union = set1 | set2
    return len(intersection) / len(union)

def preprocess_product_name(product: Dict[str, Any]) -> str:
    manufacturer_name = product.get('manufacturerName', '')
    manufacturer_sub_brand_name = product.get('manufacturerSubBrandName', '')
    name = product['name']
    return f"{manufacturer_name} {manufacturer_sub_brand_name} {name}".strip()

def preprocess_kaufland_product_name(product: Dict[str, Any]) -> str:
    brand = product.get('brand', '')
    name = product['name']
    return f"{brand} {name}".strip()

def read_sqlite(db_path: str, table_name: str) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name}")
    columns = [description[0] for description in cursor.description]
    
    rows = cursor.fetchall()
    products = [dict(zip(columns, row)) for row in rows]
    conn.close()

    if 'KauflandProducts' in db_path:
        for product in products:
            product['name'] = preprocess_kaufland_product_name(product)
    
    source = db_path.split('/')[-1].split('Products')[0].lower()
    for product in products:
        product['source'] = source
    
    return products

def compare_products(products1: List[Dict[str, Any]], products2: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    similar_products = []

    for product1 in products1:
        product1_name = preprocess_product_name(product1)
        product1_quantity = product1['quantity'].replace(" ", "") if product1['quantity'] else ''
        
        for product2 in products2:
            product2_name = preprocess_product_name(product2)
            product2_quantity = product2.get('quantity', '')
            if(product2_quantity):
                product2_quantity=product2_quantity.replace(" ", "")
            
            product1_brand = product1.get('brand', '')
            product2_brand = product2.get('brand', '') if 'brand' in product2 else ''
            
            if product1_quantity == product2_quantity:
                name_similarity = jaccard_similarity(product1_name, product2_name)
                price_ratio_1_higher = float(product1['price']) / float(product2['price'])
                price_ratio_2_higher = float(product2['price']) / float(product1['price'])
            
                if name_similarity > 0.5:
                    similar_products.append({
                        'product1Name': product1_name,
                        'product2Name': product2_name,
                        'product1Brand': product1_brand,
                        'product2Brand': product2_brand,
                        f"{product1['source']}Price": product1['price'],
                        f"{product2['source']}Price": float(product2['price']),
                        'quantity': product1_quantity,
                        'product1Source': product1['source'],
                        'product2Source': product2['source'],
                        'image_url_product1': product1.get('image_url', ''),
                        'image_url_product2': product2.get('image_url', '')
                    })

    return similar_products

def save_similar_products_to_db(similar_products: List[Dict[str, Any]], db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('DROP TABLE IF EXISTS similar_products')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS similar_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product1Name TEXT,
            product2Name TEXT,
            product1Brand TEXT,
            product2Brand TEXT,
            megaPrice REAL,
            pennyPrice REAL,
            kauflandPrice REAL,
            auchanPrice REAL,
            quantity TEXT,
            product1Source TEXT,
            product2Source TEXT,
            image_url_product1 TEXT,
            image_url_product2 TEXT
        )
    ''')

    for product in similar_products:
        cursor.execute('''
            INSERT INTO similar_products (
                product1Name, product2Name, product1Brand, product2Brand, megaPrice, pennyPrice, kauflandPrice, auchanPrice, quantity, product1Source, product2Source, image_url_product1, image_url_product2
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            product.get('product1Name'),
            product.get('product2Name'),
            product.get('product1Brand', None),
            product.get('product2Brand', None),
            product.get('megaPrice', None),
            product.get('pennyPrice', None),
            product.get('kauflandPrice', None),
            product.get('auchanPrice', None),
            product.get('quantity'),
            product.get('product1Source'),
            product.get('product2Source'),
            product.get('image_url_product1', ''),
            product.get('image_url_product2', '')
        ))

    conn.commit()
    conn.close()

def main():
    csv_file_paths = {
        'mega': 'mega_image_db.csv',
        'penny': 'penny_products_db.csv'
    }
    sqlite_file_paths = [
        'KauflandProducts.db', 
        'AuchanProducts.db'
    ]
    table_name = 'products'

    csv_products_mega = read_csv_mega(csv_file_paths['mega'])
    csv_products_penny = read_csv_penny(csv_file_paths['penny'])
    
    sqlite_products_kaufland = read_sqlite(sqlite_file_paths[0], table_name)
    sqlite_products_auchan = read_sqlite(sqlite_file_paths[1], table_name)

    similar_products = []

    similar_products.extend(compare_products(csv_products_mega, csv_products_penny))
    
    similar_products.extend(compare_products(sqlite_products_kaufland, sqlite_products_auchan))

    similar_products.extend(compare_products(csv_products_mega, sqlite_products_kaufland))
    similar_products.extend(compare_products(csv_products_mega, sqlite_products_auchan))
    similar_products.extend(compare_products(csv_products_penny, sqlite_products_kaufland))
    similar_products.extend(compare_products(csv_products_penny, sqlite_products_auchan))

    db_path = 'similar_products.db'
    save_similar_products_to_db(similar_products, db_path)

    for product in similar_products:
        print(product)

if __name__ == "__main__":
    main()
