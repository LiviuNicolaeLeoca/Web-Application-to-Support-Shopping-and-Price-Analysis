document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const supermarket = path.split('/').slice(-2, -1)[0];
    fetchProducts(`/${supermarket}`);
});

function fetchProducts(endpoint) {
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch products (HTTP status ${response.status})`);
            }
            return response.json();
        })
        .then(products => displayProducts(products))
        .catch(error => console.error('Error fetching products:', error));
}

function displayProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    const image = document.createElement('img');
    image.src = product.image_url;
    image.alt = product.name;
    card.appendChild(image);

    const name = document.createElement('h2');
    name.textContent = product.name;
    card.appendChild(name);

    const brand = document.createElement('p');
    brand.classList.add('brand');
    brand.textContent = product.brand;
    card.appendChild(brand);

    const quantity = document.createElement('p');
    quantity.classList.add('quantity');
    quantity.textContent = `${product.quantity}`;
    card.appendChild(quantity);

    const price = document.createElement('p');
    price.classList.add('price');
    price.textContent = `${product.price.toFixed(2)} RON`;
    card.appendChild(price);

    return card;
}
