# ✦ SlayOS

> built for hack club stardance. got a little out of hand. no regrets.

---

## what is this

ok so. SlayOS is a fake operating system that runs in your browser. i built the whole thing with just HTML, CSS and vanilla JS — no frameworks, no npm, nothing. just three files and a lot of caffeine.

it was supposed to be a simple desktop UI for the Hack Club Stardance challenge. then i kept adding stuff. now it has a terminal, a live ASCII webcam, a coin flip that can delete your apps, devlogs, notes, and a login screen. it kinda just became a real OS at some point??

you can try it here → **https://mokxsh404.github.io/Slay-OS/**

---

## what's inside

**🖥️ the desktop**
draggable windows, a top bar with a live clock, battery and wifi indicators. you can stack and move windows around like an actual OS. small details but they make it feel way more legit than it has any right to be.

**🔐 login screen**
first time you open it, you name your PC and set a password. it saves to localStorage so it actually remembers you next time. your PC name even shows up in the terminal prompt which is a tiny thing but i love it.

**📝 slay notes**
a notepad that auto-saves as you type. nothing crazy, just does its job without losing your stuff. you can delete notes too.

**📂 devlogs**
a viewer that shows the build journey of SlayOS itself. kinda meta honestly. sidebar navigation, clean layout, and reading about how the project came together from inside the project itself is weirdly cool.

**🐚 slay terminal**
a working terminal with real commands — `help`, `ls`, `whoami`, `clear`, `date` and more. the prompt uses your PC name so it feels personal. type `help` and go explore.

**🎰 slay roulette**
this is the chaotic one. you flip a coin. heads → nothing happens, you feel relieved. tails → half your desktop icons get deleted. there's a restore button so it's not permanent but honestly those few seconds after losing are genuinely stressful lmao. it also tracks your wins and losses which is just mean.

**📷 ascii cam**
takes your webcam feed and turns it into live ASCII art in real time. you can switch between modes — Matrix green, Neon Pink, Cyber Cyan, Classic white, full RGB color. adjust the detail level. take snapshots. it shows FPS and character count live at the bottom. this one was absolutely unnecessary and also my favorite thing i've ever built.

---

## tech stack

HTML, CSS, vanilla JS. that's it lol. no react, no build tools, no dependencies. just three files.
