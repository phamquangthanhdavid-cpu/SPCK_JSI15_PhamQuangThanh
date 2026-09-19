let orderList, orderMessage, orderCount;

const STATUS = {
  pending: { label: "Chờ xác nhận", css: "bg-warning text-dark" },
  confirmed: { label: "Đã xác nhận", css: "bg-info text-dark" },
  shipping: { label: "Đang giao", css: "bg-primary" },
  completed: { label: "Hoàn thành", css: "bg-success" },
  cancelled: { label: "Đã hủy", css: "bg-secondary" },
};

function formatVND(value) {
  return (value || 0).toLocaleString("vi-VN") + " VND";
}

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return "Đang cập nhật";
  return timestamp.toDate().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showMessage(text) {
  orderMessage.textContent = text;
  orderMessage.classList.remove("d-none");
}

function hideMessage() {
  orderMessage.classList.add("d-none");
}

function itemRow(item) {
  const quantity = item.quantity || 1;
  const price = item.price || 0;
  const thumb = item.image
    ? `<img class="order-thumb me-3" src="${escapeHtml(item.image)}" alt="" loading="lazy">`
    : "";

  return `
    <tr>
      <td class="d-flex align-items-center">
        ${thumb}
        <div>
          <div>${escapeHtml(item.name || item.productId)}</div>
          ${item.category ? `<small class="text-secondary">${escapeHtml(item.category)}</small>` : ""}
        </div>
      </td>
      <td class="text-end">${formatVND(price)}</td>
      <td class="text-center">${quantity}</td>
      <td class="text-end">${formatVND(price * quantity)}</td>
    </tr>
  `;
}

function orderCard(doc, index) {
  const order = doc.data();
  const products = order.products || [];
  const status = STATUS[order.status] || {
    label: order.status || "Không rõ",
    css: "bg-secondary",
  };
  const itemCount = products.reduce((n, p) => n + (p.quantity || 1), 0);
  const shortId = doc.id.slice(0, 8).toUpperCase();

  return `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button ${index === 0 ? "" : "collapsed"}" type="button"
          data-bs-toggle="collapse" data-bs-target="#order-${doc.id}"
          aria-expanded="${index === 0}">
          <div class="d-flex flex-wrap align-items-center gap-3 w-100 pe-3">
            <span class="order-id">#${shortId}</span>
            <span class="text-secondary small">${formatDate(order.createdAt)}</span>
            <span class="badge ${status.css}">${escapeHtml(status.label)}</span>
            <span class="ms-auto fw-semibold">${formatVND(order.total)}</span>
          </div>
        </button>
      </h2>
      <div id="order-${doc.id}" class="accordion-collapse collapse ${index === 0 ? "show" : ""}"
        data-bs-parent="#order-list">
        <div class="accordion-body">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th class="text-end">Giá</th>
                <th class="text-center">Số lượng</th>
                <th class="text-end">Tổng</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(itemRow).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"></td>
                <td class="text-center fw-semibold">${itemCount}</td>
                <td class="text-end fw-semibold">${formatVND(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `;
}


async function loadOrders(user) {
  if (!user) {
    orderList.innerHTML = "";
    orderCount.textContent = "";
    showMessage("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
    return;
  }

  showMessage("Đang tải đơn hàng...");

  try {
    const snap = await db
      .collection("orders")
      .where("userId", "==", user.uid)
      .get();

    const docs = snap.docs.sort((a, b) => {
      const at = a.data().createdAt;
      const bt = b.data().createdAt;
      return (bt ? bt.toMillis() : 0) - (at ? at.toMillis() : 0);
    });

    if (docs.length === 0) {
      orderList.innerHTML = "";
      orderCount.textContent = "";
      showMessage("Bạn chưa có đơn hàng nào.");
      return;
    }

    orderList.innerHTML = docs.map(orderCard).join("");
    orderCount.textContent = `${docs.length} đơn hàng`;
    hideMessage();
  } catch (err) {
    console.error("Load orders failed:", err);
    orderList.innerHTML = "";
    orderCount.textContent = "";
    showMessage("Không tải được lịch sử đơn hàng. Vui lòng tải lại trang.");
  }
}

function init() {
  orderList = document.getElementById("order-list");
  orderMessage = document.getElementById("order-message");
  orderCount = document.getElementById("order-count");

  if (!orderList || !orderMessage) return;

  firebase.auth().onAuthStateChanged((user) => loadOrders(user));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}