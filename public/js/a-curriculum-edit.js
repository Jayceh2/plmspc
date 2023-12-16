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

function generateStudyPlan() {
    for (let i = 0; i < studyplan.years.length; i++) {
        generateSchoolYear('studyplan');
        
        addSubjects(studyplan.years[i].semesters[0].subjects, 1, i);
        addSubjects(studyplan.years[i].semesters[1].subjects, 2, i);
        addSubjects(studyplan.years[i].semesters[2].subjects, 3, i);
    }

    countUnits();

    const draggables = document.querySelectorAll('.draggable');
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
}

function generateSchoolYear(container) {
    container = document.querySelector('.' + container);
    if (yearCount > 6) {
      createMessage("Year limit reached.");
      return;
    }
  
    const semesterLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const semesterNumbers = ['1', '2', '3'];
    const year = studyplan.years[yearCount-1];
    const semesters = year.semesters;
  
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
      const span2 = document.createElement("span");
      span2.textContent = "/" + semesters[i].units;
      span2.id = "maxUnits";
      h4.appendChild(document.createTextNode("Total Units: "));
      h4.appendChild(span);
        h4.appendChild(span2);
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

function addSubjects(subjects, semester, year) {
    switch (year) {
        case 0:
            year = 'A';
            break;
        case 1:
            year = 'B';
            break;
        case 2:
            year = 'C';
            break;
        case 3:
            year = 'D';
            break;
        case 4:
            year = 'E';
            break;
        case 5:
            year = 'F';
            break;
    }
    if (subjects) {
        const subjectContainer = document.getElementById(year + semester);

        for (let subject of subjects) {
            const div = document.createElement("div");
            div.classList.add("draggable");
            div.id = subject.code;
            div.draggable = true;
            var semList = "" 
            if (subject.sem1) semList += "1|"
            if (subject.sem2) semList += "2|"
            if (subject.summer) semList += "3"
            const preReq = subject.preRequisite.map(obj => obj.code).join(', '); 
            const coReq = subject.coRequisite.map(obj => obj.code).join(', '); 
            div.setAttribute("data-preReq", preReq);
            div.setAttribute("data-coReq", coReq);
            div.setAttribute("data-semList", semList);
            div.setAttribute("data-units", subject.units);
            subjectContainer.appendChild(div);

            const h5 = document.createElement("h5");
            h5.textContent = subject.code + ": " + subject.name;
            div.appendChild(h5);

            const p = document.createElement("p");
            p.textContent = subject.units;
            div.appendChild(p);
        }
    } else {
        const subjectContainer = document.getElementById(year + semester);

        if(!subjects) {
           return;
        }

        for (let subject of subjects) {

            const div = document.createElement("div");
            div.classList.add("draggable");
            div.id = subject.code;
            div.addEventListener('click', function(event) {
                let target = event.target;
                if (target === h5 || target === p) {
                  target = div; // Set the target to the parent div
                }
                
                // Now you can use the updated target as needed
                setSubjectInfo(target);
                openPopup('checklistInfo');
              });
            
            subjectContainer.appendChild(div);

            const h5 = document.createElement("h5");
            h5.textContent = subject.code + ": " + subject.name;
            div.appendChild(h5);
            
            const p = document.createElement("p");
            p.textContent = subject.units;
            div.appendChild(p);
        }
    }
}

function setSubjectInfo(target) {
    let subjectChecklist = document.getElementById('checklistInfo')

    document.getElementById('subjectCode').value = target.id
    var yearLevel = target.parentElement.id[0]
    yearLevel = yearLevel.charCodeAt(0)
    switch (yearLevel) {
        case 'A':
            yearLevel = 1;
            break;
        case 'B':
            yearLevel = 2;
            break;
        case 'C':
            yearLevel = 3;
            break;
        case 'D':
            yearLevel = 4;
            break;
        case 'E':
            yearLevel = 5;
            break;
        case 'F':
            yearLevel = 6;
            break;
    }
    var semester = target.parentElement.id[1]
    switch (semester) {
        case '1':
            semester = 1;
            break;
        case '2':
            semester = 2;
            break;
        case '3':
            semester = 3;
            break;
    }
    document.getElementById('yearLevel').value = yearLevel
    subjectChecklist.querySelector('h1').textContent = target.querySelector('h5').textContent;
}