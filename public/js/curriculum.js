function submitForm() {
    const checklistContainer = document.querySelector('.checklistContainer');

    const semesterContainers = checklistContainer.querySelectorAll('.dragContainer');

    const formData = {
        degree: document.getElementById('degree').value,
        year: document.getElementById('year').value,
        years: []
    }

    semesterContainers.forEach(semesterContainer => {
        const yearLevel = semesterContainer.id.charAt(0).toUpperCase().charCodeAt(0) - 64;
    
        // Check if yearLevel already exists in formData.years
        const existingYearIndex = formData.years.findIndex(year => year.yearLevel === yearLevel);
    
        if (existingYearIndex !== -1) {
            // Year level already exists, update the semester data
            const semesterData = {
                subjects: [],
                units: parseInt(semesterContainer.querySelector('span').textContent)
            };
    
            const subjects = semesterContainer.querySelectorAll('.draggable');
    
            subjects.forEach(subject => {
                semesterData.subjects.push(subject.id);
            });
    
            formData.years[existingYearIndex].semesters.push(semesterData);
        } else {
            // Year level does not exist, create a new yearData object
            const yearData = {
                yearLevel: yearLevel,
                semesters: [{
                    subjects: [],
                    units: parseInt(semesterContainer.querySelector('span').textContent)
                }]
            };
    
            const subjects = semesterContainer.querySelectorAll('.draggable');
    
            subjects.forEach(subject => {
                yearData.semesters[0].subjects.push(subject.id);
            });
    
            formData.years.push(yearData);
        }
    });
    

    // Send the form data as a POST request
    fetch('/dashboard/curriculum/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(data => {
        // Check the response data for custom messages
        if (data && data.message === "This curriculum is already added.") {
            // Display an error message to the user or handle it as needed
            createMessage(data.message);
        } else {
            // Redirect the browser to the desired page
            window.location.href = '/dashboard/curriculum';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function validateForm() {
    const form = document.getElementById("curriculumForm");

    if(form.reportValidity()) {
        closePopup('createCurriculum');
    }
}

function handleFocusClose() {
        focusOutClose('subjectList', false);
}