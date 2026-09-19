let cartBody, cartQuantityEl, cartTotalEl;

let cartLines = []; 
let viewLines = []; 

function formatVND(value) {
  return (value || 0).toLocaleString("vi-VN") + " VND";
}

function cartRef() {
  const user = firebase.auth().currentUser;
  if (!user) return null;
  return db.collection("carts").doc(user.uid);
}

async function joinProducts(lines) {
  const snaps = await Promise.all(
    lines.map((line) => db.collection("product").doc(line.productId).get())
  );

  return lines.map((line, i) => {
    const snap = snaps[i];
    if (!snap.exists) {
      return {
        productId: line.productId,
        quantity: line.quantity || 1,
        name: "Sản phẩm không còn bán",
        price: 0,
        stock: 0,
        image: "",
        available: false,
      };
    }
    const data = snap.data();
    return {
      productId: line.productId,
      quantity: line.quantity || 1,
      name: data.name,
      price: data.price || 0,
      stock: data.stock || 0,
      image: data.image || "",
      available: true,
    };
  });
}

async function loadCart() {
  const ref = cartRef();
  if (!ref) {
    cartBody.innerHTML =
      '<tr><td colspan="6">Vui lòng đăng nhập để xem giỏ hàng.</td></tr>';
    setPayEnabled(false);
    return;
  }

  cartBody.innerHTML = '<tr><td colspan="6">Đang tải giỏ hàng...</td></tr>';

  try {
    const snap = await ref.get();
    cartLines = snap.exists ? snap.data().products || [] : [];
    viewLines = await joinProducts(cartLines);
    renderCart();
  } catch (err) {
    console.error("Load cart failed:", err);
    cartBody.innerHTML =
      '<tr><td colspan="6">Không tải được giỏ hàng. Vui lòng tải lại trang.</td></tr>';
    setPayEnabled(false);
  }
}

const LOW_STOCK = 5; 

function appendNote(cell, text) {
  const note = document.createElement("div");
  note.className = "stock-note";
  note.textContent = text;
  cell.appendChild(note);
}

function renderCart() {
  cartBody.innerHTML = "";

  if (viewLines.length === 0) {
    cartBody.innerHTML =
      '<tr><td colspan="6">Giỏ hàng đang trống. Hãy chọn một sản phẩm để bắt đầu.</td></tr>';
    cartQuantityEl.textContent = "0";
    cartTotalEl.textContent = formatVND(0);
    setPayEnabled(false);
    return;
  }

  let totalQuantity = 0;
  let totalMoney = 0;

  viewLines.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    const inStock = item.available && item.quantity <= item.stock;
    if (inStock) {
      totalQuantity += item.quantity;
      totalMoney += lineTotal;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td></td>
      <td>${item.available ? formatVND(item.price) : "-"}</td>
      <td class="qty-cell">
        <button class="btn-qty" data-id="${item.productId}" data-delta="-1"
          ${!item.available || item.quantity <= 1 ? "disabled" : ""}>−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="btn-qty" data-id="${item.productId}" data-delta="1"
          ${!item.available || item.quantity >= item.stock ? "disabled" : ""}>+</button>
      </td>
      <td>${inStock ? formatVND(lineTotal) : "-"}</td>
      <td>
        <button class="btn-delete" data-id="${item.productId}">Xóa</button>
      </td>
    `;
    const productCell = tr.children[1];
    productCell.className = "product-cell";

    if (item.image) {
      const img = document.createElement("img");
      img.className = "product-thumb";
      img.src = item.image;
      img.alt = "";
      img.loading = "lazy";
      productCell.appendChild(img);
    }

    const info = document.createElement("div");
    const nameEl = document.createElement("div");
    nameEl.className = "product-name";
    nameEl.textContent = item.name || item.productId;
    info.appendChild(nameEl);
    productCell.appendChild(info);

    if (item.available && item.stock === 0) {
      appendNote(info, "Đã hết hàng");
    } else if (item.available && item.quantity > item.stock) {
      appendNote(info, `Chỉ còn ${item.stock} sản phẩm`);
    } else if (item.available && item.stock <= LOW_STOCK) {
      appendNote(info, `Còn ${item.stock} sản phẩm`);
    }

    cartBody.appendChild(tr);
  });

  cartQuantityEl.textContent = totalQuantity;
  cartTotalEl.textContent = formatVND(totalMoney);
  setPayEnabled(totalQuantity > 0);
}

let writing = false; // blocks overlapping writes to the same cart document

async function onCartBodyClick(e) {
  const qtyBtn = e.target.closest(".btn-qty");
  if (qtyBtn) return changeQuantity(qtyBtn);

  const btn = e.target.closest(".btn-delete");
  if (!btn) return;

  const productId = btn.getAttribute("data-id");
  const ref = cartRef();
  if (!ref || writing) return;

  writing = true;
  btn.disabled = true;
  try {
    const remaining = cartLines.filter((p) => p.productId !== productId);
    await ref.update({
      products: remaining,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    cartLines = remaining;
    viewLines = viewLines.filter((p) => p.productId !== productId);
    renderCart();
  } catch (err) {
    console.error("Delete item failed:", err);
    alert("Không xóa được sản phẩm. Vui lòng thử lại.");
    btn.disabled = false;
  } finally {
    writing = false;
  }
}

async function changeQuantity(btn) {
  const productId = btn.getAttribute("data-id");
  const delta = Number(btn.getAttribute("data-delta"));
  const ref = cartRef();
  if (!ref || writing) return;

  const line = cartLines.find((p) => p.productId === productId);
  const view = viewLines.find((p) => p.productId === productId);
  if (!line || !view) return;

  const previous = line.quantity || 1;
  const next = previous + delta;
  if (next < 1) return; // use Xóa to remove the last one
  if (delta > 0 && next > view.stock) {
    alert(`Chỉ còn ${view.stock} sản phẩm trong kho.`);
    return;
  }

  line.quantity = next;
  view.quantity = next;
  renderCart();

  writing = true;
  try {
    await ref.update({
      products: cartLines,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("Update quantity failed:", err);
    line.quantity = previous;
    view.quantity = previous;
    renderCart();
    alert("Không cập nhật được số lượng. Vui lòng thử lại.");
  } finally {
    writing = false;
  }
}

function setPayEnabled(enabled) {
  const payBtn = document.getElementById("btn-pay");
  if (payBtn) payBtn.disabled = !enabled;
}

async function checkout() {
  const user = firebase.auth().currentUser;
  if (!user) {
    alert("Vui lòng đăng nhập để thanh toán.");
    return;
  }
  if (cartLines.length === 0) return;

  const payBtn = document.getElementById("btn-pay");
  payBtn.disabled = true;

  try {
    const ref = db.collection("carts").doc(user.uid);

    await db.runTransaction(async (tx) => {
      // All reads must happen before any write inside a transaction.
      const cartSnap = await tx.get(ref);
      const lines = cartSnap.exists ? cartSnap.data().products || [] : [];
      if (lines.length === 0) throw new Error("EMPTY_CART");

      const productSnaps = await Promise.all(
        lines.map((line) => tx.get(db.collection("product").doc(line.productId)))
      );

      const items = [];
      const stockWrites = [];
      const shortages = [];
      let total = 0;

      productSnaps.forEach((snap, i) => {
        if (!snap.exists) return; // skip products removed from the catalogue
        const data = snap.data();
        const quantity = lines[i].quantity || 1;
        const price = data.price || 0;
        const stock = data.stock || 0;

        if (quantity > stock) {
          shortages.push(`${data.name}: còn ${stock}, cần ${quantity}`);
          return;
        }

        items.push({
          productId: lines[i].productId,
          name: data.name,
          price: price,
          image: data.image || "",
          category: data.category || "",
          quantity: quantity,
        });
        total += price * quantity;
        stockWrites.push({ ref: snap.ref, remaining: stock - quantity });
      });

      if (shortages.length > 0) {
        const err = new Error("OUT_OF_STOCK");
        err.shortages = shortages;
        throw err;
      }
      if (items.length === 0) throw new Error("EMPTY_CART");

      stockWrites.forEach((w) => tx.update(w.ref, { stock: w.remaining }));

      tx.set(db.collection("orders").doc(), {
        userId: user.uid,
        products: items,
        total: total,
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      tx.update(ref, {
        products: [],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });

    cartLines = [];
    viewLines = [];
    renderCart();
    alert("Đặt hàng thành công.");
  } catch (err) {
    console.error("Checkout failed:", err);
    if (err.message === "OUT_OF_STOCK") {
      alert("Số lượng trong kho đã thay đổi:\n" + err.shortages.join("\n"));
      await loadCart(); // pull fresh stock so the table matches the database
      return;
    }
    alert("Thanh toán không thành công. Vui lòng thử lại.");
    payBtn.disabled = false;
  }
}

function init() {
  cartBody = document.getElementById("cart-items");
  cartQuantityEl = document.getElementById("cart-quantity");
  cartTotalEl = document.getElementById("cart-total");

  if (!cartBody || !cartQuantityEl || !cartTotalEl) {
    console.warn("cart.js: cart table not found on this page.");
    return;
  }

  cartBody.addEventListener("click", onCartBodyClick);

  const payBtn = document.getElementById("btn-pay");
  if (payBtn) payBtn.addEventListener("click", checkout);

  firebase.auth().onAuthStateChanged(() => loadCart());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}