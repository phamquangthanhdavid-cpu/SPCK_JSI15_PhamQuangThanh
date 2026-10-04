// function LoadEvents() {
//   document.querySelectorAll(".btn-add-to-cart").forEach((btn) => {
//     btn.addEventListener("click", (e) => {});
//   });
// }

document.addEventListener("click", async function (event) {
  var btnAddToCart = event.target.closest(".btn-add-to-cart");

  if (btnAddToCart) {
    await BtnAddToCartClick(btnAddToCart);
    return;
  }

  var btnBuy = event.target.closest(".btn-buy");

  if (btnBuy) {
    await BtnBuyNowClick(btnBuy);
  }
});

async function BtnAddToCartClick(btn) {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
    return;
  }

  const productId = btn.getAttribute("data-id");
  if (!productId) return;

  btn.disabled = true;

  try {
    const ok = await addToCart(user, productId);
    if (ok) alert("Đã thêm vào giỏ hàng.");
  } finally {
    btn.disabled = false;
  }
}

async function BtnBuyNowClick(btn) {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Vui lòng đăng nhập để mua hàng.");
    return;
  }

  const productId = btn.getAttribute("data-id");
  if (!productId) return;

  btn.disabled = true;

  try {
    const ok = await addToCart(user, productId);
    if (ok) {
      window.location.href = "./shopping-cart.html";
    }
  } finally {
    btn.disabled = false;
  }
}

// Them san pham vao gio hang, tra ve true neu thanh cong
async function addToCart(user, productId) {
  try {
    const productSnap = await db.collection("product").doc(productId).get();
    if (!productSnap.exists) {
      alert("Sản phẩm không tồn tại.");
      return false;
    }

    const cartRef = db.collection("carts").doc(user.uid);

    await db.runTransaction(async (tx) => {
      const cartSnap = await tx.get(cartRef);

      const line = {
        productId: productId,
        quantity: 1,
      };

      if (!cartSnap.exists) {
        tx.set(cartRef, {
          userId: user.uid,
          products: [line],
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return;
      }

      const products = cartSnap.data().products || [];
      const i = products.findIndex((p) => p.productId === productId);

      if (i >= 0) {
        products[i].quantity = (products[i].quantity || 0) + 1;
      } else {
        products.push(line);
      }

      tx.update(cartRef, {
        products: products,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    return true;
  } catch (err) {
    console.error("Add to cart failed:", err);
    alert("Có lỗi xảy ra, vui lòng thử lại.");
    return false;
  }
}

function CheckAuth() {
  var user = firebase.auth().currentUser;
  if (user) return true;
  return false;
}
