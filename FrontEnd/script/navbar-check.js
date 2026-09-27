document.addEventListener("DOMContentLoaded", () => {
  var login = document.getElementById("login");
  var register = document.getElementById("register");
  var logout = document.getElementById("logout");
  var userDropdown = document.getElementById("user-dropdown");
  var cartButton = document.getElementById("btn-cart");

  if (logout) logout.addEventListener("click", function () {
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
    if (!user) {
        if (window.location.pathname === "/FrontEnd/admin.html" || window.location.pathname === "/FrontEnd/admin-receipt.html" || window.location.pathname === "/FrontEnd/user-profile.html")
            window.location.href = "./login.html";
        else 
            return;
    }
    if (user.email == "admin@quangthanh.com" && window.location.pathname !== "/FrontEnd/admin.html" && window.location.pathname !== "/FrontEnd/admin-receipt.html") {
      window.location.href = "./admin.html";
    }
    showAuthButtons(user);
  });

  function showAuthButtons(user) {
    if (user) {
      if (login) login.style.display = "none";
      if (register) register.style.display = "none";
      if (userDropdown) userDropdown.style.display = "inline-block";
      if (cartButton) cartButton.style.display = "inline-block";
      var userName = document.getElementById("user-name");
      if (userName) userName.textContent = user.email;
    } else {
      if (login) login.style.display = "inline-block";
      if (register) register.style.display = "inline-block";
      if (userDropdown) userDropdown.style.display = "none";
      if (cartButton) cartButton.style.display = "none";
    }
  }
});
