

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

    
    bootDesktop();
  }
}


function initClock() {
  const timeElement = document.getElementById('timeElement');
  if (!timeElement) return;

  function updateClock() {
    const now = new Date();
    
    
    const dateStr = now.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const timeStr = now.toLocaleTimeString(undefined, { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    timeElement.textContent = `${dateStr} ${timeStr}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}


let highestZIndex = 100;

function initWindowManager() {
  const windows = document.querySelectorAll('.window');
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const menuTriggers = document.querySelectorAll('.menu-trigger');
  
  
  function focusWindow(win) {
    
    win.style.opacity = '1';
    win.style.transform = 'scale(1)';
    win.style.pointerEvents = 'auto';

    win.classList.remove('inactive-window');
    win.classList.add('active-window');
    
    highestZIndex++;
    win.style.zIndex = highestZIndex;
    
    
    windows.forEach(w => {
      w.classList.remove('active-window-glow');
      w.style.boxShadow = 'var(--glass-shadow)';
    });
    win.classList.add('active-window-glow');
    win.style.boxShadow = 'var(--glass-shadow), var(--neon-glow)';
  }

  
  windows.forEach(win => {
    win.addEventListener('mousedown', () => focusWindow(win));
    win.addEventListener('touchstart', () => focusWindow(win), { passive: true });
    
    
    makeWindowDraggable(win);
  });

  
  desktopIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId = `window-${icon.getAttribute('data-window')}`;
      const win = document.getElementById(targetId);
      if (win) {
        focusWindow(win);
      }
    });
  });

  
  menuTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = `window-${btn.getAttribute('data-window')}`;
      const win = document.getElementById(targetId);
      if (win) {
        focusWindow(win);
      }
    });
  });

  
  const closeDots = document.querySelectorAll('.dot-close');
  closeDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetName = dot.getAttribute('data-close');
      const win = document.getElementById(`window-${targetName}`);
      if (win) {
        win.classList.remove('active-window', 'active-window-glow');
        win.classList.add('inactive-window');
        win.style.opacity = '0';
        win.style.transform = 'scale(0.96)';
        
        setTimeout(() => {
          win.style.pointerEvents = 'none';
        }, 200);
      }
    });
  });

  
  const minDots = document.querySelectorAll('.dot-min');
  minDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetName = dot.getAttribute('data-min');
      const win = document.getElementById(`window-${targetName}`);
      if (win) {
        win.style.opacity = '0.1';
        win.style.transform = 'translateY(100px) scale(0.8)';
        win.style.pointerEvents = 'none';
        
        
        const restoreBtn = document.querySelector(`.menu-trigger[data-window="${targetName}"]`);