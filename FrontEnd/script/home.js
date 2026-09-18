document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
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
        var productCard = createProductCard(product);
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
    })
    .catch(function (error) {
      console.error("Error loading products:", error);
      productsContainer.innerHTML =
        '<div class="alert alert-danger">Không tải được danh sách sản phẩm.</div>';
    });
}

function createProductCard(product) {
  var price = Number(product.price) || 0;
  return `
    <div class="product">
      <a href="#"><img src="${product.image}" alt="${product.name}"></a>
      <h3>${product.name}</h3>
      <p class="price">${price.toLocaleString("vi-VN")} VND</p>
    </div>
  `;
}
