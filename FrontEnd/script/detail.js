document.addEventListener("DOMContentLoaded", function () {
  var image = document.querySelector("[data-product-image]");
  var name = document.querySelector("[data-product-name]");
  var price = document.querySelector("[data-product-price]");
  var addToCartButton = document.getElementById("add-to-cart");
  var login = document.getElementById("login");
  var register = document.getElementById("register");
  var logout = document.getElementById("logout");

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
      firebase.auth().signOut()
        .then(function () {
          alert("Đăng xuất thành công!");
        })
        .catch(function (error) {
          console.error("Error signing out:", error);
          alert("Đăng xuất thất bại. Vui lòng thử lại!");
        });
    });

    firebase.auth().onAuthStateChanged(function (user) {
      showAuthButtons(user);
    });
  }

  setupAuthButtons();


  
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
