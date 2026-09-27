document.addEventListener("DOMContentLoaded", function () {
  var receiptList = document.getElementById("receipt-list");
  var receiptMessage = document.getElementById("receipt-message");
  var receiptCount = document.getElementById("receipt-count");

  db.collection("orders").get().then(function (snapshot) {
    if (snapshot.empty) {
      receiptMessage.textContent = "Chưa có hóa đơn nào.";
      return;
    }

    receiptMessage.textContent = "";
    receiptCount.textContent = snapshot.size + " receipt(s)";
    receiptList.innerHTML = `
      <table class="table table-striped align-middle bg-white">
        <thead><tr><th>Receipt</th><th>User</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${snapshot.docs.map(function (doc) {
          var order = doc.data();
          var date = order.createdAt && order.createdAt.toDate
            ? order.createdAt.toDate().toLocaleString("vi-VN") : "Đang cập nhật";
          return `<tr><td>#${doc.id.slice(0, 8).toUpperCase()}</td><td>${order.userId || "-"}</td><td>${Number(order.total || 0).toLocaleString("vi-VN")} VND</td><td>${order.status || "pending"}</td><td>${date}</td></tr>`;
        }).join("")}</tbody>
      </table>`;
  }).catch(function (error) {
    console.error("Load receipts failed:", error);
    receiptMessage.textContent = "Không tải được danh sách receipt.";
  });
});
