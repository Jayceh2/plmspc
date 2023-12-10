function openForm() {
    var overlay = document.getElementById("overlay2");
    
    overlay.classList.remove("hidden");
    document.getElementById("add-subject").style.display = "block";
}

function closeForm() {
    var overlay = document.getElementById("overlay2");

    overlay.classList.add("hidden");
    document.getElementById("add-subject").style.display = "none";
}

var searchField = document.querySelector('#search-field');

searchField.addEventListener('keyup', (event) => {
    var searchQuery = document.querySelector('#search-field').value;

    if (searchQuery.length >= 3) {
        var searchResults = subjects.filter(subject => {
            for (const key in subject) {
              if (subject.hasOwnProperty(key) && typeof subject[key] === 'string') {
                if (subject[key].toLowerCase().includes(searchQuery.toLowerCase())) {
                  return true;
                }
              }
            }
            return false;
          });
          
          console.log(searchResults);
    }
});