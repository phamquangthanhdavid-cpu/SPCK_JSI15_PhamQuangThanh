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
    var product = JSON.parse(savedProduct);

    image.src = product.image;
    name.innerText = product.name;
    price.innerText = product.price;
  }






  
  addToCartButton.addEventListener("click", function (event) {
    // Ngăn chặn hành vi mặc định của liên kết
    // vd: nếu nút "Thêm vào giỏ hàng" là một thẻ <a>, nó sẽ ngăn chặn việc điều hướng mặc định đến trang giỏ hàng
    event.preventDefault();

    // Tạo object để Lấy thông tin sản phẩm từ trang detail.js để thêm vào shopping-cart.js
    var productAddToCart = {
      name: name.innerText,
      image: image.getAttribute("src"),
      price: price.innerText,
      quantity: 1,
    };

    var cart = JSON.parse(localStorage.getItem("cartProducts")) || [];
    var productInCart = cart.find(function (item) {
      return item.name === productAddToCart.name;
    });

    // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng lên 1, ngược lại thêm sản phẩm mới vào giỏ hàng
    if (productInCart) {
      productInCart.quantity = productInCart.quantity + 1;
    } else {
      cart.push(productAddToCart);
    }

    localStorage.setItem("cartProducts", JSON.stringify(cart));
    window.location.href = "./shopping-cart.html";
  });
});
