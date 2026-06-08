

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
        if (restoreBtn) {
          const restoreHandler = () => {
            win.style.opacity = '1';
            win.style.transform = 'none';
            win.style.pointerEvents = 'auto';
            focusWindow(win);
            restoreBtn.removeEventListener('click', restoreHandler);
          };
          restoreBtn.addEventListener('click', restoreHandler);
        }
      }
    });
  });

  
  const maxDots = document.querySelectorAll('.dot-max');
  maxDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetName = dot.getAttribute('data-max');
      const win = document.getElementById(`window-${targetName}`);
      if (win) {
        if (win.classList.contains('maximized')) {
          win.classList.remove('maximized');
          win.style.width = win.dataset.prevWidth || '500px';
          win.style.height = win.dataset.prevHeight || '400px';
          win.style.top = win.dataset.prevTop || '20%';
          win.style.left = win.dataset.prevLeft || '20%';
        } else {
          
          win.dataset.prevWidth = win.style.width;
          win.dataset.prevHeight = win.style.height;
          win.dataset.prevTop = win.style.top;
          win.dataset.prevLeft = win.style.left;
          
          win.classList.add('maximized');
          win.style.width = '100%';
          win.style.height = 'calc(100% - 44px)';
          win.style.top = '44px';
          win.style.left = '0px';
        }
      }
    });
  });

  
  const welcomeTermBtn = document.querySelector('.open-terminal-btn');
  if (welcomeTermBtn) {
    welcomeTermBtn.addEventListener('click', () => {
      const termWin = document.getElementById('window-terminal');
      if (termWin) focusWindow(termWin);
    });
  }
}


function makeWindowDraggable(win) {
  const header = document.getElementById(`${win.id}-header`);
  if (!header) return;

  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  header.onmousedown = dragMouseDown;
  header.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e = e || window.event;
    
    if (e.target.classList.contains('window-dot')) return;
    
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function dragTouchStart(e) {
    if (e.target.classList.contains('window-dot')) return;
    
    const touch = e.touches[0];
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    document.ontouchend = closeDragElement;
    document.ontouchmove = elementTouchDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    updatePosition(win.offsetTop - pos2, win.offsetLeft - pos1);
  }

  function elementTouchDrag(e) {
    const touch = e.touches[0];
    pos1 = pos3 - touch.clientX;
    pos2 = pos4 - touch.clientY;
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    
    updatePosition(win.offsetTop - pos2, win.offsetLeft - pos1);
  }

  function updatePosition(top, left) {
    
    const desktopHeight = window.innerHeight;
    const desktopWidth = window.innerWidth;
    
    if (top < 44) top = 44; 
    if (top > desktopHeight - 50) top = desktopHeight - 50; 
    if (left < -win.offsetWidth + 100) left = -win.offsetWidth + 100; 
    if (left > desktopWidth - 100) left = desktopWidth - 100; 

    win.style.top = top + "px";
    win.style.left = left + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}


function initNotesApp() {
  const notesList = document.getElementById('notes-list');
  const addBtn = document.getElementById('add-note-btn');
  const deleteBtn = document.getElementById('delete-note-btn');
  const noteTitle = document.getElementById('note-title');
  const noteBody = document.getElementById('note-body');
  const saveStatus = document.getElementById('save-status');

  if (!notesList) return;

  let notes = JSON.parse(localStorage.getItem('slay_notes')) || [
    {
      id: 'note-1',
      title: 'Welcome',
      body: 'Hey, this is Slay Notes. Anything you type here gets auto-saved to your browser so it\'ll be here when you come back.\n\nFeel free to delete this and write your own stuff.',
      timestamp: Date.now()
    },
    {
      id: 'note-2',
      title: 'How this OS works',
      body: 'Slay OS is built with plain HTML, CSS, and JS.\n\nStuff it can do:\n- Drag windows around\n- Save notes automatically\n- Run terminal commands\n- Login with a password',
      timestamp: Date.now() - 3600000
    }
  ];

  let activeNoteId = notes.length > 0 ? notes[0].id : null;
  let saveTimeout = null;

  function saveToLocalStorage() {
    localStorage.setItem('slay_notes', JSON.stringify(notes));
    saveStatus.textContent = 'Saved';
    saveStatus.style.color = 'var(--text-muted)';
  }

  function triggerAutoSave() {
    saveStatus.textContent = 'Saving...';
    saveStatus.style.color = 'var(--accent-pink)';
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const activeNote = notes.find(n => n.id === activeNoteId);
      if (activeNote) {
        activeNote.title = noteTitle.value || 'Untitled Note';
        activeNote.body = noteBody.value;
        activeNote.timestamp = Date.now();
        renderNotesList();
        saveToLocalStorage();
      }
    }, 400); 
  }

  function renderNotesList() {
    notesList.innerHTML = '';
    
    
    const sortedNotes = [...notes].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedNotes.forEach(note => {
      const li = document.createElement('li');
      li.className = `note-item ${note.id === activeNoteId ? 'active-note' : ''}`;
      
      const snippet = note.body ? note.body.substring(0, 35) + (note.body.length > 35 ? '...' : '') : 'Empty note';
      
      li.innerHTML = `
        <div class="note-item-title">${escapeHTML(note.title)}</div>
        <div class="note-item-preview">${escapeHTML(snippet)}</div>
      `;
      
      li.addEventListener('click', () => {
        activeNoteId = note.id;
        loadActiveNote();
        renderNotesList();
      });
      
      notesList.appendChild(li);
    });
  }

  function loadActiveNote() {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      noteTitle.value = activeNote.title;
      noteBody.value = activeNote.body;
      noteTitle.disabled = false;
      noteBody.disabled = false;
    } else {
      noteTitle.value = '';
      noteBody.value = '';
      noteTitle.disabled = true;
      noteBody.disabled = true;
    }
  }

  
  addBtn.addEventListener('click', () => {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'Untitled Note',
      body: '',
      timestamp: Date.now()
    };
    notes.push(newNote);
    activeNoteId = newNote.id;
    loadActiveNote();
    renderNotesList();
    saveToLocalStorage();
    noteTitle.focus();
  });

  deleteBtn.addEventListener('click', () => {
    if (!activeNoteId) return;
    notes = notes.filter(n => n.id !== activeNoteId);
    activeNoteId = notes.length > 0 ? notes[0].id : null;
    loadActiveNote();
    renderNotesList();
    saveToLocalStorage();
  });

  noteTitle.addEventListener('input', triggerAutoSave);
  noteBody.addEventListener('input', triggerAutoSave);

  
  loadActiveNote();
  renderNotesList();
}


function initDevlogsApp() {
  const devlogDisplay = document.getElementById('devlog-display');
  const menuItems = document.querySelectorAll('.devlog-menu-item');

  if (!devlogDisplay) return;

  const devlogsData = {
    "1": {
      title: "System Inception & Grid Layouts",
      date: "June 10, 2026",
      content: `
        <h2>Day 1: System Inception</h2>
        <span class="devlog-meta">Authored by @Mokxsh_ on June 10, 2026</span>
        <p>decided to build a web-based OS mockup for the Hack Club Stardance challenge. named it Slay OS lol. spent the day writing basic HTML and setting up custom CSS variables.</p>
        <p>wanted a dark cyber-chic theme, so i went with glassmorphic panels, neon glows, and lots of pinks and purples. got the icon grids and system bar done. looks pretty clean so far.</p>
        <blockquote>"vanilla CSS gives me the raw control to design a frosted glass layout that is fully customized without any tailwind bloat."</blockquote>
        <p>quick summary of what got done:</p>
        <ul>
          <li>setup index.html outline and structured pages as absolute elements</li>
          <li>made the top-bar layout with battery status and clocks</li>
          <li>drew up SVGs for each app icon</li>
          <li>mapped out the desktop grid for drag-and-drop placements later</li>
        </ul>
      `
    },
    "2": {
      title: "Multi-Window Mechanics & Touch Support",
      date: "June 11, 2026",
      content: `
        <h2>Day 2: drag & focus handlers</h2>
        <span class="devlog-meta">Authored by @Mokxsh_ on June 11, 2026</span>
        <p>making windows draggable with plain JS is a nightmare. spent the whole day coding mouse and touch handlers to move windows around by their headers.</p>
        <p>also had to handle bounds checking so you can't throw windows off-screen, and a dynamic z-index system so clicking a window brings it to focus on top of everything else.</p>
        <p>key highlights:</p>
        <ul>
          <li>wrote vanilla drag handlers for both mouse clicks and touch controls</li>
          <li>added boundary limits so headers don't get stuck under the top-bar or off-screen</li>
          <li>added classic window dots: close (fade out), minimize (scale down), and maximize (fill screen)</li>
        </ul>
      `
    },
    "3": {
      title: "Auto-save Notepad & Command Shell CLI",
      date: "June 12, 2026",
      content: `
        <h2>Day 3: notepad & custom cli terminal</h2>
        <span class="devlog-meta">Authored by @Mokxsh_ on June 12, 2026</span>
        <p>added real functionality today. notepad saves your text automatically to localStorage using a debounce timeout so it doesn't lag while typing.</p>
        <p>then built a custom terminal parser. it's not a real terminal, but it supports custom commands like help, date, clear, neofetch, and a matrix code rain command using intervals. pretty fun stuff.</p>
        <blockquote>"adding the terminal neofetch and matrix rain makes this desktop simulation actually feel like a real hacky setup."</blockquote>
      `
    },
    "4": {
      title: "ASCII Cam App Integration",
      date: "June 13, 2026",
      content: `
        <h2>Day 4: Live ASCII Camera</h2>
        <span class="devlog-meta">Authored by @Mokxsh_ on June 13, 2026</span>
        <p>decided a normal webcam viewer was too boring. spent today coding an ASCII camera that draws live video to an offscreen canvas, checks each pixel's brightness, and replaces it with characters like @, #, %, and spaces.</p>
        <p>also added neon colors (pink, cyan, green) and real RGB color mode where characters are rendered in their exact color. you can even save a snapshot to a png. definitely my favorite feature so far.</p>
        <p>highlights:</p>
        <ul>
          <li>used getUserMedia for live video streams with horizontal mirroring (selfie-mode)</li>
          <li>mapped brightness to a 70-character dense-to-sparse text ramp</li>
          <li>added color filters and true-color rendering via HTML spans</li>
          <li>implemented custom Canvas drawing to export snapshots as PNG images</li>
        </ul>
      `
    }
  };

  function displayDevlog(id) {
    const log = devlogsData[id];
    if (log) {
      devlogDisplay.innerHTML = log.content;
    }
  }

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      displayDevlog(item.getAttribute('data-log'));
    });
  });

  
  displayDevlog("1");
}


function initTerminalApp() {
  const termInput = document.getElementById('terminal-input');
  const termLog = document.getElementById('terminal-log');
  const termWin = document.getElementById('window-terminal');

  if (!termInput || !termLog) return;

  const savedData = JSON.parse(localStorage.getItem('slay_os_user'));
  const pcName = savedData ? savedData.pcName : 'User';
  const cleanName = pcName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const userPrompt = `${cleanName}@slayos:~$`;

  
  const terminalContent = termWin.querySelector('.terminal-app');
  if (terminalContent) {
    terminalContent.addEventListener('click', () => {
      termInput.focus();
    });
  }

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const commandLine = termInput.value.trim();
      termInput.value = '';
      
      if (commandLine) {
        handleTerminalCommand(commandLine);
      }
    }
  });

  function printLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-output-line ${className}`;
    line.innerHTML = text;
    termLog.appendChild(line);
    
    
    const body = document.getElementById('terminal-body-content');
    if (body) {