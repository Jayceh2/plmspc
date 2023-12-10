function submitForm(studentNumber) {
    const form = document.createElement('form');
    form.action = '/dashboard/checklist/view';
    form.method = 'POST';
  
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = 'studentNumber';
    hiddenField.value = studentNumber;
  
    form.appendChild(hiddenField);
  
    document.body.appendChild(form);
    form.submit();
  }