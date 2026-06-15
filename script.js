

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
      body.scrollTop = body.scrollHeight;
    }
  }

  function handleTerminalCommand(cmdText) {
    
    printLine(`${userPrompt} ${escapeHTML(cmdText)}`, 'cmd-echo');
    
    const tokens = cmdText.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    switch (cmd) {
      case 'help':
        printLine('Available Commands:', 'system-msg');
        printLine('  <span class="term-highlight">help</span>     - show this menu');
        printLine('  <span class="term-highlight">neofetch</span> - show system specs');
        printLine('  <span class="term-highlight">slay</span>     - check the system vibes');
        printLine('  <span class="term-highlight">matrix</span>   - cool falling green rain effect');
        printLine('  <span class="term-highlight">asciicam</span> - launch the ascii art camera');
        printLine('  <span class="term-highlight">date</span>     - print current time');
        printLine('  <span class="term-highlight">clear</span>    - clear terminal screen');
        break;

      case 'asciicam':
        printLine('Opening ASCII Cam...', 'system-msg');
        const camIcon = document.getElementById('icon-asciicam');
        if (camIcon) camIcon.click();
        break;
        
      case 'clear':
        termLog.innerHTML = '';
        break;
        
      case 'date':
        printLine(`System Date: ${new Date().toString()}`, 'system-msg');
        break;
        
      case 'slay':
        printLine('✦ SYSTEM VIBE CHECK ✦', 'term-highlight');
        printLine('Code quality.......... solid');
        printLine('Interface design...... looking clean');
        printLine('Overall status: yeah we\'re good here.', 'system-msg');
        break;
        
      case 'neofetch':
        runNeofetch();
        break;
        
      case 'matrix':
        runMatrixEffect();
        break;
        
      default:
        printLine(`Command not found: "${escapeHTML(cmd)}". Type <span class="term-highlight">help</span> to view lists.`, 'error-msg');
    }
  }

  function runNeofetch() {
    const neofetchHTML = `
      <div class="neofetch-container">
        <div class="neofetch-logo">
    .--.
   |o_o |
   |:_/ |  SlayOS
  //   \\ \\ 2026
 (|     | )
/'\\_   _/\\'
\\___)=(___/
        </div>
        <div class="neofetch-info">
          <div class="neofetch-title">${cleanName}@slay_os_desktop</div>
          <div style="color: var(--text-muted)">------------------------</div>
          <div class="neofetch-item"><span class="neofetch-label">OS</span>: Slay OS (Hack Club Stardance)</div>
          <div class="neofetch-item"><span class="neofetch-label">Host</span>: Web Interface Mockup</div>
          <div class="neofetch-item"><span class="neofetch-label">Uptime</span>: ${Math.round(performance.now() / 1000)}s</div>
          <div class="neofetch-item"><span class="neofetch-label">Shell</span>: Javascript Custom Parser v1.0</div>
          <div class="neofetch-item"><span class="neofetch-label">Resolution</span>: ${window.innerWidth}x${window.innerHeight}</div>
          <div class="neofetch-item"><span class="neofetch-label">UI Theme</span>: Neon Purple Glassmorphic</div>
          <div class="neofetch-item"><span class="neofetch-label">Font</span>: Outfit, Fira Code</div>
          <div class="neofetch-item"><span class="neofetch-label">CPU</span>: Virtual Slay Engine v9</div>
          <div class="neofetch-item"><span class="neofetch-label">Memory</span>: Infinite RAM (Browser sandbox)</div>
        </div>
      </div>
    `;
    printLine(neofetchHTML);
  }

  function runMatrixEffect() {
    printLine('Entering matrix code stream... Press Ctrl+C or type clear to exit.', 'term-highlight');
    let count = 0;
    
    
    const interval = setInterval(() => {
      if (count > 25) {
        clearInterval(interval);
        printLine('Matrix diagnostic sequence finished.', 'system-msg');
        return;
      }
      
      
      let binaryStr = '';
      const chars = '01SLAYOS10✦⚡>>_';
      for (let i = 0; i < 40; i++) {
        binaryStr += chars[Math.floor(Math.random() * chars.length)] + ' ';
      }
      printLine(binaryStr, 'matrix-line');
      count++;
    }, 120);
  }
}


function initRouletteApp() {
  const coin = document.getElementById('roulette-coin');
  const flipBtn = document.getElementById('roulette-flip-btn');
  const resultDiv = document.getElementById('roulette-result');
  const restoreBtn = document.getElementById('roulette-restore-btn');
  const winsEl = document.getElementById('roulette-wins');
  const lossesEl = document.getElementById('roulette-losses');

  if (!flipBtn) return;

  
  let wins = parseInt(localStorage.getItem('roulette_wins') || '0', 10);
  let losses = parseInt(localStorage.getItem('roulette_losses') || '0', 10);

  winsEl.textContent = wins;
  lossesEl.textContent = losses;

  
  const wipedIcons = document.querySelectorAll('.desktop-icon.wiped');
  if (wipedIcons.length > 0) {
    restoreBtn.style.display = 'inline-block';
  }

  flipBtn.addEventListener('click', () => {
    
    flipBtn.disabled = true;
    restoreBtn.style.display = 'none';
    resultDiv.textContent = 'Flipping...';
    resultDiv.className = 'roulette-result';

    
    coin.textContent = '✦';
    coin.className = 'roulette-coin spinning';

    
    setTimeout(() => {
      coin.classList.remove('spinning');
      const isWin = Math.random() < 0.5;

      if (isWin) {
        wins++;
        localStorage.setItem('roulette_wins', wins);
        winsEl.textContent = wins;

        coin.className = 'roulette-coin win';
        coin.textContent = '🏆';
        resultDiv.textContent = 'Heads! You Won! Safe for now.';
        resultDiv.classList.add('win-text');

        
        const wipedIconsCount = document.querySelectorAll('.desktop-icon.wiped').length;
        if (wipedIconsCount > 0) {
          restoreBtn.style.display = 'inline-block';
        }
      } else {
        losses++;
        localStorage.setItem('roulette_losses', losses);
        lossesEl.textContent = losses;

        coin.className = 'roulette-coin lose';
        coin.textContent = '💥';
        resultDiv.textContent = 'Tails! Half of your apps were wiped!';
        resultDiv.classList.add('lose-text');

        
        const activeIcons = Array.from(document.querySelectorAll('.desktop-icon:not(.wiped)'));
        if (activeIcons.length > 0) {
          
          const shuffled = activeIcons.sort(() => 0.5 - Math.random());
          
          const numToWipe = Math.max(1, Math.floor(shuffled.length / 2));
          const toWipe = shuffled.slice(0, numToWipe);

          toWipe.forEach(icon => {
            icon.classList.add('wiped');
            
            
            const targetWindowId = `window-${icon.getAttribute('data-window')}`;
            const targetWin = document.getElementById(targetWindowId);
            if (targetWin && targetWin.classList.contains('active-window')) {
              targetWin.classList.remove('active-window', 'active-window-glow');
              targetWin.classList.add('inactive-window');
              targetWin.style.opacity = '0';
              targetWin.style.transform = 'scale(0.96)';
              setTimeout(() => {
                targetWin.style.pointerEvents = 'none';
              }, 200);
            }
          });
        }

        restoreBtn.style.display = 'inline-block';
      }

      flipBtn.disabled = false;
    }, 600);
  });

  restoreBtn.addEventListener('click', () => {
    const wipedIcons = document.querySelectorAll('.desktop-icon.wiped');
    wipedIcons.forEach(icon => {
      icon.classList.remove('wiped');
    });
    restoreBtn.style.display = 'none';
    resultDiv.textContent = 'All apps restored!';
    resultDiv.className = 'roulette-result win-text';
    coin.className = 'roulette-coin';
    coin.textContent = '?';
  });
}


function initASCIICamApp() {
  const video = document.getElementById('ascii-video');
  const canvas = document.getElementById('ascii-canvas');
  const output = document.getElementById('ascii-output');
  const placeholder = document.getElementById('asciicam-placeholder');
  const startBtn = document.getElementById('ascii-start-btn');
  const stopBtn = document.getElementById('ascii-stop-btn');
  const snapBtn = document.getElementById('ascii-snap-btn');
  const modeSelect = document.getElementById('ascii-mode-select');
  const resSelect = document.getElementById('ascii-res-select');
  const fpsEl = document.getElementById('ascii-fps');
  const charEl = document.getElementById('ascii-char-count');
  const statusEl = document.getElementById('ascii-status');

  if (!startBtn) return;

  const ctx = canvas.getContext('2d');
  const CHAR_RAMP = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
  const RAMP_LEN = CHAR_RAMP.length;

  let stream = null;
  let rafId = null;
  let running = false;
  let lastTime = 0;
  let fpsCounter = 0;
  let fpsDisplay = 0;

  const RES = { high: [140, 70], mid: [100, 50], low: [70, 35] };

  function getResolution() {
    return RES[resSelect.value] || RES.mid;
  }

  function getMode() {
    return modeSelect.value;
  }

  startBtn.addEventListener('click', async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        running = true;
        placeholder.style.display = 'none';
        output.style.display = 'block';

        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        snapBtn.style.display = 'inline-block';

        statusEl.textContent = '● LIVE';
        statusEl.className = 'ascii-status live';

        renderLoop();
      };
    } catch (err) {
      statusEl.textContent = '✖ No Camera';
      placeholder.querySelector('p').innerHTML = '<strong style="color:#f87171">Camera access denied.</strong><br>Allow camera permission and try again.';
    }
  });

  stopBtn.addEventListener('click', stopCamera);

  function stopCamera() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    video.srcObject = null;
    output.style.display = 'none';
    placeholder.style.display = 'flex';
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    snapBtn.style.display = 'none';
    statusEl.textContent = 'Offline';
    statusEl.className = 'ascii-status offline';
    fpsEl.textContent = 'FPS: --';
    charEl.textContent = 'Chars: --';
  }

  snapBtn.addEventListener('click', () => {
    const text = output.innerText;
    const lines = text.split('\n');
    const fontSize = 6;
    const lineH = 7;
    const w = (lines[0] || '').length * (fontSize * 0.6);
    const h = lines.length * lineH;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = w || 800;
    snapCanvas.height = h || 600;
    const sctx = snapCanvas.getContext('2d');

    sctx.fillStyle = '#000';
    sctx.fillRect(0, 0, snapCanvas.width, snapCanvas.height);

    const mode = getMode();
    const colors = { green: '#22c55e', pink: '#f472b6', cyan: '#22d3ee', white: '#e2e8f0', color: '#22c55e' };
    sctx.fillStyle = colors[mode] || '#22c55e';
    sctx.font = `${fontSize}px "Courier New", monospace`;

    lines.forEach((line, i) => {
      sctx.fillText(line, 0, (i + 1) * lineH);
    });

    const link = document.createElement('a');
    link.download = `ascii-snapshot-${Date.now()}.png`;
    link.href = snapCanvas.toDataURL('image/png');
    link.click();
  });

  function renderLoop(timestamp = 0) {
    if (!running) return;
    rafId = requestAnimationFrame(renderLoop);

    if (timestamp - lastTime < 42) return;