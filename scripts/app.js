const addButton = document.querySelector('button.add');
const notes = document.querySelector('.notes__wrapper');
const form = document.querySelector('.form__wrapper');

// Remove note
const removeNote = e => {
  if (e.target.classList.contains('delete') && confirm('Are you sure you want to delete this note?')) {
    e.target.parentNode.parentNode.parentNode.remove();
  }
};

// Open form
const openForm = () => {
  form.classList.remove('d-none');
};

// Close form
const closeForm = e => {
  if (e.target.classList.contains('close')) {
    e.target.parentNode.parentNode.classList.add('d-none');
  }
};

// Listening for events
notes.addEventListener('click', removeNote);
//notes.addEventListener('click', editNote);
addButton.addEventListener('click', openForm);
form.addEventListener('click', closeForm);
