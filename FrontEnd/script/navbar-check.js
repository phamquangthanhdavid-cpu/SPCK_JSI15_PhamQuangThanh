document.addEventListener("DOMContentLoaded", () => {
  var login = document.getElementById("login");
  var register = document.getElementById("register");
  var logout = document.getElementById("logout");
  var userDropdown = document.getElementById("user-dropdown");
  var cartButton = document.getElementById("btn-cart");

  logout.addEventListener("click", function () {
    firebase
      .auth()
      .signOut()
      .then(function () {
        alert("Đăng xuất thành công!");
      })
      .catch(function (error) {
        console.error("Error signing out:", error);
        alert("Đăng xuất thất bại. Vui lòng thử lại!");
      });
  });

  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) window.location.href = "./login.html";
    if (user.email == "admin@quangthanh.com") {
      window.location.href = "./admin.html";
    }
    showAuthButtons(user);
  });

  function showAuthButtons(user) {
    if (user) {
      login.style.display = "none";
      register.style.display = "none";
      userDropdown.style.display = "inline-block";
      cartButton.style.display = "inline-block";
      document.getElementById("user-name").textContent = user.email;
    } else {
      login.style.display = "inline-block";
      register.style.display = "inline-block";
      userDropdown.style.display = "none";
      cartButton.style.display = "none";
    }
  }
});
