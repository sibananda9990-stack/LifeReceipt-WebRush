const seed = [
  {id:1,type:"music",icon:"♪",title:"The song I played at 2 AM",detail:"One track, one quiet room, and a head full of unfinished thoughts.",date:"2026-09-18",value:"03:17",location:"Headphones"},
  {id:2,type:"place",icon:"⌖",title:"A place worth the detour",detail:"Stopped here without a plan. Stayed longer than expected.",date:"2026-09-16",value:"18 km",location:"Bhadrak, IN"},
  {id:3,type:"purchase",icon:"₹",title:"Coffee for a better morning",detail:"A tiny purchase that somehow fixed the first half of the day.",date:"2026-09-15",value:"₹120",location:"Campus Café"},
  {id:4,type:"photo",icon:"◉",title:"Golden hour, no filter",detail:"A photo that still feels warmer than the actual evening.",date:"2026-09-12",value:"1 photo",location:"Gallery"},
  {id:5,type:"message",icon:"✉",title:"The message I almost didn't send",detail:"Sometimes a few words are enough to change the whole night.",date:"2026-09-10",value:"23:48",location:"Messages"},
  {id:6,type:"music",icon:"♪",title:"Playlist: Roads & Rain",detail:"The soundtrack for a ride with nowhere specific to go.",date:"2026-09-08",value:"47 min",location:"Spotify"},
  {id:7,type:"place",icon:"⌖",title:"First visit, familiar feeling",detail:"New street. Familiar sky. Added to the places I want to return to.",date:"2026-09-06",value:"1 visit",location:"Cuttack, IN"},
  {id:8,type:"purchase",icon:"₹",title:"Something I had wanted",detail:"Not necessary. Still worth it. Some receipts are emotional.",date:"2026-09-04",value:"₹899",location:"Online"},
  {id:9,type:"photo",icon:"◉",title:"Friends, slightly blurry",detail:"The best photos are rarely the ones that were planned.",date:"2026-09-02",value:"3 photos",location:"Camera Roll"},
  {id:10,type:"message",icon:"✉",title:"Goodnight became 2 hours",detail:"A conversation that refused to end when the clock did.",date:"2026-08-29",value:"02:06",location:"Messages"},
  {id:11,type:"music",icon:"♪",title:"That one repeat song",detail:"Played it once. Then again. Then decided it belonged to this day.",date:"2026-08-27",value:"11 plays",location:"Music"},
  {id:12,type:"place",icon:"⌖",title:"A road I will remember",detail:"No destination saved. Just the route, the air and the moment.",date:"2026-08-24",value:"32 km",location:"Odisha, IN"}
];

let memories = JSON.parse(localStorage.getItem("lifeReceiptMemories") || "null") || seed;
let filter = "all";
const $ = s => document.querySelector(s);

function save(){ localStorage.setItem("lifeReceiptMemories", JSON.stringify(memories)); }

function niceDate(d){
  return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

function render(){
  const q = $("#searchInput").value.toLowerCase().trim();
  const shown = memories.filter(m => (filter==="all" || m.type===filter) &&
    [m.title,m.detail,m.location,m.type].some(x=>String(x).toLowerCase().includes(q)));
  $("#receiptGrid").innerHTML = shown.map(m => `
    <article class="receipt">
      <div class="receipt-head"><span class="type-icon">${m.icon}</span><span class="date">${niceDate(m.date)}</span></div>
      <h3>${escapeHTML(m.title)}</h3>
      <p class="detail">${escapeHTML(m.detail || "A memory captured in your digital life.")}</p>
      <div class="receipt-divider"></div>
      <div class="receipt-foot">
        <div><span class="tag">${escapeHTML(m.type)}</span><div class="location">${escapeHTML(m.location || "—")}</div></div>
        <span class="value">${escapeHTML(m.value || "PRICELESS")}</span>
      </div>
    </article>`).join("");
  $("#emptyState").hidden = shown.length !== 0;
  $("#countPill").textContent = `${shown.length} receipt${shown.length===1?"":"s"}`;
  $("#totalStat").textContent = String(memories.length).padStart(2,"0");
  const month = new Date().getMonth();
  $("#monthStat").textContent = String(memories.filter(m=>new Date(m.date+"T00:00:00").getMonth()===month).length).padStart(2,"0");
  $("#placesStat").textContent = String(new Set(memories.filter(m=>m.type==="place").map(m=>m.location)).size).padStart(2,"0");
  const hours = {Night:0,Evening:0,Morning:0,Afternoon:0};
  memories.forEach(m=>{const n=parseInt((m.value||"").match(/\d{1,2}/)?.[0]); if(n<6)hours.Night++; else if(n<12)hours.Morning++; else if(n<18)hours.Afternoon++; else hours.Evening++;});
  $("#activeStat").textContent = Object.entries(hours).sort((a,b)=>b[1]-a[1])[0][0];
}

function openModal(){
  $("#modalBackdrop").hidden=false;
  const d = new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
  document.querySelector('[name="date"]').value=d.toISOString().slice(0,10);
  document.querySelector('[name="title"]').focus();
}
function closeModal(){ $("#modalBackdrop").hidden=true; }

document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); filter=btn.dataset.filter; render();
}));
$("#searchInput").addEventListener("input",render);
$("#addBtn").addEventListener("click",openModal);
$("#emptyAddBtn").addEventListener("click",openModal);
$("#closeModal").addEventListener("click",closeModal);
$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

$("#memoryForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f = new FormData(e.target), icons={music:"♪",place:"⌖",purchase:"₹",photo:"◉",message:"✉"};
  memories.unshift({id:Date.now(),type:f.get("type"),icon:icons[f.get("type")],title:f.get("title"),detail:f.get("detail"),date:f.get("date"),value:f.get("value")||"PRICELESS",location:f.get("location")||"Digital life"});
  save(); render(); closeModal(); e.target.reset();
  toast("Receipt created — your moment is saved.");
});

$("#themeBtn").addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  localStorage.setItem("lifeReceiptTheme",document.body.classList.contains("dark")?"dark":"light");
});
if(localStorage.getItem("lifeReceiptTheme")==="dark") document.body.classList.add("dark");

function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
$("#randomBtn").addEventListener("click",()=>{
  const m=memories[Math.floor(Math.random()*memories.length)];
  $("#searchInput").value=m.title; filter="all";
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter==="all"));
  render(); document.querySelector(".toolbar-section").scrollIntoView({behavior:"smooth"}); toast("A random receipt from your life.");
});
render();
