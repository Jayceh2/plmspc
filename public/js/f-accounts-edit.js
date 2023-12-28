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

function validateForm() {
    const form = document.getElementById("studentForm");

    if(form.reportValidity()) {
        openPopup('preview');
        updatePreview();
    }
}

function updatePreview() {
    document.getElementById('sfirstName').textContent = document.getElementById('firstName').value;
    document.getElementById('smiddleInitial').innerText = document.getElementById('middleInitial').value !== "" ? document.getElementById('middleInitial').value + "." : "";
    document.getElementById('slastName').textContent = document.getElementById('lastName').value;
    document.getElementById('susername').textContent = document.getElementById('username').value;
    document.getElementById('ssuffix').innerText = document.getElementById('suffix').value !== "" ? ", " + document.getElementById('suffix').value : "";
    document.getElementById('sstudentType').textContent = document.getElementById('studentType').value;
    document.getElementById('sdegree').textContent = document.getElementById('studentDegree').value.split(" - ")[1];

    document.getElementById('confirmUsername').value = document.getElementById('username').value;
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

function filterYearLevel (event) {
    const year = "year" + event.target.id;
    const yearLevelContainer = document.getElementById('studentYearLevelInput');
    const yearLevelOptions = document.querySelectorAll('.yearLevelOption');

    yearLevelContainer.classList.remove('hidden');
    setInputValue('studentYearLevel', '')

    for (let yearLevelOption of yearLevelOptions) {
        yearLevelOption.classList.add('hidden');
    }

    for (let yearLevelOption of yearLevelOptions) {
        if (yearLevelOption.id === year) {
            yearLevelOption.classList.remove('hidden');
        }
    }
}