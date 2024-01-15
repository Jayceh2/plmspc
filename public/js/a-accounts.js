function updatePreview() {
    document.getElementById('sprefix').innerText = document.getElementById('facultyPrefix').value !== "" ? document.getElementById('facultyPrefix').value + ". " : "";
    document.getElementById('sfirstName').innerText = document.getElementById('firstName').value;
    document.getElementById('smiddleInitial').innerText = document.getElementById('middleInitial').value !== "" ? document.getElementById('middleInitial').value + "." : "";
    document.getElementById('slastName').innerText = document.getElementById('lastName').value;
    document.getElementById('ssuffix').innerText = document.getElementById('suffix').value !== "" ? ", " + document.getElementById('suffix').value : "";
    document.getElementById('sposition').innerText = document.getElementById('facultyPosition').value;
    document.getElementById('sdepartment').innerText = document.getElementById('facultyDepartment').value.split(" - ")[1];
    document.getElementById('scollege').innerText = document.getElementById('facultyCollege').value.split(" - ")[1];
    document.getElementById('susername').innerText = document.getElementById('username').value;

    document.getElementById('confirmUsername').value = document.getElementById('username').value;
    document.getElementById('confirmPassword').value = document.getElementById('password').value;
}

function validateForm() {
    const form = document.getElementById("facultyForm");
    const readonlyforms = document.querySelectorAll('[readonly][required]');

    var hasUnfilled = false;

    for (let readonlyform of readonlyforms) {
        if (readonlyform.value === "") {
            hasUnfilled = true;
        }
    }

    if(form.reportValidity() && !hasUnfilled) {
        closePopup('createAccount', false);
        openPopup('preview');
        genPassword();
        updatePreview();
    } else {
        createMessage('Please fill up all required fields!');
    }
}

function filterDegrees(event) {
    const degree = "deg" + event.target.id;
    const degreeContainer = document.getElementById('degreesInput');
    const degreeOptions = document.querySelectorAll('.degreeOption');

    degreeContainer.classList.remove('hidden');
    setInputValue('facultyDepartment', '')

    for (let degreeOption of degreeOptions) {
        degreeOption.classList.add('hidden');
    }

    for (let degreeOption of degreeOptions) {
        if (degreeOption.id === degree) {
            degreeOption.classList.remove('hidden');
        }
    }
}

function copyBoth() {
    var bothText = 'Username: ' + document.getElementById('confirmUsername').value + ' Password: ' + document.getElementById('confirmPassword').value;
        
    var input2 = document.createElement('input');
    input2.setAttribute('value', bothText);
    document.body.appendChild(input2);
    
    input2.select();
    input2.setSelectionRange(0, 99999); 
    
    document.execCommand('copy');
    
    document.body.removeChild(input2);

    createMessage('Copied both to clipboard!');
}

function copyToClipboard(text) {
    var input = document.createElement('input');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    
    input.select();
    input.setSelectionRange(0, 99999);
    
    document.execCommand('copy');
    
    document.body.removeChild(input);
    
    createMessage('Copied to clipboard!');
}