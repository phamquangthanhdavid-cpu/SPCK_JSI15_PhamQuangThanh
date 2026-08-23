var registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", function() {
    
    var username = document.getElementById("txt-username").value.trim();
    var email = document.getElementById("txt-email").value.trim();
    var password = document.getElementById("txt-password").value;
    var confirmPassword = document.getElementById("txt-confirm-password").value;
    
    if(username.length < 6)
        alert("Username must be at least 6 characters long.");
    if(username.includes(" "))
        alert("Username cannot contain spaces.");

    // if(email.includes("@") === false || email.includes(".") === false)
    if(!email.includes("@") || !email.includes("."))
        alert("Please enter a valid email address.");

    var lowercaseRegex = /[a-z]/g;
    var uppercaseRegex = /[A-Z]/g;
    var numberRegex = /[0-9]/g;

    if(password.length < 8)
        alert("Password must be at least 8 characters long.");
    
    else if(password.match(lowercaseRegex) === null)
        alert("Password must contain at least one lowercase letter.");

    else if(password.match(uppercaseRegex) === null)
        alert("Password must contain at least one uppercase letter.");

    else if(password.match(numberRegex) === null)
        alert("Password must contain at least one number.");

    else if(password !== confirmPassword)
        alert("Password and Confirm Password do not match.");

    else {
        var users = localStorage.getItem("users");
        if(users == null) {
            users = [];
            users.push({
                username: username,
                email: email,
                password: password
            });
            localStorage.setItem("users", JSON.stringify(users));
        }
        else {
            users = JSON.parse(users);
            var isUserExists = false;
            users.forEach(element => {
                if(element.username === username) {
                    alert("Username already exists. Please choose a different username.");
                    isUserExists = true;
                    return;
                }
            });
            if(isUserExists) return;
            users.push({
                username: username,
                email: email,
                password: password
            });
            localStorage.setItem("users", JSON.stringify(users));
            
        }
        alert("Account created successfully!");
        window.location.href = "/login.html";
    }

});