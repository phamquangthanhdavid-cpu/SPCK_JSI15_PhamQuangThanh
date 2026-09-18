document.addEventListener("DOMContentLoaded", function () {
  var products = document.querySelectorAll(".product");
  
  function showAuthButtons(user) {
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

  products.forEach(function (product) {
    product.addEventListener("click", function (event) {
      // Ngăn chặn hành vi mặc định của liên kết
      // vd: nếu sản phẩm là một thẻ <a>, nó sẽ ngăn chặn việc điều hướng mặc định đến trang chi tiết sản phẩm
      event.preventDefault();

      var image = product.querySelector("img");
      var name = product.querySelector("h3");
      var price = product.querySelector(".price");

      var productData = {
        image: image.getAttribute("src"),
        name: name.innerText,
        price: price.innerText,
      };

      localStorage.setItem("selectedProduct", JSON.stringify(productData));
      window.location.href = "./detail.html";
    });
  });
});


function redirectToLoginIfNotAuthenticated() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      alert("Bạn cần đăng nhập để xem chi tiết sản phẩm.");
      window.location.href = "./login.html";
    }
  });
};