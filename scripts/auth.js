// Listening for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    // Listening from database for changes and updating page
    db.collection('notes').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        const doc = change.doc;
        if (change.type === 'added' || change.type === 'modified') {
          getNotes(doc.data(), doc.id);
        } else if (change.type === 'removed') {
          deleteNoteHTML(doc.id);
        }
      });
      setupLinks(user);
    });
  } else {
    notes.innerHTML = '';
    setupLinks();
  }
});

// Sign up
const signUpForm = document.querySelector('#signup-form');

signUpForm.addEventListener('submit', e => {
  e.preventDefault();

  const email = signUpForm['signup-email'].value;
  const password = signUpForm['signup-password'].value;

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      const modal = document.querySelector('#modal-signup');
      M.Modal.getInstance(modal).close();
      signUpForm.reset();
    })
    .catch(err => {
      console.log(err);
    });
});

// Log in
const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  auth.signInWithEmailAndPassword(email, password).then(() => {
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  });
});

// Log out
const logout = document.querySelector('#logout');

logout.addEventListener('click', e => {
  e.preventDefault();

  auth.signOut();
});
