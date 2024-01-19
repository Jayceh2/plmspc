function generateChecklist() {

    for (let i = 0; i < checklist.years.length; i++) {
        generateSchoolYear('checklist');
        
        addSubjects(checklist.years[i].semesters[0].subjects, 1, i);
        addSubjects(checklist.years[i].semesters[1].subjects, 2, i);
        addSubjects(checklist.years[i].semesters[2].subjects, 3, i);
    }
}

function generateSchoolYear(container) {
    container = document.querySelector('.' + container);
    if (yearCount > 6) {
      createMessage("Year limit reached.");
      return;
    }
  
    const semesterLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const semesterNumbers = ['1', '2', '3'];
    const year = checklist.years[yearCount-1];
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

      let GWA_VALUE = 0;
      let TOTAL_UNITS = 0;
      semesters[i].subjects.forEach(subject => {
          if (subject.approved && subject.subject.includeInGWA) {
              GWA_VALUE += subject.subject.units * subject.grade;
              TOTAL_UNITS += subject.subject.units;
          }
      })
      GWA_VALUE /= TOTAL_UNITS;
  
      const h4 = document.createElement("h4");
      h4.textContent = semesters[i].units + " Units · GWA: " + (isNaN(GWA_VALUE) ? 'N/A' : GWA_VALUE.toFixed(2));
      div.appendChild(h4);

      // if (semesters[i].subjects.length < 0) { div add class hidden
      console.log(div.id, semesters[i].subjects.length)
      if (semesters[i].subjects.length == 0) {
        div.classList.add("hidden");
        }
  
      if (semesterCount === 3) {
        semesterCount = 1;
        yearCount++;
      } else {
        semesterCount++;
      }
  
      containerCount++;
    }
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
    if (subjects?.subject) {
        const subjectContainer = document.getElementById(year + semester);

        for (let subject of subjects) {
            const div = document.createElement("div");
            div.classList.add("draggable");
            div.id = subject.subject.code;
            div.grade = subject.grade;
            div.yearTaken = subject.yearTaken;
            div.semesterTaken = subject.semesterTaken;
            div.schoolAttended = subject.schoolAttended;
            subjectContainer.appendChild(div);

            const h5 = document.createElement("h5");
            h5.textContent = subject.subject.code + ": " + subject.subject.name;
            subject.appendChild(h5);

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
            if (subject.subject.coRequisite.length > 0) {
                corequisite = "Corequisite: ";
                for (let coreq of subject.subject.coRequisite) {
                    for (let sub of subjectsLibrary)  {
                        if (sub._id == coreq) {
                            corequisite += sub.code + " ";
                        }
                    }
                }
            }
            p.textContent = subject.subject.units + " Unit" + (subject.subject.units > 1 ? "s " : "") + (prerequisite ? " | " : "") + prerequisite + ( corequisite ? " | " : "") + corequisite;
            subject.appendChild(p);
        }
    } else {
        const subjectContainer = document.getElementById(year + semester);

        if(!subjects) {
           return;
        }

        for (let subject of subjects) {

            const div = document.createElement("div");
            div.classList.add("draggable");
            div.id = subject.subject.code;
            div.grade = subject.grade;
            div.yearTaken = subject.yearTaken;
            div.semesterTaken = subject.semesterTaken;
            div.schoolAttended = subject.schoolAttended;
            if (subject.approved) {
                div.classList.add("approved");
            } else if (subject.pending) {
                div.classList.add("pending");
            } else if (subject.rejected) {
                div.classList.add("rejected");
            }
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
            h5.textContent = subject.subject.code + ": " + subject.subject.name;
            div.appendChild(h5);

            if (subject.approved || subject.pending) {
                const p1 = document.createElement("p");
                p1.textContent = "Grade: " + subject.grade + " | Taken at " + (subject.schoolAttended == "Other" ? "other university" : subject.schoolAttended) + " during " + subject.yearTaken + " " + subject.semesterTaken;
                div.appendChild(p1);
            }
            
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
            if (subject.subject.coRequisite.length > 0) {
                corequisite = "Corequisite: ";
                for (let coreq of subject.subject.coRequisite) {
                    for (let sub of subjectsLibrary)  {
                        if (sub._id == coreq) {
                            corequisite += sub.code + " ";
                        }
                    }
                }
            }
            p.textContent = subject.subject.units + " Unit" + (subject.subject.units > 1 ? "s " : "") + (prerequisite ? " | " : "") + prerequisite + ( corequisite ? " | " : "") + corequisite;
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
    document.getElementById('grade').value = target.grade;
    document.getElementById('year').value = target.yearTaken;
    document.getElementById('semesterTaken').value = target.semesterTaken;
    document.getElementById('schoolAttended').value = target.schoolAttended;
}