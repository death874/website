// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    navToggle.setAttribute('aria-expanded', String(!open));
  });
}

// Dark mode toggle with preference memory
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;
function applyTheme(dark){
  root.classList.toggle('dark', dark);
  localStorage.setItem('prefers-dark', dark ? '1' : '0');
  if (themeToggle) themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
}
const saved = localStorage.getItem('prefers-dark');
applyTheme(saved ? saved === '1' : prefersDark.matches);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = root.classList.contains('dark');
    applyTheme(!isDark);
  });
}

// Contact handler (demo)
function onSubmitContact(e){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const status = document.getElementById('form-status');
  console.log('Contact form submission (demo):', data);
  status.textContent = 'Thanks! Message captured locally. Connect this form to your backend or Formspree.';
  e.target.reset();
  return false;
}

// Live analog + digital clock
function tickClock(){
  const now = new Date();
  const secDeg = (now.getSeconds()/60)*360;
  const minDeg = ((now.getMinutes()+now.getSeconds()/60)/60)*360;
  const hrDeg  = ((now.getHours()%12 + now.getMinutes()/60)/12)*360;
  document.querySelector('.hand.second').style.transform = `translate(-50%, -100%) rotate(${secDeg}deg)`;
  document.querySelector('.hand.minute').style.transform = `translate(-50%, -100%) rotate(${minDeg}deg)`;
  document.querySelector('.hand.hour').style.transform   = `translate(-50%, -100%) rotate(${hrDeg}deg)`;
  document.getElementById('digital-clock').textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}
setInterval(tickClock, 1000); tickClock();

// Minimal aesthetic calendar (client-only)
const calGrid = document.getElementById('cal-grid');
const calTitle = document.getElementById('cal-title');
let calRef = new Date();
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function renderCalendar(date){
  const y = date.getFullYear();
  const m = date.getMonth();
  calGrid.innerHTML = '';
  // Header row — days of week
  for (const d of DOW){
    const el = document.createElement('div');
    el.className = 'dow';
    el.textContent = d;
    calGrid.appendChild(el);
  }
  // First day and days in month
  const first = new Date(y, m, 1);
  const start = first.getDay();
  const days = new Date(y, m+1, 0).getDate();
  // Blank cells before the 1st
  for (let i=0;i<start;i++){
    const blank = document.createElement('div');
    calGrid.appendChild(blank);
  }
  // Simple availability: mark weekdays as open, weekends as busy (placeholder)
  for (let d=1; d<=days; d++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    const dateObj = new Date(y, m, d);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    cell.classList.add(isWeekend ? 'busy' : 'open');
    const num = document.createElement('div');
    num.className = 'num';
    num.textContent = d;
    const tag = document.createElement('small');
    tag.textContent = isWeekend ? 'Busy' : 'Open';
    cell.appendChild(num);
    cell.appendChild(tag);
    calGrid.appendChild(cell);
  }
  calTitle.textContent = date.toLocaleString(undefined, {month:'long', year:'numeric'});
}
renderCalendar(calRef);
document.getElementById('prev-month').addEventListener('click', ()=>{ calRef = new Date(calRef.getFullYear(), calRef.getMonth()-1, 1); renderCalendar(calRef); });
document.getElementById('next-month').addEventListener('click', ()=>{ calRef = new Date(calRef.getFullYear(), calRef.getMonth()+1, 1); renderCalendar(calRef); });

// Download ICS placeholder: creates a simple 30-min slot on next weekday at 10am local
document.getElementById('download-ics').addEventListener('click', (e)=>{
  e.preventDefault();
  const now = new Date();
  let start = new Date(now);
  start.setDate(start.getDate()+1);
  // move to next weekday
  while ([0,6].includes(start.getDay())) start.setDate(start.getDate()+1);
  start.setHours(10,0,0,0);
  const end = new Date(start); end.setMinutes(end.getMinutes()+30);
  function toICS(dt){ return dt.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z'; }
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DMP Exec Site//EN','BEGIN:VEVENT',
    'UID:' + cryptoRandom(),
    'DTSTAMP:' + toICS(new Date()),
    'DTSTART:' + toICS(start),
    'DTEND:' + toICS(end),
    'SUMMARY:Intro call with Devesh Mohan Pandey',
    'DESCRIPTION:Generated from devesh exec site',
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'intro-call.ics'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
});
function cryptoRandom(){ return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16)); }
