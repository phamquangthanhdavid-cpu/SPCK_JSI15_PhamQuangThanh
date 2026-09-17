document.addEventListener("DOMContentLoaded", function () {
  var login = document.getElementById("login");
  var register = document.getElementById("register");
  var logout = document.getElementById("logout");
  var userDropdown = document.getElementById("user-dropdown");
  var cartButton = document.getElementById("btn-cart");

  var emailInput = document.getElementById("user-email-input");
  var userNameInput = document.getElementById("user-name-input");
  var userPhoneInput = document.getElementById("user-phone-input");
  var userAddressInput = document.getElementById("user-address-input");

  var editProfileBtn = document.getElementById("edit-profile-btn");
  var saveProfileBtn = document.getElementById("save-profile-btn");
  var cancelProfileBtn = document.getElementById("cancel-profile-btn");

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

      LoadUserInfor(user);
    } else {
      login.style.display = "inline-block";
      register.style.display = "inline-block";
      userDropdown.style.display = "none";
      cartButton.style.display = "none";
    }
  }

  editProfileBtn.addEventListener("click", function () {
    InputControl(true)
  });

  cancelProfileBtn.addEventListener("click", function () {
    ResetValidationStates();
    var user = firebase.auth().currentUser;
    LoadUserInfor(user);
    InputControl(false);
  });

  saveProfileBtn.addEventListener("click", async function () {
    ResetValidationStates();
    var isValid = true;
    var nameValue = userNameInput.value;
    var phoneValue = userPhoneInput.value;
    var addressValue = userAddressInput.value;

    if (nameValue === "") {
      userNameInput.classList.add("is-invalid");
      isValid = false;
    }

    if (phoneValue === "") {
      userPhoneInput.classList.add("is-invalid");
      isValid = false;
    }

    if (addressValue === "") {
      userAddressInput.classList.add("is-invalid");
      isValid = false;
    }

    if (isValid === false) {
      return;
    }

    var user = firebase.auth().currentUser;
    //Cập nhật thông tin user
    var docRef = db.collection("users").where("uid", "==", user.uid).limit(1);
    var querySnapshot = await docRef.get();
    querySnapshot.forEach(async (doc) => {
      // Update the document with new values
      await doc.ref.update({
        fullname: nameValue,
        phone: phoneValue,
        address: addressValue,
      });
    });

    alert("Đã cập nhật thông tin!");
    InputControl(false);

  });

  function InputControl(isEditing) {
    userNameInput.disabled = !isEditing;
    userPhoneInput.disabled = !isEditing;
    userAddressInput.disabled = !isEditing;
    saveProfileBtn.style.display = isEditing ? "inline-block" : "none";
    cancelProfileBtn.style.display = isEditing ? "inline-block" : "none";
    editProfileBtn.style.display = isEditing ? "none" : "inline-block";
  }

  function ResetValidationStates() {
    userNameInput.classList.remove("is-invalid");
    userPhoneInput.classList.remove("is-invalid");
    userAddressInput.classList.remove("is-invalid");
  }

  function LoadUserInfor(user) {
    db.collection("users")
      .where("uid", "==", user.uid)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          emailInput.value = user.email || "";
          userNameInput.value = userData.fullname || "";
          userPhoneInput.value = userData.phone || "";
          userAddressInput.value = userData.address || "";
        }
      });
  }
});
