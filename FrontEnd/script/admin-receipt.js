function formatVND(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND";
}

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return "Đang cập nhật";
  return timestamp.toDate().toLocaleString("vi-VN");
}

var STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

document.addEventListener("DOMContentLoaded", function () {
  var receiptList = document.getElementById("receipt-list");
  var receiptMessage = document.getElementById("receipt-message");
  var receiptCount = document.getElementById("receipt-count");
  var printReceiptArea = document.getElementById("print-receipt");

  loadReceipts();

  // Tai danh sach hoa don
  function loadReceipts() {
    db.collection("orders").get().then(function (snapshot) {
      if (snapshot.empty) {
        receiptMessage.textContent = "Chưa có hóa đơn nào.";
        return;
      }

      receiptMessage.textContent = "";
      receiptCount.textContent = snapshot.size + " hóa đơn";

      var rows = snapshot.docs.map(function (doc) {
        var order = doc.data();
        var status = STATUS_LABELS[order.status] || order.status || "-";
        return `
          <tr>
            <td>#${doc.id.slice(0, 8).toUpperCase()}</td>
            <td>${order.userId || "-"}</td>
            <td>${formatVND(order.total)}</td>
            <td>${status}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
              <div class="d-flex gap-1">
                <button type="button" class="btn btn-warning btn-sm btn-status" data-id="${doc.id}" data-status="pending">Pending</button>
                <button type="button" class="btn btn-danger btn-sm btn-status" data-id="${doc.id}" data-status="cancelled">Cancel</button>
                <button type="button" class="btn btn-primary btn-sm btn-print-receipt" data-id="${doc.id}"><i class="fa-solid fa-print"></i> Print</button>
              </div>
            </td>
          </tr>`;
      }).join("");

      receiptList.innerHTML = `
        <table class="table table-striped align-middle bg-white">
          <thead>
            <tr><th>Receipt</th><th>User</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).catch(function (error) {
      console.error("Load receipts failed:", error);
      receiptMessage.textContent = "Không tải được danh sách hóa đơn.";
    });
  }

  // Xu ly click: in hoa don hoac doi trang thai
  receiptList.addEventListener("click", function (event) {
    var printButton = event.target.closest(".btn-print-receipt");
    if (printButton) {
      printReceipt(printButton.dataset.id);
      return;
    }

    var statusButton = event.target.closest(".btn-status");
    if (!statusButton) return;

    statusButton.disabled = true;
    db.collection("orders").doc(statusButton.dataset.id).update({
      status: statusButton.dataset.status,
    }).then(function () {
      window.location.reload();
    }).catch(function (error) {
      console.error("Update receipt status failed:", error);
      statusButton.disabled = false;
      alert("Không thể cập nhật trạng thái hóa đơn.");
    });
  });

  // Lay hoa don tu Firestore, ve vao vung in roi mo hop thoai in
  function printReceipt(orderId) {
    db.collection("orders").doc(orderId).get().then(function (doc) {
      if (!doc.exists) {
        alert("Không tìm thấy hóa đơn.");
        return;
      }
      renderReceipt(doc);
      window.print();
    }).catch(function (error) {
      console.error("Print receipt failed:", error);
      alert("Không in được hóa đơn. Vui lòng thử lại.");
    });
  }

  // Ve mau hoa don vao #print-receipt
  function renderReceipt(doc) {
    var order = doc.data();
    var products = order.products || [];
    var status = STATUS_LABELS[order.status] || order.status || "-";

    var rows = products.map(function (item, index) {
      var quantity = item.quantity || 1;
      var price = Number(item.price) || 0;
      return `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${item.name || item.productId}</td>
          <td class="text-end">${formatVND(price)}</td>
          <td class="text-center">${quantity}</td>
          <td class="text-end">${formatVND(price * quantity)}</td>
        </tr>`;
    }).join("");

    printReceiptArea.innerHTML = `
      <div class="receipt">
        <div class="receipt-header">
          <h1>LaptopStore</h1>
          <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p>Hotline: 0123456789</p>
        </div>

        <div class="receipt-title">Hóa đơn bán hàng</div>

        <div class="receipt-info">
          <p><strong>Mã hóa đơn:</strong> #${doc.id.slice(0, 8).toUpperCase()}</p>
          <p><strong>Ngày:</strong> ${formatDate(order.createdAt)}</p>
          <p><strong>Khách hàng:</strong> ${order.userId || "-"}</p>
          <p><strong>Trạng thái:</strong> ${status}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th class="text-center">STT</th>
              <th>Sản phẩm</th>
              <th class="text-end">Đơn giá</th>
              <th class="text-center">SL</th>
              <th class="text-end">Thành tiền</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="receipt-total">Tổng cộng: ${formatVND(order.total)}</div>

        <div class="receipt-thanks">Cảm ơn quý khách đã mua hàng!</div>
      </div>`;
  }
});
