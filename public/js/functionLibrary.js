let yearCount = 1;
let semesterCount = 1;
let containerCount = 1;

// LIGHT MODE TO DARK MODE
//Pre-render Dark Mode
var root = document.documentElement;
var body = document.body;

if (lightMode) {
    document.getElementById('themeToggleText').textContent = 'Enable Dark Mode';
    document.getElementById('themeToggleIcon').src = '/img/darkmode.svg';

    body.classList.remove('dark-mode');
    root.style.setProperty('--bgLight', '#F1F1F1');
    root.style.setProperty('--headerLight', '#F1F1F1E6');
    root.style.setProperty('--itemLight', '#FFFFFF');
    root.style.setProperty('--tableLight', '#F5F5F5');
    root.style.setProperty('--hoverLight', '#E0E0E0');
    root.style.setProperty('--lineLight', '#E3E3E3');
    root.style.setProperty('--textLight', '#000000');
    resetImageFilters('icon');

} else {
    document.getElementById('themeToggleText').textContent = 'Disable Dark Mode';
    document.getElementById('themeToggleIcon').src = '/img/lightmode.svg';

    body.classList.add('dark-mode');
    root.style.setProperty('--bgLight', '#000000');
    root.style.setProperty('--headerLight', '#0E0E0EE6');
    root.style.setProperty('--itemLight', '#161616');
    root.style.setProperty('--tableLight', '#202020');
    root.style.setProperty('--hoverLight', '#202020');
    root.style.setProperty('--lineLight', '#E3E3E3');
    root.style.setProperty('--textLight', '#FFFFFF');
    applyImageFilter('icon', 'invert(100%)');
}

//Function
function toggleTheme(event) {
    event.preventDefault(); // Prevent the default link behavior
  
    // Send a POST request to update the lightMode property
    fetch('/dashboard/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({})
    })
    .then(response => {
        if (response.ok) {
          // Toggle the dark mode locally
  
        if (body.classList.contains('dark-mode')) {
            document.getElementById('themeToggleText').textContent = 'Enable Dark Mode';
            document.getElementById('themeToggleIcon').src = '/img/darkmode.svg';

            body.classList.remove('dark-mode');
            root.style.setProperty('--bgLight', '#F1F1F1');
            root.style.setProperty('--headerLight', '#F1F1F1E6');
            root.style.setProperty('--itemLight', '#FFFFFF');
            root.style.setProperty('--tableLight', '#F5F5F5');
            root.style.setProperty('--hoverLight', '#E0E0E0');
            root.style.setProperty('--lineLight', '#E3E3E3');
            root.style.setProperty('--textLight', '#000000');
            resetImageFilters('icon');
        
        } else {
            document.getElementById('themeToggleText').textContent = 'Disable Dark Mode';
            document.getElementById('themeToggleIcon').src = '/img/lightmode.svg';

            body.classList.add('dark-mode');
            root.style.setProperty('--bgLight', '#000000');
            root.style.setProperty('--headerLight', '#0E0E0EE6');
            root.style.setProperty('--itemLight', '#161616');
            root.style.setProperty('--tableLight', '#202020');
            root.style.setProperty('--hoverLight', '#202020');
            root.style.setProperty('--lineLight', '#E3E3E3');
            root.style.setProperty('--textLight', '#FFFFFF');
            applyImageFilter('icon', 'invert(100%)');
        }
        } else {
          console.log('Error toggling dark mode');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
  
//Convert Image to Light Mode
function resetImageFilters(className) {
    var images = document.querySelectorAll('img.' + className);
    images.forEach(function (image) { image.style.filter = 'none'; });
}
  
//Convert Image to Dark Mode
function applyImageFilter(className, filterValue) {
    var images = document.querySelectorAll('img.' + className);
    images.forEach(function (image) { image.style.filter = filterValue; });
}

//Open popup
function openPopup(popup, noOverlay = false) {
    if (!noOverlay) {
        document.getElementById('overlayDiv').classList.remove('hidden');
    }
    document.getElementById(popup).classList.remove('hidden');
}

//Close popup
function closePopup(popup, secondPopup = true) {
    if (secondPopup) {
        document.getElementById('overlayDiv').classList.add('hidden');
    }
    document.getElementById(popup).classList.add('hidden');
}

//Show hidden div via input
function showHiddenDiv(input, inputs, div) {
    const element = document.getElementById(input);
    const elementDiv = document.getElementById(div);

    for (let input of inputs) {
        if (element.value === input) {
            elementDiv.classList.remove('hidden');
            break; 
        } else {
            elementDiv.classList.add('hidden');
        }
    }
}

//Show Message Popup
function showMessage() {
    const message = document.getElementById('message');
    if(message) {
    message.classList.add('fade-in');
  
    setTimeout(() => {
        message.classList.remove('fade-in');;
    }, 2000);
    }
}
showMessage();

//Create Message
function createMessage(messageText) {
    if(document.getElementById('message')) {
        document.getElementById('message').remove();
    }
    const message = document.createElement("h3");
    message.textContent = messageText;
    message.classList.add("message");
    message.id = "message";

    document.querySelector("header").appendChild(message);
    showMessage();
}

//Submit data for viewing
function submitData(data, url) {
    window.location.href = `${url}?data=${encodeURIComponent(data)}`;
}

//Redirect to url
function redirectTo(url) {
    window.location.href = url;
}

//Focus out close popup
function focusOutClose(popup, secondPopup = true) {
    const checkMouseUp = () => {
        if (!document.mouseIsUp) {
            setTimeout(checkMouseUp, 100);
            return;
        }
      
        closePopup(popup, secondPopup);
    };
  
    document.addEventListener('mousedown', () => document.mouseIsUp = false);
    document.addEventListener('mouseup', () => document.mouseIsUp = true);
    
    checkMouseUp();
}
  

//Set the value of the input field
function setInputValue(id, value) {
    document.getElementById(id).value = value;
    document.getElementById(id).dispatchEvent(new Event('input'));
}

// Put the selected value in the input field
function addInputValue(inputContainer, inputField, event, prefix) {
    const elementContainer = document.getElementById(inputContainer);
    const elementField = document.getElementById(inputField);
    const eventDiv = event.target;
  
    const childCount = elementContainer.childElementCount;
  
    if (childCount < 5) {
        document.getElementById(inputField + "Hidden").value += `${eventDiv.textContent}, `;

        eventDiv.classList.add('selectedContent');
        eventDiv.classList.remove('option');
        eventDiv.onclick = null;
        const originalParent = eventDiv.parentElement.parentElement;

        eventDiv.title = eventDiv.textContent;
        eventDiv.textContent = eventDiv.id.slice(prefix.length);

        const removeButton = document.createElement('img');
        removeButton.src = '/img/remove.svg';
        removeButton.classList.add('removeButton');
        removeButton.onclick = () => {
            removeInputValue(originalParent, inputContainer, inputField, event);
        };
        
        eventDiv.append(removeButton);
        elementContainer.classList.remove('hidden');
        elementContainer.append(eventDiv);
    
        const eventWidth = eventDiv.offsetWidth;
        const currentPadding = parseInt(getComputedStyle(elementField).paddingLeft);
        const newPadding = currentPadding + eventWidth;
    
        elementField.style.paddingLeft = `${newPadding}px`;
        elementField.style.width = `calc(100% - ${newPadding}px)`;
    } else {
        createMessage('You can only select up to 5 items.');
    }
}

// Remove the selected value from the input field
function removeInputValue(originalParent, inputContainer, inputField, event) {
    eventDiv = event.target;
    const elementContainer = eventDiv.parentElement;
    const elementField = document.getElementById(inputField);
    const eventWidth = eventDiv.offsetWidth;

    const hiddenInput = document.getElementById(inputField + "Hidden");
    const hiddenInputValue = hiddenInput.value;
    const eventText = eventDiv.title;
    const newValue = hiddenInputValue.replace(`${eventText}, `, '');
    hiddenInput.value = newValue;

    eventDiv.removeChild(eventDiv.querySelector('.removeButton'));
    eventDiv.classList.add('option');
    eventDiv.classList.remove('selectedContent');

    eventDiv.textContent = eventDiv.title;
    eventDiv.title = '';
  
    const originalDiv = originalParent.querySelector('.scrollable');
    originalDiv.appendChild(eventDiv);
    
    setTimeout(() => {
        eventDiv.onclick = () => {
            addInputValue(inputContainer, inputField, event);
        };
    }, 100);

    if (elementContainer.childElementCount === 0) {
        elementContainer.classList.add('hidden');
    }
  
    const currentPadding = parseInt(getComputedStyle(elementField).paddingLeft);
    const newPadding = currentPadding - eventWidth;
  
    elementField.style.paddingLeft = `${newPadding}px`;
    elementField.style.width = `calc(100% - ${newPadding}px)`;
}
  
//Retrive the value of the input field for updating
function setSelectOptions(items, inputField, inputContainer, prefix) {
    items = JSON.parse(items);
  
    const elementContainer = document.getElementById(inputContainer);
    const elementField = document.getElementById(inputField);
  
    for (let item of items) {
        const eventDiv = document.getElementById(prefix + item);
    
        const isRemoveButtonPresent = eventDiv.querySelector('.removeButton');
        if (isRemoveButtonPresent) {
            continue; // Skip to the next iteration if a remove button is already present
        }
  
        document.getElementById(inputField + "Hidden").value += `${eventDiv.textContent}, `;
    
        eventDiv.classList.add('selectedContent');
        eventDiv.classList.remove('option');
        eventDiv.onclick = null;
        const originalParent = eventDiv.parentElement.parentElement;

        
        eventDiv.title = eventDiv.textContent;
        eventDiv.textContent = eventDiv.id.slice(prefix.length);
    
        var removeButton = document.createElement('img');
        removeButton.src = '/img/remove.svg';
        removeButton.classList.add('removeButton');
    
        const event = { target: eventDiv };
        (function (event) {
            removeButton.onclick = () => {
                removeInputValue(originalParent, inputContainer, inputField, event);
            };
        })(event);
  
        eventDiv.append(removeButton);
        elementContainer.classList.remove('hidden');
        elementContainer.append(eventDiv);
    
        const eventWidth = eventDiv.offsetWidth;
        const currentPadding = parseInt(getComputedStyle(elementField).paddingLeft);
        const newPadding = currentPadding + eventWidth;
    
        elementField.style.paddingLeft = `${newPadding}px`;
        elementField.style.width = `calc(100% - ${newPadding}px)`;
    }
}
  
  

//Toggle true/false
function toggleBoolean(id, checkItem) {
    const element = document.getElementById(id);
    const checkbox = document.getElementById(checkItem);
    if (element.value === 'true') {
        element.value = 'false';
        if(lightMode){
            checkbox.style.backgroundColor = '#FFFFFF';
            checkbox.style.color = "black";
        } else {
            checkbox.style.backgroundColor = '#161616';
            checkbox.style.color = "white";
        }
    } else {
        element.value = 'true';
        checkbox.style.backgroundColor = '#AC2929';
        checkbox.style.color = "white";
    }
}


//Generate Password
function genPassword() {
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz@$!\"#%*?&`^-()_=+{}[]|;:',.>/ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var passwordLength = 8;
    var password = "";
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!-#%*?&`^\-\(\)_=+\{\}\[\]|;:',.>\/])[A-Za-z\d@$!-#%*?&`^\-\(\)_=+\{\}\[\]|;:',.>\/]{8,8}$/;

    while(!pattern.test(password)) {
        for (var i = 0; i < passwordLength; i++) {
            randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.substring(randomNumber, randomNumber +1);
        }
        if(!pattern.test(password)) {
            password = "";
        }
    }

    document.getElementById("password").value = password;
}

//Search
function search(filterInput1, items1, parentNum = 0) {
    const filterInput = document.getElementById(filterInput1);
  
    filterInput.addEventListener('input', function() {
        const filterText = this.value.toLowerCase();
      
        const items = document.querySelectorAll(items1);
  
        items.forEach(item => {
            let element = item;
            for (let j = 0; j < parentNum; j++) {
                element = element.parentElement;
            if (!element) break;
        }
  
        if (element) {
            if (item.textContent.toLowerCase().includes(filterText)) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
      }
    });
  });
}
  

//DRAG AND DROP FUNCTIONALITY
var dragDropMessage;
const draggables = document.querySelectorAll('.draggable');
const containers = document.querySelectorAll('.dragContainer');
const mainContainer = document.querySelector('.mainContainer');

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
    })

    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging')
        countUnits();
        dragDropMessage ? createMessage(dragDropMessage) : null;
    })
})

mainContainer.addEventListener('dragover', e => {
    e.preventDefault();
    dragDropMessage = null;
    const draggable = document.querySelector('.dragging');
    const text = '';

    if (!checkPreRequisitesAfter(draggable.id, text)) {
        return;
    }

    document.querySelector('.mainDragContainer').prepend(draggable);
    addCoRequisites(draggable, document.querySelector('.mainDragContainer'));
})

containers.forEach(container => {
    container.addEventListener('dragover', e => {
        e.preventDefault()
        const afterElement = getDragAfterElement(container, e.clientY)
        const draggable = document.querySelector('.dragging')
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    })
})

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}


//Add School Year
function addSchoolYear(container) {
    container = document.querySelector('.' + container);
    if (yearCount > 6) {
      createMessage("Year limit reached.");
      return;
    }
  
    const semesterLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const semesterNumbers = ['1', '2', '3'];
  
    for (let i = 0; i < 3; i++) {
      const semesterLetter = semesterLetters[Math.floor((containerCount - 1) / 3) % semesterLetters.length];
      const semesterNumber = semesterNumbers[i];
  
      const div = document.createElement("div");
      div.classList.add("dragContainer");
      div.id = semesterLetter + semesterNumber;
      container.appendChild(div);
  
      const h3 = document.createElement("h3");
      h3.textContent = `${ordinalSuffix(yearCount)} Year - ${semesterName(semesterCount)}`;
      div.appendChild(h3);
  
      const h4 = document.createElement("h4");
      const span = document.createElement("span");
      span.textContent = "0";
      h4.appendChild(document.createTextNode("Total Units: "));
      h4.appendChild(span);
      div.appendChild(h4);
  
      if (semesterCount === 3) {
        semesterCount = 1;
        yearCount++;
      } else {
        semesterCount++;
      }
  
      containerCount++;
    }
  
    const containers = document.querySelectorAll('.dragContainer');
    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault()
            const afterElement = getDragAfterElement(container, e.clientY)
            const draggable = document.querySelector('.dragging')
            const semList = draggable.getAttribute("data-semList").split("|").filter(Boolean);
            const text = container.id;

            const includesSubstring = semList.some(substring => text.includes(substring));

            if (!includesSubstring) {
                dragDropMessage = "You can't add this subject on this semester.";
                return;
            }

            if (!checkPreRequisitesBefore(draggable.getAttribute("data-preReq").split(",").map(item => item.trim()).filter(Boolean), text)) {
                return;
            }

            if (!checkPreRequisitesAfter(draggable.id, text)) {
                return;
            }

            if (afterElement == null) {
                dragDropMessage = null;
                container.appendChild(draggable);
                addCoRequisites(draggable, container);
            } else {
                dragDropMessage = null;
                container.insertBefore(draggable, afterElement);
                addCoRequisites(draggable, container);
            }
        })
    })
}

//Add subjects that is co-requisite of the subject being added
function addCoRequisites(draggable, container) {
    const coRequisites = draggable.getAttribute("data-coReq").split(",").map(item => item.trim()).filter(Boolean);
    if (coRequisites.length === 0) {
        return;
    }

    for (let coReq of coRequisites) {
        const element = document.getElementById(coReq);
        container.insertBefore(element, draggable.nextSibling);
    }
}
    

//True if follows the pre-requisites
function checkPreRequisitesBefore(preRequisites, containerId) {
    if (preRequisites.length === 0) {
        return true;
    }

    for (let preReq of preRequisites) {
        const element = document.getElementById(preReq);
        if(element.parentElement.id == '') {
            dragDropMessage = "Add the pre-requisite " + preReq + " first.";
            return false;
        }

        if (element.parentElement.id > containerId) {
            dragDropMessage = "You can't add this subject before " + preReq + ".";
            return false;
        } else if (element.parentElement.id === containerId) {
            dragDropMessage = "You can't add this subject on the same semester as " + preReq + ".";
            return false;
        }
    }

    return true;
}

function checkPreRequisitesAfter(subjectId, containerId) { 
    const hasPreRequisiteSubjects = document.querySelectorAll(`[data-preReq*="${subjectId}"]`);
    if (hasPreRequisiteSubjects.length === 0) {
        return true;
    }

    let placedAPreRequisite = false;

    for (let subject of hasPreRequisiteSubjects) {
        if (subject.parentElement.id == '') {
            continue;
        }

        placedAPreRequisite = true;

        if (subject.parentElement.id < containerId) {
            dragDropMessage = "You can't add this subject after " + subject.id + ".";
            return false;
        } else if (subject.parentElement.id === containerId) {
            dragDropMessage = "You can't add this subject on the same semester as " + subject.id + ".";
            return false;
        }

    }

    if (containerId === '' && placedAPreRequisite) {
        dragDropMessage = "You can't remove this subject because it is a pre-requisite of another subject.";
        return false;
    }
     
    return true;
}

function ordinalSuffix(number) {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod100 = number % 100;
  const mod10 = number % 10;
  const suffix = suffixes[(mod10 < 4 && (mod100 < 11 || mod100 > 13)) * mod10];
  return number + suffix;
}

function semesterName(count) {
  if (count === 1) {
    return "1st Semester";
  } else if (count === 2) {
    return "2nd Semester";
  } else if (count === 3) {
    return "Summer";
  }
} 

//Function to count the units in each semester
function countUnits() {
    const semesters = document.querySelectorAll('.dragContainer');
    
    for (let semester of semesters) {
        var unitCount = 0;
         const units = semester.querySelectorAll('.draggable');
        for (let unit of units) {
            if (unit.getAttribute('data-includeingwa') == 'true') {
            unitCount += parseFloat(unit.getAttribute('data-units'))
            }
        }
        semester.querySelector('span').textContent = unitCount;
    }
}

