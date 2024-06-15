document.addEventListener('DOMContentLoaded', () => {
    const queryParams = new URLSearchParams(window.location.search);
    const productId = queryParams.get('productId');

    if (productId) {
        fetch(`/api/product_details?productId=${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => displayProductInstances(data))
            .catch(error => console.error('Error fetching product details:', error));
    } else {
        console.error('Product ID not provided in URL');
    }
});

function displayProductInstances(data) {
    const productInstancesContainer = document.getElementById('product-instances');
    const { instances } = data;

    instances.sort((a, b) => a.price - b.price);

    instances.forEach((instance,index) => {
        const instanceElement = document.createElement('div');
        instanceElement.classList.add('product-instance');
        if (index === 0) {
            instanceElement.classList.add('first-instance');
        }
        instanceElement.innerHTML = `
            <p> ${instance.name}</p>
            <p> ${instance.brand}</p>
            <p> ${instance.source}</p>
            <p> ${instance.price} Lei</p>
            <p> ${instance.quantity}</p>
            <img src="${instance.image_url}" alt="${instance.name}">
        `;
        productInstancesContainer.appendChild(instanceElement);
    });
}
