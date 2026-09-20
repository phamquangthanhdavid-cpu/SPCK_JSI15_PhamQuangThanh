document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
  var products = document.getElementsById("product");
  
  products.forEach(function (product) {
    product.addEventListener("click", function (event) {
      // Ngăn chặn hành vi mặc định của liên kết
      // vd: nếu sản phẩm là một thẻ <a>, nó sẽ ngăn chặn việc điều hướng mặc định đến trang chi tiết sản phẩm
      event.preventDefault();

      var name = product.getElementById("img");
      var image = product.getElementById("name");
      var price = product.getElementById("price");

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

function loadProducts() {
  const vanPhongList = document.getElementById("van-phong");
  const gamingList = document.getElementById("gaming");
  const dohoaList = document.getElementById("do-hoa");
  const mongNheList = document.getElementById("mong-nhe");
  const likeNewList = document.getElementById("like-new");
  const phukienList = document.getElementById("phu-kien");

  vanPhongList.innerHTML = "";
  gamingList.innerHTML = "";
  dohoaList.innerHTML = "";
  mongNheList.innerHTML = "";
  likeNewList.innerHTML = "";
  phukienList.innerHTML = "";

  db.collection("product")
    .get()
    .then(function (querySnapshot) {
      if (querySnapshot.empty) {
        var emptyMessage =
          '<div class="alert alert-info">Chưa có sản phẩm nào.</div>';
        vanPhongList.innerHTML = emptyMessage;
        gamingList.innerHTML = emptyMessage;
        dohoaList.innerHTML = emptyMessage;
        mongNheList.innerHTML = emptyMessage;
        likeNewList.innerHTML = emptyMessage;
        phukienList.innerHTML = emptyMessage;
        return;
      }

      querySnapshot.forEach(function (doc) {
        var product = doc.data();
        var productCard = createProductCard(product, doc.id);
        switch (product.category) {
          case "VP":
            vanPhongList.innerHTML += productCard;
            break;
          case "GA":
            gamingList.innerHTML += productCard;
            break;
          case "DH":
            dohoaList.innerHTML += productCard;
            break;
          case "MN":
            mongNheList.innerHTML += productCard;
            break;
          case "LN":
            likeNewList.innerHTML += productCard;
            break;
          default:
            phukienList.innerHTML += productCard;
            break;
        }
      });
      // LoadEvents();
    })
    .catch(function (error) {
      console.error("Error loading products:", error);
      productsContainer.innerHTML =
        '<div class="alert alert-danger">Không tải được danh sách sản phẩm.</div>';
    });
}

function createProductCard(product, id) {
  var price = Number(product.price) || 0;
  return `
    <div id="product" class="card" style="width: 18rem;">
      <a href="./detail.html"><img id="image" class="card-img-top" src="${product.image}" alt="${product.name}"></a>
      <div class="card-body">
        <h3 id="name" class="card-title">${product.name}</h3>
        <div class="row">
          <div class="col-3 pe-0">
            <button id="add-to-cart" style="width:100%" type="button" class="btn btn-outline-info btn-add-to-cart" data-id="${id}"><i class="fa-solid fa-cart-plus"></i></button>
          </div>
          <div class="col-9">
            <button id="price" style="width:100%" type="button" class="btn btn-primary price btn-buy" data-id="${id}">${price.toLocaleString("vi-VN")} VND</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
