var btnLogin = document.getElementById("btn-login");

btnLogin.addEventListener("click", function () {
  var username = document.getElementById("username").value.trim();
  var password = document.getElementById("password").value;
  var users = JSON.parse(localStorage.getItem("users")) || [];

  if (username === "" || password === "") {
    alert("Please enter username and password.");
    return;
  }

  var userLogin = users.find(function (user) {
    return user.username === username && user.password === password;
  });

  if (!userLogin) {
    alert("Username or password is incorrect.");
    return;
  }

  localStorage.setItem("userLoggedIn", JSON.stringify(userLogin));
  alert("Login success!");
  window.location.href = "./home.html";
});
