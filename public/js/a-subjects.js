function retrieveBoolean(sem1, sem2, summer) {
    if (sem1) {
        toggleBoolean('sem1', 'sem1Checkbox');
    }
    if (sem2) {
        toggleBoolean('sem2', 'sem2Checkbox');
    }
    if (summer) {
        toggleBoolean('summer', 'summerCheckbox');
    }
}

function filterDegrees(event) {
    const degree = "deg" + event.target.id;
    const degreeContainer = document.getElementById('degreesInput');
    const degreeOptions = document.querySelectorAll('.degreeOption');

    degreeContainer.classList.remove('hidden');
    setInputValue('degree', '')

    for (let degreeOption of degreeOptions) {
        degreeOption.classList.add('hidden');
    }

    for (let degreeOption of degreeOptions) {
        if (degreeOption.id === degree) {
            degreeOption.classList.remove('hidden');
        }
    }
}