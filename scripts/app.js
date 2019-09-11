const addButton = document.querySelector('button.add');
const notes = document.querySelector('.notes__wrapper');
const formContainer = document.querySelector('.form__wrapper');
const form = document.querySelector('.add-note');
const edit = document.querySelector('.edit');
const alerts = document.querySelectorAll('.alert');
const addAlert = document.querySelector('.alert.added');
const deleteAlert = document.querySelector('.alert.deleted');

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

// Get notes
const getNotes = (note, id) => {
  let html = `
  <div data-id="${id}" class="note">
  <div class="note__inner">
      <h3 class="note__title">${note.title}</h3>
      <p class="note__text">${note.content}</p>
      <div class="note__footer">
          <i class="icon delete fas fa-trash-alt"></i>
      </div>
  </div>
</div>
  `;

  notes.innerHTML += html;
};

// Add note and save it to the database
const addNote = e => {
  e.preventDefault();
  // Create object from form values
  const note = {
    title: form.title.value.trim(),
    content: form.description.value
  };

  // Passing created object and save it to database
  db.collection('notes')
    .add(note)
    .then(() => {
      console.log('Note added');
      formContainer.classList.add('d-none');
      form.reset();
      addAlert.classList.remove('d-none');
      addAlert.classList.remove('hide');
      setTimeout(() => {
        addAlert.classList.add('hide');
      }, 2000);
    })
    .catch(err => console.log(err));
};

// Delete note from database
const deleteNote = e => {
  if (e.target.classList.contains('delete') && confirm('Are you sure you want to delete this note?')) {
    const id = e.target.parentElement.parentElement.parentElement.getAttribute('data-id');
    db.collection('notes')
      .doc(id)
      .delete()
      .then(() => {
        console.log('Note deleted');
        deleteAlert.classList.remove('d-none');
        deleteAlert.classList.remove('hide');
        setTimeout(() => {
          deleteAlert.classList.add('hide');
        }, 2000);
      });
  }
};

// Delete note from page
const deleteNoteHTML = id => {
  const notes = document.querySelectorAll('.note');
  notes.forEach(note => {
    if (note.getAttribute('data-id') === id) {
      note.remove();
    }
  });
};

// Listening from database for changes and updating page
db.collection('notes').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    const doc = change.doc;
    if (change.type === 'added') {
      getNotes(doc.data(), doc.id);
    } else if (change.type === 'removed') {
      deleteNoteHTML(doc.id);
    }
  });
});

// Listening for events
notes.addEventListener('click', deleteNote);
addButton.addEventListener('click', openForm);
form.addEventListener('click', closeForm);
form.addEventListener('submit', addNote);
