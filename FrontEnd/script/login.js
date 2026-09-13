document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      db.collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            localStorage.setItem("userProfile", JSON.stringify(userData));
          } else {
            console.error("No such document!");
          }
        })
        .catch((error) => {
          console.error("Error getting document:", error);
        });

      window.location.href = "./home.html"; // Redirect to home page or dashboard
    }
  });

  const btnLogin = document.getElementById("btn-login");
  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault(); //Ngăn cho form submit lại trang
    const email = document.getElementById("txt-email").value.trim();
    const password = document.getElementById("txt-password").value.trim();

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        alert("Login successful! Welcome back.");
        // Optionally, redirect to home page or dashboard
        window.location.href = "./home.html"; // Change this to your desired page
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        alert("Error logging in. Please check your email and password.");
      });
  });
});
