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
        <thead><tr><th>Receipt</th><th>User</th><th>Total</th><th>Status</th><th>Date</th><th>Print</th></tr></thead>
        <tbody>${snapshot.docs.map(function (doc) {
          var order = doc.data();
          var date = order.createdAt && order.createdAt.toDate
            ? order.createdAt.toDate().toLocaleString("vi-VN") : "Đang cập nhật";
          return `<tr><td>#${doc.id.slice(0, 8).toUpperCase()}</td><td>${order.userId || "-"}</td><td>${Number(order.total || 0).toLocaleString("vi-VN")} VND</td><td><div class="d-flex gap-1"><button type="button" class="btn btn-warning btn-sm btn-status" data-id="${doc.id}" data-status="pending">Pending</button><button type="button" class="btn btn-danger btn-sm btn-status" data-id="${doc.id}" data-status="cancelled">Cancel</button></div></td><td>${date}</td><td><button type="button" class="btn btn-primary btn-print-receipt" data-id="${doc.id}"><i class="fa-solid fa-print"></i> Print</button></td></tr>`;
        }).join("")}</tbody>
      </table>`;
  }).catch(function (error) {
    console.error("Load receipts failed:", error);
    receiptMessage.textContent = "Không tải được danh sách receipt.";
  });

  receiptList.addEventListener("click", function (event) {
    var printButton = event.target.closest(".btn-print-receipt");
    if (printButton) window.print();

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
      alert("Không thể cập nhật trạng thái receipt.");
    });
  });
});
