function toggleDropdown() {
    var dropdown = document.getElementById("dropdown");
    var overlay = document.getElementById("overlay");
    if (dropdown.classList.contains("hidden")) {
        dropdown.classList.remove("hidden");
        overlay.classList.remove("hidden");
    } else {
        dropdown.classList.add("hidden");
        overlay.classList.add("hidden");
    }
  }

overlay.addEventListener("click", toggleDropdown);