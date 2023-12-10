function retrieveBoolean(sem1, sem2, summer) {
    console.log(sem1, sem2, summer)
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