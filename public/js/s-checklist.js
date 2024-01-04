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
        { text: 'SUBJECT CHECKLIST', fontSize: 12, bold: true, alignment: 'center', margin: [0, 20, 0, 20] },
        {
        // Use the columns property to create two columns
        columns: [
            // First column
            {
            width: '70%',
            text: [
                {text: 'Name: ' + studentInfo.firstName + ' ' + studentInfo.middleInitial + '. ' + studentInfo.lastName +'\n', fontSize: 10},
                {text: 'Student No: ' + studentInfo.username , fontSize: 10}
            ],
            margin: [0, 0, 0, 10]
            },
            // Second column
            {
            width: '50%',
            text: [
                {text: 'Student Type: '+ studentInfo.studentType + '\n', fontSize: 10},
                {text: 'Curriculum: ' + studentInfo.studentCurriculum.year + '\n', fontSize: 10}
            ]
            }
        ],
        // Other layout properties
        layout: 'noBorders'
        }
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
                { text: `${countUnitsChecklist(semester.subjects)}/${semester.units} | GWA: ${calculateGWA(semester.subjects)}`, fontSize: 10, alignment: 'left', margin: [0, 0, 0, 5] },
                // ... (continue adding other details based on your design)
            );

            // Add subjects to the table
            const subjectsTable = {
                table: {
                    widths: ['15%', '50%', '7.5%', '7.5%', '20%'],
                    body: [
                        [
                        { text: 'CODE', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center' }, 
                        { text: 'COURSE TITLE', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center' }, 
                        { text: 'UNITS', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center' }, 
                        { text: 'GRADE', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center' }, 
                        { text: 'SCHOOL TAKEN', fontSize: 10, bold: true, border: [0, 0, 0, 1], alignment: 'center' }
                    ],
                        // ... (add rows based on the subjects in the current semester)
                    ],
                    layout: 'noBorders'
                }
            };

            semester.subjects.forEach(subject => {
                subjectsTable.table.body.push([
                    { text: subject.subject.code, fontSize: 10, border: [0, 0, 0, 1], alignment: 'center' },
                    { text: subject.subject.name, fontSize: 10, border: [0, 0, 0, 1], alignment: 'center' },
                    { text: subject.subject.includeInGWA ? subject.subject.units.toString() : '(' + subject.subject.units.toString() + ')', fontSize: 10, border: [0, 0, 0, 1], alignment: 'center' },
                    { text: subject.approved ? subject.grade || '' : '', fontSize: 10, border: [0, 0, 0, 1], alignment: 'center' },
                    { text: subject.approved ? subject.schoolAttended || '' : '', fontSize: 10, border: [0, 0, 0, 1], alignment: 'center' },
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

function calculateGWA(subjects) {
    let GWA_VALUE = 0;
    let TOTAL_UNITS = 0;
    subjects.forEach(subject => {
        if (subject.approved && subject.subject.includeInGWA) {
            GWA_VALUE += subject.subject.units * subject.grade;
            TOTAL_UNITS += subject.subject.units;
        }
    })
    GWA_VALUE /= TOTAL_UNITS;
    if (isNaN(GWA_VALUE)) {
        return 'N/A';
    }
    return GWA_VALUE.toFixed(2);
}

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
function countUnitsChecklist(subjects) {
    let UNITS = 0;
    subjects.forEach(subject => {
        if (subject.subject.includeInGWA && subject.approved) {
            UNITS += parseInt(subject.subject.units);
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
