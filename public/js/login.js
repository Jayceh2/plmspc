function togglePassword() {
    var passwordField = document.getElementById("password");
    var eyeIcon = document.getElementById("eye");
    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.src = "/img/password_hide.png";
    } else {
        passwordField.type = "password";
        eyeIcon.src = "/img/password_unhide.png";
    }
  }