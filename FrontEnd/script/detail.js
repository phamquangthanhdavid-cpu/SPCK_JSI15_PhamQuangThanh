document.addEventListener("DOMContentLoaded", function () {
  var image = document.querySelector("[data-product-image]");
  var name = document.querySelector("[data-product-name]");
  var price = document.querySelector("[data-product-price]");

  // Hien thi san pham da chon tu localStorage
  var savedProduct = localStorage.getItem("selectedProduct");

  if (savedProduct) {
    try {
      var product = JSON.parse(savedProduct);

      image.src = product.image || image.src;
      image.alt = product.name || "Sản phẩm";
      name.innerText = product.name || "Sản phẩm";
      price.innerText = Number(product.price)
        ? Number(product.price).toLocaleString("vi-VN") + " VND"
        : product.price || "Liên Hệ: 0123456789";

      var description = document.querySelector("[data-product-description]");
      if (description && product.description) {
        description.innerText = product.description;
      }
    } catch (error) {
      console.error("Không đọc được sản phẩm đã lưu:", error);
    }
  }
});
