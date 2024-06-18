let supermarket=''

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    supermarket = path.split('/').slice(-2, -1)[0];

    fetchProducts(`/${supermarket}`, '.product-grid')
        .catch(error => console.error('Error fetching products:', error));

    fetchProducts(`/all_${supermarket}`, '.all-source-product-grid')
        .then(() => {
            populateFilters(allSourceProducts, '#quantity-filter', 'quantity');
            populateFilters(allSourceProducts, '#brand-filter', 'brand');
            synchronizeCheckboxes('#brand-filter', currentBrandFilters);
            synchronizeCheckboxes('#quantity-filter', currentQuantityFilters);
        })
        .catch(error => console.error('Error fetching all source products:', error));

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);

    document.getElementById('clear-filters-button').addEventListener('click', clearFilters);

    document.getElementById('brand-filter-search').addEventListener('input', handleFilterSearch);
    document.getElementById('quantity-filter-search').addEventListener('input', handleFilterSearch);

    document.getElementById('sort-options').addEventListener('change', handleSortChange);
});

let allProducts = [];
let allSourceProducts = [];
let currentBrandFilters = [];
let currentQuantityFilters = [];

function clearFilters() {
    currentBrandFilters = [];
    currentQuantityFilters = [];
    document.querySelectorAll('#brand-filter input', '#quantity-filter input').forEach(input => input.checked = false);
    filterProducts('', '.product-grid');
    filterProducts('', '.all-source-product-grid');
    populateFilters(allSourceProducts, '#brand-filter', 'brand');
    populateFilters(allSourceProducts, '#quantity-filter', 'quantity');
}

function fetchProducts(endpoint, containerSelector) {
    return fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch products (HTTP status ${response.status})`);
            }
            return response.json();
        })
        .then(products => {
            if (containerSelector === '.product-grid') {
                allProducts = products;
            } else {
                allSourceProducts = products;
            }
            displayProducts(products, containerSelector);
        })
        .catch(error => console.error('Error fetching products:', error));
}

function displayProducts(products, containerSelector) {
    const productGrid = document.querySelector(containerSelector);
    if (!productGrid) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }
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

    card.addEventListener('click', () => {
        const queryParams = new URLSearchParams({
            productId: product.similar_product_id,
            Id:product.id,
            productName: product.name,
            productImage: product.image_url,
            productPrice: product.price,
            productSource: supermarket
        });
        window.location.href = `../../product_details/product_details.html?${queryParams.toString()}`;
    });
    return card;
}

function populateFilters(products, filterContainerSelector, property) {
    const filterContainer = document.querySelector(filterContainerSelector);
    filterContainer.innerHTML = '';
    const filterOptions = new Set(products.map(product => product[property]));

    filterOptions.forEach(option => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = option;

        const isChecked = (property === 'brand' && currentBrandFilters.includes(option.toLowerCase())) ||
                          (property === 'quantity' && currentQuantityFilters.includes(option.toLowerCase()));
        checkbox.checked = isChecked;

        checkbox.addEventListener('change', handleFilterChange);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(option || 'Unknown'));
        filterContainer.appendChild(label);
    });
}

function synchronizeCheckboxes(filterContainerSelector, filters) {
    const checkboxes = document.querySelectorAll(`${filterContainerSelector} input[type="checkbox"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = filters.includes(checkbox.value.toLowerCase());
    });
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    filterProducts(query, '.product-grid');
    filterProducts(query, '.all-source-product-grid');
}

function handleFilterChange() {
    currentBrandFilters = Array.from(document.querySelectorAll('#brand-filter input:checked')).map(input => input.value.toLowerCase());
    currentQuantityFilters = Array.from(document.querySelectorAll('#quantity-filter input:checked')).map(input => input.value.toLowerCase());

    filterProductsByFilters('.product-grid', currentBrandFilters, currentQuantityFilters);
    filterProductsByFilters('.all-source-product-grid', currentBrandFilters, currentQuantityFilters);

    const filteredProducts = allSourceProducts.filter(product =>
        (currentBrandFilters.length === 0 || currentBrandFilters.includes(product.brand.toLowerCase())) &&
        (currentQuantityFilters.length === 0 || currentQuantityFilters.includes(product.quantity.toLowerCase()))
    );
    populateFilters(filteredProducts, '#brand-filter', 'brand');
    populateFilters(filteredProducts, '#quantity-filter', 'quantity');
}

function handleFilterSearch(event) {
    const searchValue = event.target.value.toLowerCase();
    const filterContainer = event.target.nextElementSibling;
    const checkboxes = filterContainer.querySelectorAll('label');

    checkboxes.forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(searchValue) ? 'block' : 'none';
    });
}

function handleSortChange(event) {
    const sortBy = event.target.value;
    let sortedProducts = [];

    if (sortBy === 'alphabetically as') {
        sortedProducts = [...allProducts].sort((a, b) => a.name.localeCompare(b.name));
        sortedSourceProducts = [...allSourceProducts].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'alphabetically des') {
        sortedProducts = [...allProducts].sort((a, b) => b.name.localeCompare(a.name));
        sortedSourceProducts = [...allSourceProducts].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'price as') {
        sortedProducts = [...allProducts].sort((a, b) => a.price - b.price);
        sortedSourceProducts = [...allSourceProducts].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price des') {
        sortedProducts = [...allProducts].sort((a, b) => b.price - a.price);
        sortedSourceProducts = [...allSourceProducts].sort((a, b) => b.price - a.price);
    }

    displayProducts(sortedProducts, '.product-grid');
    displayProducts(sortedSourceProducts, '.all-source-product-grid');
}

function filterProducts(query, containerSelector) {
    const filteredProducts = (containerSelector === '.product-grid' ? allProducts : allSourceProducts).filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query)) ||
        (product.quantity && product.quantity.toLowerCase().includes(query))
    );
    displayProducts(filteredProducts, containerSelector);
}

function filterProductsByFilters(containerSelector, brandFilter, quantityFilter) {
    const filteredProducts = (containerSelector === '.product-grid' ? allProducts : allSourceProducts).filter(product =>
        (brandFilter.length === 0 || brandFilter.includes(product.brand.toLowerCase())) &&
        (quantityFilter.length === 0 || quantityFilter.includes(product.quantity.toLowerCase()))
    );
    displayProducts(filteredProducts, containerSelector);
}
