document.addEventListener('DOMContentLoaded', () => {
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems);
});

// Show/hide links
const setupLinks = user => {
  const loggedInLinks = document.querySelectorAll('.logged-in');
  const loggedOutLinks = document.querySelectorAll('.logged-out');

  if (user) {
    loggedInLinks.forEach(link => (link.style.display = 'block'));
    loggedOutLinks.forEach(link => (link.style.display = 'none'));
  } else {
    loggedInLinks.forEach(link => (link.style.display = 'none'));
    loggedOutLinks.forEach(link => (link.style.display = 'block'));
  }
};

const addButton = document.querySelector('button.add');
const error = document.querySelector('h5.error');
const notes = document.querySelector('.notes__wrapper');
const formContainer = document.querySelector('.form__wrapper');
const form = document.querySelector('.add-note');
const editFormContainer = document.querySelector('.edit-form__wrapper');
const editForm = document.querySelector('.edit-note');
const alerts = document.querySelectorAll('.alert');
const addAlert = document.querySelector('.alert.added');
const editAlert = document.querySelector('.alert.updated');
const deleteAlert = document.querySelector('.alert.deleted');

// Open add form
const openForm = () => {
  formContainer.classList.remove('d-none');
};

// Open edit form
const openEditForm = () => {
  editFormContainer.classList.remove('d-none');
};

// Close add form
const closeForm = e => {
  if (e.target.classList.contains('close')) {
    formContainer.classList.add('d-none');
    form.reset();
  }
};

// Close edit form
const closeEditForm = e => {
  if (e.target.classList.contains('close')) {
    editFormContainer.classList.add('d-none');
    editForm.reset();
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
          <i class="icon edit material-icons">edit</i>
          <i class="icon delete material-icons">delete</i>
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
    content: form.description.value,
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
  if (
    e.target.classList.contains('delete') &&
    confirm('Are you sure you want to delete this note?')
  ) {
    const id = e.target.parentElement.parentElement.parentElement.getAttribute(
      'data-id'
    );
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

// Edit note
const editNote = e => {
  const note = e.target.parentElement.parentElement.parentElement;
  const id = note.getAttribute('data-id');
  const noteContainer = e.target.parentElement.parentElement;
  const title = noteContainer.querySelector('.note__title').innerHTML;
  const description = noteContainer.querySelector('.note__text').innerHTML;
  editForm['edit-title'].value = title;
  editForm['edit-description'].textContent = description;
  if (e.target.classList.contains('edit')) {
    openEditForm();
    editForm.addEventListener('submit', e => {
      e.preventDefault();
      const thisNote = db.collection('notes').doc(id);
      return thisNote
        .update({
          title: editForm['edit-title'].value.trim(),
          content: editForm['edit-description'].value,
        })
        .then(() => {
          console.log('Note updated');
          //const updatedNote = e.target.parentElement.parentElement.querySelector(`[data-id="${id}"]`);
          editFormContainer.classList.add('d-none');
          editForm.reset();
          editAlert.classList.remove('d-none');
          editAlert.classList.remove('hide');
          setTimeout(() => {
            editAlert.classList.add('hide');
          }, 2000);
        })
        .catch(err => console.log(err));
    });
  }
};

/* // Listening from database for changes and updating page
db.collection('notes').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    const doc = change.doc;
    if (change.type === 'added' || change.type === 'modified') {
      getNotes(doc.data(), doc.id);
    } else if (change.type === 'removed') {
      deleteNoteHTML(doc.id);
    }
  });
}); */

// Listening for events
notes.addEventListener('click', editNote);
notes.addEventListener('click', deleteNote);
addButton.addEventListener('click', openForm);
form.addEventListener('click', closeForm);
editForm.addEventListener('click', closeEditForm);
form.addEventListener('submit', addNote);
