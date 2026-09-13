const IMAGE_SERVER_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", function () {
  var productName = document.getElementById("product-name");
  var productPrice = document.getElementById("product-price");
  var productStock = document.getElementById("product-stock");
  var productCategory = document.getElementById("product-category");
  var productDescription = document.getElementById("product-description");
  var productImage = document.getElementById("product-image");
  var btnSaveProduct = document.getElementById("btn-save-product");
  var login = document.getElementById("login");
  var register = document.getElementById("register");
  var logout = document.getElementById("logout");
  const productsContainer = document.getElementById("products-container");

  setupAuthButtons();
  loadProducts();

  function showAuthButtons(user) {
    if (!login || !register || !logout) {
      return;
    }

    if (user) {
      login.style.display = "none";
      register.style.display = "none";
      logout.style.display = "inline-block";
    } else {
      login.style.display = "inline-block";
      register.style.display = "inline-block";
      logout.style.display = "none";
    }
  }

  function setupAuthButtons() {
    if (!logout || typeof firebase === "undefined" || !firebase.auth) {
      return;
    }

    logout.addEventListener("click", function () {
      firebase
        .auth()
        .signOut()
        .then(function () {
          alert("Đăng xuất thành công!");
        })
        .catch(function (error) {
          console.error("Error signing out:", error);
          alert("Đăng xuất thất bại. Vui lòng thử lại!");
        });
    });

    firebase.auth().onAuthStateChanged(function (user) {
      if (user && user.email != "admin@quangthanh.com") {
        window.location.href = "./home.html";
      }
      showAuthButtons(user);
    });
  }

  btnSaveProduct.addEventListener("click", async function (event) {
    event.preventDefault();

    var name = productName.value.trim();
    var price = Number(productPrice.value);
    var stock = Number(productStock.value);
    var category = productCategory.value.trim();
    var description = productDescription.value.trim();
    var imageFile = productImage.files[0];

    if (name === "") {
      alert("Please enter product name!");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert("Please enter a valid product price!");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Please enter a valid product stock!");
      return;
    }

    if (description === "") {
      alert("Please enter product description!");
      return;
    }

    if (productCategory.value.trim() === "") {
      alert("Please enter product category!");
      return;
    }

    if (!imageFile) {
      alert("Please select product image!");
      return;
    }

    btnSaveProduct.disabled = true;
    btnSaveProduct.innerText = "Saving...";

    const formData = new FormData();
    formData.append("image", document.getElementById("product-image").files[0]);

    const respone = await fetch(`${IMAGE_SERVER_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!respone.ok) {
      console.error("Error uploading image:", respone.statusText);
      return;
    } else {
      const data = await respone.json();
      const imageUrl = data.url;
      console.log("Image uploaded successfully:", imageUrl);

      try {
        await db.collection("product").add({
          name: name,
          price: price,
          stock: stock,
          description: description,
          category: category,
          image: imageUrl,
        });

        alert("Product added successfully!");
        clearProductForm();
        loadProducts();
        closeAddProductModal();
      } catch (error) {
        console.error("Error adding product:", error);
        alert("Error adding product: " + error.message);
      } finally {
        btnSaveProduct.disabled = false;
        btnSaveProduct.innerText = "Save changes";
      }
    }
  });

  document.addEventListener("click", function (event) {
    var deleteButton = event.target.closest(".btn-delete");

    if (!deleteButton) {
      return;
    }

    var productId = deleteButton.getAttribute("data-id");

    if (!productId || !confirm("Delete this product?")) {
      return;
    }

    db.collection("product")
      .doc(productId)
      .delete()
      .then(function () {
        alert("Product deleted successfully!");
        loadProducts();
      })
      .catch(function (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product: " + error.message);
      });
  });

  async function uploadProductImage(imageFile) {
    var safeFileName = imageFile.name.replace(/\s+/g, "-");
    var fileName = Date.now() + "_" + safeFileName;
    var storageRef = firebase
      .storage()
      .ref()
      .child("products/" + fileName);
    var snapshot = await storageRef.put(imageFile);

    return snapshot.ref.getDownloadURL();
  }

  function clearProductForm() {
    productName.value = "";
    productPrice.value = "";
    productStock.value = "";
    productDescription.value = "";
    productImage.value = "";
  }

  function closeAddProductModal() {
    var modalElement = document.getElementById("addProductModal");
    var modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
      modal.hide();
    }
  }

  function loadProducts() {
    const productsContainer = document.getElementById("products-container");
    productsContainer.innerHTML = "";

    db.collection("product")
      .get()
      .then(function (querySnapshot) {
        if (querySnapshot.empty) {
          productsContainer.innerHTML =
            '<div class="alert alert-info">Chưa có sản phẩm nào.</div>';
          return;
        }

        querySnapshot.forEach(function (doc) {
          var product = doc.data();
          productsContainer.innerHTML += createProductCard(doc.id, product);
        });
      })
      .catch(function (error) {
        console.error("Error loading products:", error);
        productsContainer.innerHTML =
          '<div class="alert alert-danger">Không tải được danh sách sản phẩm.</div>';
      });
  }

  function createProductCard(productId, product) {
    var price = Number(product.price) || 0;
    var stock = Number(product.stock) || 0;

    return `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-2 d-flex justify-content-center align-items-center">
                        <img src="${product.image || ""}" class="img-fluid rounded-start" alt="${product.name || "Product"}">
                    </div>

                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${product.name || ""}</h5>
                            <p class="card-text">${product.description || ""}</p>
                            <p class="card-text">Price: <b>${price.toLocaleString("vi-VN")} VND</b></p>
                            <p class="card-text">Stock: <b class="text-danger">${stock}</b></p>
                            <p class="card-text">Category: <b>${product.category || ""}</b></p>
                        </div>
                    </div>

                    <div class="col-md-2 d-flex flex-row justify-content-center align-items-center">
                        <button class="btn btn-warning btn-edit" data-id="${productId}">
                            <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button class="btn btn-danger ms-2 btn-delete" data-id="${productId}">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
  }
});
