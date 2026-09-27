document.addEventListener("DOMContentLoaded", function () {
  var emailInput = document.getElementById("user-email-input");
  var userNameInput = document.getElementById("user-name-input");
  var userPhoneInput = document.getElementById("user-phone-input");
  var userAddressInput = document.getElementById("user-address-input");

  var editProfileBtn = document.getElementById("edit-profile-btn");
  var saveProfileBtn = document.getElementById("save-profile-btn");
  var cancelProfileBtn = document.getElementById("cancel-profile-btn");

  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) return;
    emailInput.value = user.email || "";
    LoadUserInfor(user);
  });

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
    var nameValue = userNameInput.value.trim();
    var phoneValue = userPhoneInput.value.trim();
    var addressValue = userAddressInput.value.trim();

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
    if (!user) return;

    saveProfileBtn.disabled = true;
    try {
      await db.collection("user").doc(user.uid).set({
        email: user.email,
        name: nameValue,
        adress: addressValue,
        "phone-number": phoneValue,
      }, { merge: true });

      alert("Đã cập nhật thông tin!");
      InputControl(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      saveProfileBtn.disabled = false;
    }

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
    db.collection("user")
      .doc(user.uid)
      .get()
      .then((doc) => {
        const userData = doc.exists ? doc.data() : {};
        emailInput.value = user.email || userData.email || "";
        userNameInput.value = userData.name || "";
        userPhoneInput.value = userData["phone-number"] || "";
        userAddressInput.value = userData.adress || "";
      })
      .catch((error) => {
        console.error("Error loading user profile:", error);
        alert("Không thể tải thông tin cá nhân.");
      });
  }
});
