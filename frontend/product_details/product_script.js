document.addEventListener('DOMContentLoaded', () => {
    const queryParams = new URLSearchParams(window.location.search);
    const productId = queryParams.get('productId');
    const id = queryParams.get('Id');
    const source = queryParams.get('productSource');

    console.log('Query Params:', { productId, id, source });

    if (productId && productId !== 'undefined') {
        fetch(`/api/product_details?productId=${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => displayProductInstances(data))
            .catch(error => console.error('Error fetching product details:', error));
    } else if (id && source) {
        fetch(`/all_${source}_products?id=${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => displayProductInstances(data))
            .catch(error => console.error('Error fetching product instances:', error));
    } else {
        if (!id) {
            console.error('Id not provided in URL');
        }
        if (!source) {
            console.error('Product source not provided in URL');
        }
    }
});

function displayProductInstances(data) {
    const firstInstanceContainer = document.getElementById('first-instance');
    const productInstancesContainer = document.getElementById('product-instances');
    productInstancesContainer.innerHTML = '';
    firstInstanceContainer.innerHTML = '';
    const { instances } = data;

    instances.sort((a, b) => a.price - b.price);

    instances.forEach((instance, index) => {
        const instanceElement = document.createElement('div');
        instanceElement.classList.add('product-instance');
        if (instance.source === 'mega') {
            instance.source = 'mega image';
        }
        if(instance.price&&instance.oldPrice&&instance.discount===null)
        {
            instance.discount=`-${parseInt((1-(instance.price/instance.oldPrice))*100)}%`;
        }
        instanceElement.innerHTML = `
            <div class="product-instance-content">
                <img src="${instance.image_url}" alt="${instance.name}">
            </div>           
            <div class="details">
                <p><strong>${instance.name}</strong></p>
                <p>${instance.brand}</p>
                <p>${instance.source.toUpperCase()}</p>
                ${instance.discount ? `<p>${instance.discount}</p>` : ''}
                ${instance.oldPrice ? `<p><del>${instance.oldPrice} RON</del></p>` : ''}
                <p>${instance.price} RON</p>
                <p>${instance.quantity}</p>
            </div>
        `;

        if (index === 0) {
            instanceElement.classList.add('first-instance');
            firstInstanceContainer.appendChild(instanceElement);
        } else {
            productInstancesContainer.appendChild(instanceElement);
        }
    });
}
