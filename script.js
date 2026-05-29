

document.addEventListener('DOMContentLoaded', () => {
  initLoginSystem();
});

function bootDesktop() {
  const savedData = JSON.parse(localStorage.getItem('slay_os_user'));
  const pcName = savedData ? savedData.pcName : 'User';

  const welcomeHeading = document.getElementById('welcome-user-heading');
  if (welcomeHeading) {
    welcomeHeading.textContent = `Hey, welcome to ${pcName}!`;
  }

  const termLabel = document.getElementById('terminal-prompt-label');
  if (termLabel) {
    const cleanName = pcName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    termLabel.textContent = `${cleanName}@slayos:~$`;
  }

  initClock();
  initWindowManager();
  initNotesApp();
  initDevlogsApp();
  initTerminalApp();
  initRouletteApp();
  initASCIICamApp();
}



function initLoginSystem() {
  const loginScreen = document.getElementById('login-screen');
  const setupForm = document.getElementById('setup-form');
  const loginForm = document.getElementById('login-form');
  const subtitle = document.getElementById('login-subtitle');

  const savedData = JSON.parse(localStorage.getItem('slay_os_user'));

  if (savedData && savedData.pcName && savedData.password) {
    
    setupForm.style.display = 'none';
    loginForm.style.display = 'flex';
    subtitle.textContent = `Welcome back, ${savedData.pcName}`;

    const loginPassword = document.getElementById('login-password');
    const loginSubmit = document.getElementById('login-submit');
    const loginError = document.getElementById('login-error');

    function attemptLogin() {
      const pw = loginPassword.value;
      if (!pw) {
        loginError.textContent = 'Enter your password.';
        return;
      }
      if (pw !== savedData.password) {
        loginError.textContent = 'Wrong password. Try again.';
        loginPassword.value = '';
        loginPassword.focus();
        return;
      }
      
      loginError.textContent = '';
      unlockDesktop(savedData.pcName);
    }

    loginSubmit.addEventListener('click', attemptLogin);
    loginPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });
    loginPassword.focus();

  } else {
    
    setupForm.style.display = 'flex';
    loginForm.style.display = 'none';
    subtitle.textContent = 'Set up your machine';

    const setupPcName = document.getElementById('setup-pcname');
    const setupPassword = document.getElementById('setup-password');
    const setupSubmit = document.getElementById('setup-submit');
    const setupError = document.getElementById('setup-error');

    function attemptSetup() {
      const name = setupPcName.value.trim();
      const pw = setupPassword.value;
      if (!name) {
        setupError.textContent = 'Give your PC a name first.';
        setupPcName.focus();
        return;
      }
      if (!pw) {
        setupError.textContent = 'Pick a password.';
        setupPassword.focus();
        return;
      }
      if (pw.length < 3) {
        setupError.textContent = 'Password needs at least 3 characters.';
        return;
      }
      
      localStorage.setItem('slay_os_user', JSON.stringify({
        pcName: name,
        password: pw
      }));
      setupError.textContent = '';
      unlockDesktop(name);
    }

    setupSubmit.addEventListener('click', attemptSetup);
    setupPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptSetup();
    });
    setupPcName.focus();
  }

  function unlockDesktop(pcName) {
    
    loginScreen.classList.add('hidden');
    setTimeout(() => {
      loginScreen.style.display = 'none';
    }, 600);

    
    const statusEl = document.querySelector('.system-status');
    if (statusEl) {
      statusEl.textContent = pcName;
    }