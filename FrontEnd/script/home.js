document.addEventListener("DOMContentLoaded", function () {
  var login = document.getElementById("login");
  var register = document.getElementById("register");
  var logout = document.getElementById("logout");
  var products = document.querySelectorAll(".product");




  
  function showAuthButtons() {
    var userLoggedIn = localStorage.getItem("userLoggedIn");

    if (userLoggedIn == null) {
      login.style.display = "inline-block";
      register.style.display = "inline-block";
      logout.style.display = "none";
    } else {
      login.style.display = "none";
      register.style.display = "none";
      logout.style.display = "inline-block";
    }
  }

  logout.addEventListener("click", function () {
    localStorage.removeItem("userLoggedIn");
    alert("Đăng xuất thành công!");
    showAuthButtons();
  });

  showAuthButtons();







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
