const addButton = document.querySelector('button.add');
const notes = document.querySelector('.notes__wrapper');
const formContainer = document.querySelector('.form__wrapper');
const form = document.querySelector('form');

// Open form
const openForm = () => {
  formContainer.classList.remove('d-none');
};

// Close form
const closeForm = e => {
  if (e.target.classList.contains('close')) {
    formContainer.classList.add('d-none');
    form.reset();
  }
};

// Add note
const addNote = e => {
  e.preventDefault();
  const title = form.title.value.trim();
  const content = form.description.value;

  let note = `
  <div class="note">
  <div class="note__inner">
      <h3 class="note__title">${title}</h3>
      <p class="note__text">${content}</p>
      <div class="note__footer">
          <i class="icon edit fas fa-pen"></i>
          <i class="icon delete fas fa-trash-alt"></i>
      </div>
  </div>
</div>
  `;

  notes.innerHTML += note;
  formContainer.classList.add('d-none');
  form.reset();
};

// Remove note
const removeNote = e => {
  if (e.target.classList.contains('delete') && confirm('Are you sure you want to delete this note?')) {
    e.target.parentNode.parentNode.parentNode.remove();
  }
};

// Listening for events
notes.addEventListener('click', removeNote);
//notes.addEventListener('click', editNote);
addButton.addEventListener('click', openForm);
form.addEventListener('click', closeForm);
form.addEventListener('submit', addNote);
