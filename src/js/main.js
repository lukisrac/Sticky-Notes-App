import 'materialize-css';
// Firebase App (the core Firebase SDK)
import * as firebase from 'firebase/app';
// Firebase Firestore
import 'firebase/firestore';
import { auth } from './auth';

const preloader = document.querySelector('.preloader');
const page = document.querySelector('.page');
const addButton = document.querySelector('button.add');
const error = document.querySelector('h5.error');
const notes = document.querySelector('.notes__wrapper');
const formContainer = document.querySelector('.form__wrapper');
const form = document.querySelector('.add-note');
const editFormContainer = document.querySelector('.edit-form__wrapper');
const editForm = document.querySelector('.edit-note');
const addAlert = document.querySelector('.alert.added');
const editAlert = document.querySelector('.alert.updated');
const deleteAlert = document.querySelector('.alert.deleted');

const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems);
});

// Show/hide links
export const setupLinks = (user) => {
  const loggedInLinks = document.querySelectorAll('.logged-in');
  const loggedOutLinks = document.querySelectorAll('.logged-out');

  if (user) {
    loggedInLinks.forEach((link) => (link.style.display = 'block'));
    loggedOutLinks.forEach((link) => (link.style.display = 'none'));
  } else {
    loggedInLinks.forEach((link) => (link.style.display = 'none'));
    loggedOutLinks.forEach((link) => (link.style.display = 'block'));
  }
};

const getStatus = () => {
  db.collection('notes')
    .get()
    .then((doc) => {
      if (!doc.size) {
        const p = document.createElement('p');
        p.className = 'info-text';
        p.textContent = 'No notes! Click + button to add one.';
        notes.append(p);
      } else {
        notes.querySelector('p').style.display = 'none';
      }
    });
};

auth.onAuthStateChanged((user) => {
  if (user) {
    getStatus();
    // Listening from database for changes and updating page
    db.collection('notes')
      .orderBy('created_at')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const doc = change.doc;
          if (change.type === 'added') {
            getStatus();
            getNotes(doc.data(), doc.id);
          } else if (change.type === 'modified') {
            updateNote(change.doc);
          } else if (change.type === 'removed') {
            getStatus();
            deleteNoteHTML(doc.id);
          }
        });
      });
    error.style.display = 'none';
    setupLinks(user);
    // Hide preloader and show page
    setTimeout(() => {
      preloader.classList.add('loaded');
      page.classList.add('loaded');
    }, 1000);
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 1500);
  } else {
    notes.innerHTML = '';
    error.style.display = 'block';
    setupLinks();
    // Hide preloader and show page
    setTimeout(() => {
      preloader.classList.add('loaded');
      page.classList.add('loaded');
    }, 1000);
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 1500);
  }
});

// Open add form
const openForm = () => {
  formContainer.classList.remove('d-none');
};

// Open edit form
const openEditForm = () => {
  editFormContainer.classList.remove('d-none');
};

// Close add form
const closeForm = (e) => {
  if (e.target.classList.contains('close')) {
    formContainer.classList.add('d-none');
    form.reset();
  }
};

// Close edit form
const closeEditForm = (e) => {
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
const addNote = (e) => {
  e.preventDefault();
  // Create object from form values
  const now = new Date();
  const note = {
    title: form.title.value.trim(),
    content: form.description.value,
    created_at: firebase.firestore.Timestamp.fromDate(now),
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
    .catch((err) => console.log(err));
};

// Delete note from database
const deleteNote = (e) => {
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
const deleteNoteHTML = (id) => {
  const notes = document.querySelectorAll('.note');
  notes.forEach((note) => {
    if (note.getAttribute('data-id') === id) {
      note.remove();
    }
  });
};

// Update note in database
const editNote = (e) => {
  const note = e.target.parentElement.parentElement.parentElement;
  const id = note.getAttribute('data-id');
  const noteContainer = e.target.parentElement.parentElement;
  const title = noteContainer.querySelector('.note__title').innerHTML;
  const description = noteContainer.querySelector('.note__text').innerHTML;
  editForm['edit-title'].value = title;
  editForm['edit-description'].textContent = description;
  if (e.target.classList.contains('edit')) {
    openEditForm();
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const thisNote = db.collection('notes').doc(id);
      return thisNote
        .update({
          title: editForm['edit-title'].value.trim(),
          content: editForm['edit-description'].value,
        })
        .then(() => {
          editFormContainer.classList.add('d-none');
          editForm.reset();
          editAlert.classList.remove('d-none');
          editAlert.classList.remove('hide');
          setTimeout(() => {
            editAlert.classList.add('hide');
          }, 2000);
        })
        .catch((err) => console.log(err));
    });
  }
};

// Update note in page
const updateNote = (data) => {
  console.log('note updated');
  const updatedNote = notes.querySelector(`.note[data-id="${data.id}"]`);
  const updatedData = data.data();
  let title = updatedNote.querySelector('.note__title');
  let description = updatedNote.querySelector('.note__text');
  title.innerHTML = updatedData.title;
  description.innerHTML = updatedData.content;
};

// Listening for events
notes.addEventListener('click', editNote);
notes.addEventListener('click', deleteNote);
addButton.addEventListener('click', openForm);
form.addEventListener('click', closeForm);
editForm.addEventListener('click', closeEditForm);
form.addEventListener('submit', addNote);
