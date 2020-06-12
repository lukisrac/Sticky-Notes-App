import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { auth } from './auth';
import Swal from 'sweetalert2';

const preloader = document.querySelector('.preloader');
const page = document.querySelector('.page');
const addButton = document.querySelector('button.add');
const error = document.querySelector('h5.error');
const infoText = document.querySelector('p.info-text');
const notes = document.querySelector('.notes__wrapper');
const formContainer = document.querySelector('.form__wrapper');
const form = document.querySelector('.add-note');
const editFormContainer = document.querySelector('.edit-form__wrapper');
const editForm = document.querySelector('.edit-note');
const addToast = document.querySelector('.toast-notification.added');
const editToast = document.querySelector('.toast-notification.updated');
const deleteToast = document.querySelector('.toast-notification.deleted');

const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modals
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems);

  // Reset form for adding note after close
  const addModal = document.querySelector('#modal-add');
  M.Modal.init(addModal, {
    onCloseEnd: () => {
      document.querySelector('.add-note').reset();
    },
  });

  // Initialize edit form with active labels
  const editModal = document.querySelector('#modal-edit');
  M.Modal.init(editModal, {
    onOpenStart: () => {
      M.updateTextFields();
    },
  });
});

// Show/hide links
export const setupUI = (user) => {
  const loggedInLinks = document.querySelectorAll('.logged-in');
  const loggedOutLinks = document.querySelectorAll('.logged-out');

  if (user) {
    loggedInLinks.forEach((link) => (link.style.display = 'block'));
    loggedOutLinks.forEach((link) => (link.style.display = 'none'));
    addButton.classList.remove('d-none');
  } else {
    loggedInLinks.forEach((link) => (link.style.display = 'none'));
    loggedOutLinks.forEach((link) => (link.style.display = 'block'));
    addButton.classList.add('d-none');
  }
};

const getStatus = () => {
  db.collection('notes')
    .get()
    .then((doc) => {
      if (!doc.size) {
        infoText.classList.remove('d-none');
      } else {
        infoText.classList.add('d-none');
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
    setupUI(user);
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
    infoText.classList.add('d-none');
    setupUI();
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

// Toggle toast notification
export const toggleToastNotification = (action) => {
  if (action) {
    const toastNotification = document.querySelector(`.toast-notification.${action}`);
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2000);
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
          <i class="icon edit material-icons modal-trigger" data-target="modal-edit">edit</i>
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
      const modal = document.querySelector('#modal-add');
      M.Modal.getInstance(modal).close();
      form.reset();
      toggleToastNotification('added');
    })
    .catch((err) => console.log(err));
};

// Delete note from database
const deleteNote = (e) => {
  if (e.target.classList.contains('delete')) {
    Swal.fire({
      title: 'Are you sure you want to delete this note?',
      text: 'Once deleted, you will not be able to recover this note!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn dialog-btn red z-depth-0',
        cancelButton: 'btn dialog-btn grey lighten-1 z-depth-0',
      },
      buttonsStyling: false,
    }).then((answer) => {
      if (answer.value) {
        const id = e.target.parentElement.parentElement.parentElement.getAttribute('data-id');
        db.collection('notes')
          .doc(id)
          .delete()
          .then(() => {
            console.log('Note deleted');
          });
      }
    });
  }
};

// Delete note from page
const deleteNoteHTML = (id) => {
  const notes = document.querySelectorAll('.note');
  notes.forEach((note) => {
    if (note.getAttribute('data-id') === id) {
      note.remove();
      toggleToastNotification('deleted');
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
  editForm.reset();
  editForm['edit-title'].value = title;
  editForm['edit-description'].textContent = description;
  if (e.target.classList.contains('edit')) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const thisNote = db.collection('notes').doc(id);
      return thisNote
        .update({
          title: editForm['edit-title'].value.trim(),
          content: editForm['edit-description'].value,
        })
        .then(() => {
          const modal = document.querySelector('#modal-edit');
          M.Modal.getInstance(modal).close();
          editForm.reset();
          toggleToastNotification('updated');
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
form.addEventListener('click', closeForm);
editForm.addEventListener('click', closeEditForm);
form.addEventListener('submit', addNote);
