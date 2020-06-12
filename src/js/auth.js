// Firebase App (the core Firebase SDK)
import * as firebase from 'firebase/app';

// Firebase Auth
import 'firebase/auth';

import { toggleToastNotification } from './main';

// Firebase config
const firebaseConfig = {
  apiKey: `${process.env.FIREBASE_API_KEY}`,
  authDomain: `${process.env.FIREBASE_AUTH_DOMAIN}`,
  databaseURL: `${process.env.DATABASE_URL}`,
  projectId: `${process.env.PROJECT_ID}`,
  storageBucket: `${process.env.STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.MESSAGING_SENDER_ID}`,
  appId: `${process.env.APP_ID}`,
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();

// Sign up
const signUpForm = document.querySelector('#signup-form');

signUpForm.addEventListener('submit', (e) => {
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
    .catch((err) => {
      console.log(err);
    });
});

// Log in
const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;
  const passwordMsg = loginForm.querySelector('.password-error');
  const emailMsg = loginForm.querySelector('.email-error');

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      const modal = document.querySelector('#modal-login');
      M.Modal.getInstance(modal).close();
      loginForm.reset();
      toggleToastNotification('login');
      passwordMsg.textContent = '';
      emailMsg.textContent = '';
    })
    .catch((err) => {
      console.log(err);
      passwordMsg.textContent = '';
      emailMsg.textContent = '';
      if (err.code === 'auth/wrong-password') {
        passwordMsg.textContent = 'Wrong password';
      } else if (err.code === 'auth/user-not-found') {
        emailMsg.textContent = 'This user email does not exist';
      }
    });
});

// Log out
const logout = document.querySelector('#logout');

logout.addEventListener('click', (e) => {
  e.preventDefault();

  auth.signOut();
  toggleToastNotification('logout');
});
