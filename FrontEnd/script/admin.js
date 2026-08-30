document.addEventListener("DOMContentLoaded", () => {
    // checkAuthState();
    loadProducts();
});



document.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-edit")) {
        const productId = event.target.getAttribute("data-id");
        console.log("Edit product:", productId);
    }
    if (event.target.classList.contains("btn-delete")) {
        const productId = event.target.getAttribute("data-id");
        console.log("Delete product:", productId);
    }
});


function loadProducts() {
    const productsContainer = document.getElementById("products-container");
    productsContainer.innerHTML = ""; // Clear existing products

    db.collection("products")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                console.log(product);
                // Create product card HTML
                const productCard = `
                    <div class="card mb-3">
                        <div class="row g-0">
                            <div class="col-md-2 d-flex justify-content-center align-items-center">
                                <img src="${product.image}" class="img-fluid rounded-start" alt="${product.name}">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${product.name} - ${product.price.toFixed(2)} VND</h5>
                                    <p class="card-text">Stocks: <b class="text-danger">${product.stocks}</b></p>
                                    <p class="card-text">${product.description}</p>
                                    <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
                                </div>
                            </div>
                            <div class="col-md-2 d-flex flex-row justify-content-center align-items-center">
                                <button class="btn btn-warning btn-edit" data-id="${doc.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                                <button class="btn btn-danger ms-2 btn-delete" data-id="${doc.id}"><i class="fa-solid fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.innerHTML += productCard;
            });
        });
}

function updateProduct(productId, updatedData) {
    db.collection("products").doc(productId).update(updatedData)
        .then(() => {
            console.log("Product updated successfully!");
            loadProducts(); // Reload products after update
        })
        .catch((error) => {
            console.error("Error updating product: ", error);
        });
}


