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
            var prerequisite = "";
            if (subject.preRequisite.length > 0) {
                prerequisite = "Prerequisite: ";
                for (let prereq of subject.preRequisite) {
                    for (let sub of subjectsLibrary)  {
                        if (sub._id == prereq) {
                            prerequisite += sub.code + " ";
                        }
                    }
                }
            }
            var corequisite = "";
            if (subject.coRequisite.length > 0) {
                corequisite = "Corequisite: ";
                for (let coreq of subject.coRequisite) {
                    for (let sub of subjectsLibrary)  {
                        if (sub._id == coreq) {
                            corequisite += sub.code + " ";
                        }
                    }
                }
            }
            p.textContent = subject.units + " Unit" + (subject.units > 1 ? "s " : "") + (prerequisite ? " | " : "") + prerequisite + ( corequisite ? " | " : "") + corequisite;
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
            var prerequisite = "";
            if (subject.subject.preRequisite.length > 0) {
                prerequisite = "Prerequisite: ";
                for (let prereq of subject.subject.preRequisite) {
                    for (let sub of subjectsLibrary)  {
                        if (sub._id == prereq) {
                            prerequisite += sub.code + " ";
                        }
                    }
                }
            }
            var corequisite = "";
            if (subject.coRequisite.length > 0) {
                corequisite = "Corequisite: ";
                for (let coreq of subject.coRequisite) {
                    for (let sub of subjectsLibrary)  {
                        if (sub._id == coreq) {
                            corequisite += sub.code + " ";
                        }
                    }
                }
            }
            p.textContent = subject.units + " Unit" + (subject.units > 1 ? "s " : "") + (prerequisite ? " | " : "") + prerequisite + ( corequisite ? " | " : "") + corequisite;
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