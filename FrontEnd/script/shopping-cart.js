var cartItems = document.getElementById("cart-items");
var cartQuantity = document.getElementById("cart-quantity");
var cartTotal = document.getElementById("cart-total");
var cart = JSON.parse(localStorage.getItem("cartProducts")) || [];

function priceToNumber(priceText) {
  if (priceText.toLowerCase().includes("li")) {
    return 0;
  }

  return Number(priceText.replace(/\D/g, "")) || 0;
}

function formatMoney(number) {
  return number.toLocaleString("vi-VN") + " VND";
}

function saveCart() {
  // Đổi mảng cart thành chuỗi JSON và lưu vào localStorage
  localStorage.setItem("cartProducts", JSON.stringify(cart));
}

function showCart() {
  var totalQuantity = 0;
  var totalMoney = 0;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<tr><td colspan="6" class="empty-cart">Giỏ hàng đang trống</td></tr>';
    cartQuantity.innerText = "0";
    cartTotal.innerText = "0 VND";
    return;
  }

  for (var i = 0; i < cart.length; i++) {
    var product = cart[i];
    var price = priceToNumber(product.price);
    var quantity = Number(product.quantity) || 1;
    var productTotal = price * quantity;

    totalQuantity = totalQuantity + quantity;
    totalMoney = totalMoney + productTotal;

    cartItems.innerHTML +=
      "<tr>" +
      "<td>" +
      (i + 1) +
      "</td>" +
      "<td>" +
      product.name +
      "</td>" +
      "<td>" +
      product.price +
      "</td>" +
      '<td><input class="quantity-input" type="number" min="1" value="' +
      quantity +
      '" onchange="changeQuantity(' +
      i +
      ', this.value)"></td>' +
      "<td>" +
      formatMoney(productTotal) +
      "</td>" +
      '<td><button class="remove-btn" onclick="deleteProduct(' +
      i +
      ')">Xóa</button></td>' +
      "</tr>";
  }

  cartQuantity.innerText = totalQuantity;
  cartTotal.innerText = formatMoney(totalMoney);
}

function changeQuantity(index, value) {
  // parseInt() đổi value sang số nguyên
  var quantity = parseInt(value);

  if (isNaN(quantity) || quantity < 1) {
    quantity = 1;
  }

  cart[index].quantity = quantity;
  saveCart();
  showCart();
}

function deleteProduct(index) {
  // Xóa sản phẩm tại vị trí bấm nút xóa khỏi mảng cart
  cart.splice(index, 1);
  saveCart();
  showCart();
}

showCart();
