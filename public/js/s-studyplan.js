function generateStudyPlan() {
    for (let i = 0; i < studyplan.years.length; i++) {
        generateSchoolYear('studyplan');
        
        addSubjects(studyplan.years[i].semesters[0].subjects, 1, i);
        addSubjects(studyplan.years[i].semesters[1].subjects, 2, i);
        addSubjects(studyplan.years[i].semesters[2].subjects, 3, i);
    }
    countUnits();
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
            const text = container.id;
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
            var semList = "" 
            if (subject.sem1) semList += "1|"
            if (subject.sem2) semList += "2|"
            if (subject.summer) semList += "3"
            var preReq = "";
            if (subject.preRequisite.length > 0) {
                for (let prereq of subject.preRequisite) {
                    for (let sub of subjectsLibrary)  {
                        if (sub._id == prereq) {
                            preReq += sub.code + ", ";
                        }
                    }
                }
            }
            var coReq = "";
            if (subject.coRequisite.length > 0) {
                for (let coreq of subject.coRequisite) {
                    for (let sub of subjectsLibrary)  {
                        if (sub._id == coreq) {
                            coReq += sub.code + ", ";
                        }
                    }
                }
            }
            div.setAttribute("data-preReq", preReq);
            div.setAttribute("data-coReq", coReq);
            div.setAttribute("data-semList", semList);
            div.setAttribute("data-units", subject.units);
            div.setAttribute("data-includeingwa", subject.includeInGWA)
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

// Function to generate and open the PDF
function generatePDF() {

    var basePath = window.location.href;
    basePath = basePath.substring(0, basePath.lastIndexOf("/")); // Assuming images are in the same folder as HTML

    // Define the document content with the default font, center alignment, and 1-inch margin
    var docDefinition = {
      content: [
        { text: 'Pamantasan ng Lungsod ng Maynila', fontSize: 10, alignment: 'center' },
        { text: 'College of Engineering', fontSize: 10, alignment: 'center' },
        { text: 'Computer Engineering Department', fontSize: 10, alignment: 'center' },
        { text: 'APPROVED STUDY PLAN', fontSize: 12, bold: true, alignment: 'center', margin: [0, 20, 0, 20] },
        {
        // Use the columns property to create two columns
        columns: [
            // First column
            {
            width: '70%',
            text: [
                {text: 'Name: ' + studentInfo.firstName + ' ' + studentInfo.middleInitial + '. ' + studentInfo.lastName +'\n', fontSize: 10},
                {text: 'Approval Date: ' + checklist.approvalDate + '\n', fontSize: 10},
                {text: 'Faculty in Charge: ' + checklist.approvedBy.firstName + ' ' + checklist.approvedBy.middleInitial + '. ' + checklist.approvedBy.lastName, fontSize: 10}
            ],
            margin: [0, 0, 0, 10]
            },
            // Second column
            {
            width: '50%',
            text: [
                {text: 'Student Type: '+ studentInfo.studentType + '\n', fontSize: 10},
                {text: 'Curriculum: ' + studentInfo.studentCurriculum.year + '\n', fontSize: 10},
                {text: 'Student No: ' + studentInfo.username , fontSize: 10}
            ]
            }
        ],
        // Other layout properties
        layout: 'noBorders'
        },
      ],
      margin: [72, 72, 72, 72]
    };
  
    // Iterate over years and semesters
    for (const year of checklist.years) {
        let sem = 1;
        for (const semester of year.semesters) {
            if (semester.subjects.length == 0) {  continue; }  // Skip empty semesters
            // Add semester information to the document
            docDefinition.content.push(
                { text: `${ordinalSuffix(year.yearLevel)} Year: ${ordinalSuffix(sem++)} Semester`, fontSize: 12, bold: true, alignment: 'left', margin: [0, 20, 0, 0] },
                { text: `${countUnitsStudyPlan(semester.subjects)}/${semester.units} Units`, fontSize: 10, alignment: 'left', margin: [0, 0, 0, 5] },
                // ... (continue adding other details based on your design)
            );

            // Add subjects to the table
            const subjectsTable = {
                table: {
                    widths: ['11.5%', '50%', '6%', '32.5%'],
                    body: [
                        [
                        { text: 'CODE', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center' }, 
                        { text: 'COURSE TITLE', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center' }, 
                        { text: 'UNITS', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center' },
                        { text: 'PRE(CO) REQUISITES', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center'}
                    ],
                        // ... (add rows based on the subjects in the current semester)
                    ],
                    layout: 'noBorders'
                }
            };

            semester.subjects.forEach(subject => {
                subjectsTable.table.body.push([
                    { text: subject.code, fontSize: 10, border: [0, 0, 0, 1], alignment: 'center' },
                    { text: subject.name, fontSize: 10, border: [0, 0, 0, 1], alignment: 'center' },
                    { text: subject.includeInGWA ? subject.units.toString() : '(' + subject.units.toString() + ')', fontSize: 10, border: [0, 0, 0, 1], alignment: 'center' },
                    { text: listRequisites(subject.preRequisite, subject.coRequisite), fontSize: 10, border: [0, 0, 0, 1], alignment: 'center'}
                ]);
            });

            docDefinition.content.push(subjectsTable);
        }
    }
  
    // Create and open the PDF
    pdfMake.createPdf(docDefinition).open();
}

// Attach the function to the button click event
document.getElementById('generatePdfButton').addEventListener('click', generatePDF);

// Function to get ordinal suffix for a number
function ordinalSuffix(num) {
    const j = num % 10,
        k = num % 100;
    if (j === 1 && k !== 11) {
        return num + "st";
    }
    if (j === 2 && k !== 12) {
        return num + "nd";
    }
    if (j === 3 && k !== 13) {
        return num + "rd";
    }
    return num + "th";
}

// Count units of approved subjects in a semester
function countUnitsStudyPlan(subjects) {
    let UNITS = 0;
    subjects.forEach(subject => {
        if (subject.includeInGWA) {
            UNITS += parseInt(subject.units);
        }
    })

    return UNITS;
}

function validateForm() {
    // Add your validation logic here
    var grade = document.getElementById('grade').value;
    var year = document.getElementById('year').value;
    var semesterTaken = document.getElementById('semesterTaken').value;
    var schoolAttended = document.getElementById('schoolAttended').value;

    // Example: Check if any of the required fields is empty
    if (grade === "" || year === "" || semesterTaken === "" || schoolAttended === "") {
        alert("Please fill in all required fields.");
        return false; // Prevent form submission
    }

    // If all validations pass, you can allow the form to be submitted
    return true;
}

//List pre/co-requisites
function listRequisites(preRequisites, coRequisites) {
    var preReq = "";
    if (preRequisites.length > 0) {
        for (let prereq of preRequisites) {
            for (let sub of subjectsLibrary)  {
                if (sub._id == prereq) {
                    preReq += sub.code + ", ";
                }
            }
        }
    }
    var coReq = "";
    if (coRequisites.length > 0) {
        for (let coreq of coRequisites) {
            for (let sub of subjectsLibrary)  {
                if (sub._id == coreq) {
                    coReq += "(" + sub.code + "), ";
                }
            }
        }
    }
    return (preReq + coReq).slice(0, -2);
}