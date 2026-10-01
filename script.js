const GOALS = [
  {id:"workout", name:"Workout", desc:"Train / move your body"},
  {id:"protein", name:"Protein Target", desc:"Hit your daily protein goal"},
  {id:"water", name:"Water", desc:"Stay properly hydrated"},
  {id:"study", name:"Study / Skill", desc:"Focused learning session"},
  {id:"sleep", name:"7+ Hours Sleep", desc:"Protect your recovery"},
  {id:"nojunk", name:"No Junk Food", desc:"Keep the diet clean"},
  {id:"steps", name:"8k+ Steps", desc:"Get your daily movement in"},
  {id:"screen", name:"Screen Discipline", desc:"Less pointless scrolling"}
];

const KEY="winterArcTracker_v1";
let state=JSON.parse(localStorage.getItem(KEY)||"{}");
let selected=new Date();
let view=new Date();

function key(d){return d.toISOString().slice(0,10)}
function getDay(d){return state[key(d)]||{}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function fmt(d){return d.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function monthTitle(d){return d.toLocaleDateString(undefined,{month:"long",year:"numeric"})}
function daysInMonth(d){return new Date(d.getFullYear(),d.getMonth()+1,0).getDate()}
function monthDays(d){return Array.from({length:daysInMonth(d)},(_,i)=>new Date(d.getFullYear(),d.getMonth(),i+1))}
function doneCount(d){return GOALS.reduce((n,g)=>n+(getDay(d)[g.id]?1:0),0)}
function isPerfect(d){return doneCount(d)===GOALS.length}
function monthStats(d){
  const days=monthDays(d), tracked=days.filter(x=>doneCount(x)>0), perfect=days.filter(isPerfect);
  const checks=days.reduce((n,x)=>n+doneCount(x),0);
  return {days,tracked,perfect,checks,rate:Math.round(checks/(days.length*GOALS.length)*100)}
}
function render(){
  document.getElementById("yearLabel").textContent=view.getFullYear();
  document.getElementById("monthName").textContent=monthTitle(view);
  document.getElementById("selectedDateLabel").textContent=fmt(selected);
  renderGoals(); renderCalendar(); renderStats();
}
function renderGoals(){
  const box=document.getElementById("goals"), data=getDay(selected);
  box.innerHTML=GOALS.map(g=>`<div class="goal ${data[g.id]?"done":""}" data-id="${g.id}">
    <button class="check" aria-label="toggle ${g.name}"></button>
    <div class="goal-info"><b>${g.name}</b><span>${g.desc}</span></div>
  </div>`).join("");
  box.querySelectorAll(".goal").forEach(el=>el.addEventListener("click",()=>{
    const id=el.dataset.id; const d=getDay(selected); d[id]=!d[id]; state[key(selected)]=d; save(); render();
  }));
}
function renderCalendar(){
  const box=document.getElementById("calendar");
  const first=new Date(view.getFullYear(),view.getMonth(),1);
  const offset=(first.getDay()+6)%7;
  const total=Math.ceil((offset+daysInMonth(view))/7)*7;
  let h='<div class="week">'+["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>`<div>${x}</div>`).join("")+'</div><div class="days">';
  for(let i=0;i<total;i++){
    const n=i-offset+1, d=new Date(view.getFullYear(),view.getMonth(),n), inMonth=n>=1&&n<=daysInMonth(view);
    if(!inMonth){h+='<div class="day muted"></div>';continue}
    const c=doneCount(d), cls=[key(d)===key(new Date())?"today":"",key(d)===key(selected)?"selected":"",c===GOALS.length?"perfect":c>0?"partial":""].join(" ");
    h+=`<div class="day ${cls}" data-date="${key(d)}"><span class="day-num">${n}</span><i class="dot"></i></div>`;
  }
  box.innerHTML=h+"</div>";
  box.querySelectorAll(".day[data-date]").forEach(el=>el.addEventListener("click",()=>{selected=new Date(el.dataset.date+"T12:00:00");render()}));
}
function renderStats(){
  const s=monthStats(view), pct=s.rate;
  document.getElementById("monthPct").textContent=pct+"%";
  document.getElementById("monthBar").style.width=pct+"%";
  document.getElementById("ring").style.background=`conic-gradient(var(--accent) ${pct*3.6}deg,#252b35 0deg)`;
  document.getElementById("completedDays").textContent=`${s.perfect.length} / ${s.days.length}`;
  document.getElementById("monthMessage").textContent=pct>=90?"Locked in.":pct>=70?"Strong momentum.":pct>=40?"Keep stacking days.":"Start your arc today.";
  document.getElementById("totalChecks").textContent=s.checks;
  document.getElementById("score").textContent=pct;
  document.getElementById("scoreBar").style.width=pct+"%";
  document.getElementById("daysTracked").textContent=s.tracked.length;
  document.getElementById("perfectDays").textContent=s.perfect.length;
  document.getElementById("missedDays").textContent=s.days.length-s.perfect.length;
  document.getElementById("avgGoals").textContent=pct+"%";
  let streak=0, best=0, run=0;
  const all=Object.keys(state).sort();
  for(let i=0;i<all.length;i++){
    if(Object.keys(state[all[i]]||{}).length===GOALS.length) run++; else run=0;
    best=Math.max(best,run);
  }
  let cursor=new Date(); cursor.setHours(12,0,0,0);
  while(isPerfect(cursor)){streak++;cursor.setDate(cursor.getDate()-1)}
  document.getElementById("streak").textContent=streak;
  document.getElementById("bestStreak").textContent=best;
  document.getElementById("breakdown").innerHTML=GOALS.map(g=>{
    const count=s.days.reduce((n,d)=>n+(getDay(d)[g.id]?1:0),0), p=Math.round(count/s.days.length*100);
    return `<div class="break-row"><div class="break-top"><span>${g.name}</span><span>${count}/${s.days.length}</span></div><div class="break-bar"><i style="width:${p}%"></i></div></div>`;
  }).join("");
}
document.getElementById("prevMonth").onclick=()=>{view.setMonth(view.getMonth()-1);render()};
document.getElementById("nextMonth").onclick=()=>{view.setMonth(view.getMonth()+1);render()};
document.getElementById("todayBtn").onclick=()=>{selected=new Date();view=new Date();render()};
document.getElementById("resetDay").onclick=()=>{if(confirm("Reset all goals for this day?")){delete state[key(selected)];save();render()}};
document.getElementById("clearAll").onclick=()=>{if(confirm("Clear ALL Winter Arc data? This cannot be undone.")){state={};save();render()}};
render();
