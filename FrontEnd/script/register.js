document.addEventListener("DOMContentLoaded", () => {
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    window.location.href = "home.html";
  }

  const btnSignUp = document.getElementById("registerBtn");
  btnSignUp.addEventListener("click", async (e) => {
    e.preventDefault(); //Ngăn cho form submit lại trang
    let isValid = true;

    //Lấy dữ liệu từ form
    const fullName = document.getElementById("txt-fullname");
    const phoneNumber = document.getElementById("txt-phonenumber");
    const address = document.getElementById("txt-address");
    const email = document.getElementById("txt-email");
    const password = document.getElementById("txt-password");
    const confirmPassword = document.getElementById("txt-confirm-password");

    const emailFeedback = document.getElementById("email-feedback");
    const passwordFeedback = document.getElementById("password-feedback");
    const confirmPasswordFeedback = document.getElementById(
      "confirm-password-feedback",
    );

    // Reset validation states
    fullName.classList.remove("is-invalid");
    phoneNumber.classList.remove("is-invalid");
    address.classList.remove("is-invalid");
    email.classList.remove("is-invalid");
    password.classList.remove("is-invalid");
    confirmPassword.classList.remove("is-invalid");

    emailFeedback.textContent = "Email is required.";
    passwordFeedback.textContent = "Password is required.";
    confirmPasswordFeedback.textContent = "Confirm password is required.";

    if (fullName.value.trim() === "") {
      fullName.classList.add("is-invalid");
      isValid = false;
    }

    if (phoneNumber.value.trim() === "") {
      phoneNumber.classList.add("is-invalid");
      isValid = false;
    }

    if (address.value.trim() === "") {
      address.classList.add("is-invalid");
      isValid = false;
    }

    if (email.value.trim() === "") {
      email.classList.add("is-invalid");
      isValid = false;
    }

    if (password.value.trim() === "") {
      password.classList.add("is-invalid");
      isValid = false;
    }

    if (confirmPassword.value.trim() === "") {
      confirmPassword.classList.add("is-invalid");
      isValid = false;
    }

    if (password.value.length < 6) {
      password.classList.add("is-invalid");
      passwordFeedback.textContent =
        "Password must be at least 6 characters long.";
      isValid = false;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.classList.add("is-invalid");
      confirmPasswordFeedback.textContent = "Passwords do not match.";
      isValid = false;
    }

    if (!isValid) {
      return; // Stop the function if validation fails
    }

    //Kiểm tra email đã tồn tại chưa
    console.log("Checking if email exists:", email.value);

    const methods = await firebase
      .auth()
      .fetchSignInMethodsForEmail(email.value.trim())
      .catch((error) => {
        console.error(error);
        alert("Error checking email. Please try again.");
        return [];
      });

    if (methods.length > 0) {
      email.classList.add("is-invalid");
      emailFeedback.textContent = "Email is already in use.";
      return; // dừng luôn hàm hiện tại
    }

    const userCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(email.value.trim(), password.value)
      .catch((error) => {
        console.error(error);
        alert("Error signing up. Please try again.");
        return null;
      });

    if (userCredential) {
      var user = userCredential.user;
      db.collection("users").add({
        uid: user.uid,
        email: email.value.trim(),
        fullname: fullName.value.trim(),
        phone: phoneNumber.value.trim(),
        address: address.value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      window.location.href = "home.html";
    } else {
      alert("Sign up failed. Please try again.");
      return;
    }
  });
});
