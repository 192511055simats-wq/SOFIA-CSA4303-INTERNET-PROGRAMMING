const DBKEY="vetcure_db_v1";

const seed={
  users:[
    {id:1,name:"Dr. Ayesha Khan",email:"doctor@vetcure.com",password:"doctor123",role:"Doctor",clinic:"Government CVH",bank:"Meezan Bank • 00123456789",easypaisa:"0300-1234567"},
    {id:2,name:"Demo Farmer",email:"farmer@vetcure.com",password:"farmer123",role:"Farmer",clinic:"Government CVH"}
  ],
  doctors:[
    {id:1,name:"Dr. Ayesha Khan",specialty:"Large Animal Specialist",clinic:"Government CVH",fee:0,bank:"Meezan Bank • 00123456789",easypaisa:"0300-1234567"},
    {id:2,name:"Dr. Hamza Ali",specialty:"Pet & Small Animal Specialist",clinic:"Private Clinic",fee:500,bank:"HBL • 00987654321",easypaisa:"0311-9876543"}
  ],
  complaints:[
    {id:1,userId:2,animal:"Cow",age:"3 years",symptoms:"Low appetite and fever",doctorId:1,status:"Responded",solution:"Please arrange a veterinary examination and monitor temperature and hydration.",date:"2026-10-20"}
  ],
  cures:[
    {id:1,disease:"Mastitis",description:"Inflammation of the udder, often associated with abnormal milk and swelling.",prescription:"Veterinary examination is required. Follow the veterinarian's prescribed treatment and maintain udder hygiene."},
    {id:2,disease:"Foot-and-Mouth Disease",description:"A highly contagious viral disease affecting cloven-hoofed animals.",prescription:"Isolate suspected animals and contact a veterinarian/animal-health authority promptly."},
    {id:3,disease:"Canine Parvovirus",description:"A serious contagious viral disease in dogs, commonly causing vomiting and diarrhea.",prescription:"Urgent veterinary care and supportive treatment are required; vaccination is preventive."}
  ],
  news:[
    {id:1,title:"Animal Health Awareness",content:"Keep vaccination records updated and contact a veterinarian when animals show unusual signs."},
    {id:2,title:"Digital Veterinary Records",content:"VetCure stores complaint and response records so farmers can track their animal-health history."}
  ],
  payments:[],
  feedback:[]
};

let db=loadDB();
let currentUser=null;

function loadDB(){
  try{
    const saved=localStorage.getItem(DBKEY);
    return saved?JSON.parse(saved):seed;
  }catch(e){return seed}
}
function saveDB(){localStorage.setItem(DBKEY,JSON.stringify(db))}
function toast(msg){
  const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2600)
}
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const page=document.getElementById(id);
  if(page) page.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
  renderAll();
}
function requireLogin(role="Farmer"){
  if(!currentUser){toast("Please login first.");showPage("login");return false}
  if(role && currentUser.role!==role){toast("This page is for "+role+" accounts.");return false}
  return true
}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

document.getElementById("registerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email=document.getElementById("regEmail").value.trim().toLowerCase();
  if(db.users.some(u=>u.email===email)){toast("Email already registered.");return}
  const role=document.getElementById("regRole").value;
  const id=Math.max(0,...db.users.map(u=>u.id))+1;
  const user={id,name:document.getElementById("regName").value.trim(),email,password:document.getElementById("regPassword").value,role,clinic:role==="Doctor"?document.getElementById("clinicType").value:"Government CVH"};
  db.users.push(user);
  if(role==="Doctor")db.doctors.push({id,name:user.name,specialty:"Veterinary Doctor",clinic:user.clinic,fee:user.clinic==="Private Clinic"?500:0,bank:"Add bank details",easypaisa:"Add EasyPaisa details"});
  saveDB();currentUser=user;toast("Registration successful.");showPage(role==="Doctor"?"doctorDashboard":"dashboard");
});

document.getElementById("loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email=document.getElementById("loginEmail").value.trim().toLowerCase(),pw=document.getElementById("loginPassword").value,role=document.getElementById("loginRole").value;
  const user=db.users.find(u=>u.email===email&&u.password===pw&&u.role===role);
  if(!user){toast("Invalid email, password or role.");return}
  currentUser=user;localStorage.setItem("vetcure_current_user",String(user.id));
  toast("Login successful.");showPage(role==="Doctor"?"doctorDashboard":"dashboard");
});

document.getElementById("complaintForm").addEventListener("submit",e=>{
  e.preventDefault();if(!requireLogin())return;
  const files=[["imageFile","Image"],["audioFile","Audio"],["videoFile","Video"]].filter(([id])=>document.getElementById(id).files.length).map(x=>x[1]);
  const c={id:Math.max(0,...db.complaints.map(x=>x.id))+1,userId:currentUser.id,animal:animalType.value,age:animalAge.value,symptoms:symptoms.value,doctorId:Number(doctorSelect.value),status:"Pending",solution:"",media:files,date:new Date().toISOString().slice(0,10)};
  db.complaints.push(c);saveDB();e.target.reset();toast("Complaint saved successfully.");showPage("status");
});

document.getElementById("paymentForm").addEventListener("submit",e=>{
  e.preventDefault();if(!requireLogin())return;
  const d=db.doctors.find(x=>x.id===Number(paymentDoctor.value));
  if(!d){toast("Select a doctor.");return}
  if(d.fee===0){toast("Government CVH consultation is free.");return}
  const method=document.querySelector('input[name="payMethod"]:checked').value;
  db.payments.push({id:Date.now(),userId:currentUser.id,doctorId:d.id,amount:Number(paymentAmount.value),method,status:"Recorded",date:new Date().toISOString().slice(0,10)});
  saveDB();toast("Payment record saved.");e.target.reset();renderAll();
});
document.getElementById("feedbackForm").addEventListener("submit",e=>{
  e.preventDefault();if(!requireLogin())return;
  db.feedback.push({id:Date.now(),userId:currentUser.id,doctorId:Number(feedbackDoctor.value),rating:Number(rating.value),text:feedbackText.value,date:new Date().toISOString().slice(0,10)});
  saveDB();toast("Feedback submitted.");e.target.reset();
});
document.getElementById("solutionForm").addEventListener("submit",e=>{
  e.preventDefault();if(!requireLogin("Doctor"))return;
  const c=db.complaints.find(x=>x.id===Number(solutionId.value));
  if(!c){toast("Complaint ID not found.");return}
  c.solution=solutionText.value;c.status="Responded";c.doctorId=currentUser.id;saveDB();toast("Solution sent to farmer.");e.target.reset();
});
document.getElementById("cureForm").addEventListener("submit",e=>{
  e.preventDefault();if(!requireLogin("Doctor"))return;
  db.cures.push({id:Date.now(),disease:newDisease.value,description:newCureDesc.value,prescription:newPrescription.value});saveDB();toast("Cure information added.");e.target.reset();
});
document.getElementById("newsForm").addEventListener("submit",e=>{
  e.preventDefault();if(!requireLogin("Doctor"))return;
  db.news.push({id:Date.now(),title:newsTitle.value,content:newsContent.value});saveDB();toast("News published.");e.target.reset();
});
document.getElementById("regRole").addEventListener("change",e=>document.getElementById("clinicWrap").style.display=e.target.value==="Doctor"?"block":"none");
document.getElementById("paymentDoctor").addEventListener("change",updatePaymentDetails);

function renderDoctors(){
  doctorGrid.innerHTML=db.doctors.map(d=>`<article class="doctor-card"><span class="badge">${escapeHTML(d.clinic)}</span><h3>${escapeHTML(d.name)}</h3><p>${escapeHTML(d.specialty)}</p><p><b>${d.fee?"PKR "+d.fee:"FREE"}</b> consultation</p><button class="btn primary" onclick="selectDoctor(${d.id})">Consult / Select</button></article>`).join("");
  doctorSelect.innerHTML=db.doctors.map(d=>`<option value="${d.id}">${escapeHTML(d.name)} — ${d.fee?"PKR "+d.fee:"FREE"}</option>`).join("");
  paymentDoctor.innerHTML=db.doctors.filter(d=>d.fee>0).map(d=>`<option value="${d.id}">${escapeHTML(d.name)} — PKR ${d.fee}</option>`).join("");
  feedbackDoctor.innerHTML=db.doctors.map(d=>`<option value="${d.id}">${escapeHTML(d.name)}</option>`).join("");
}
function selectDoctor(id){showPage("complaint");doctorSelect.value=id}
function updatePaymentDetails(){
  const d=db.doctors.find(x=>x.id===Number(paymentDoctor.value));
  if(d)paymentDetails.innerHTML=`<b>${escapeHTML(d.name)}</b><br>Bank: ${escapeHTML(d.bank)}<br>EasyPaisa: ${escapeHTML(d.easypaisa)}`;
}
function renderCures(){cureGrid.innerHTML=db.cures.map(c=>`<article class="cure-card"><span class="badge">Disease</span><h3>${escapeHTML(c.disease)}</h3><p>${escapeHTML(c.description)}</p><hr><p><b>Care / Prescription:</b> ${escapeHTML(c.prescription)}</p></article>`).join("")}
function renderNews(){newsGrid.innerHTML=db.news.map(n=>`<article class="news-card"><span class="badge">VetCure News</span><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.content)}</p></article>`).join("")}
function renderComplaints(){
  const mine=currentUser?db.complaints.filter(c=>c.userId===currentUser.id):[];
  complaintList.innerHTML=mine.length?mine.map(c=>{const d=db.doctors.find(x=>x.id===c.doctorId);return `<div class="list-item"><span class="status-badge">${escapeHTML(c.status)}</span><h3>#${c.id} • ${escapeHTML(c.animal)}</h3><p>${escapeHTML(c.symptoms)}</p><p>Doctor: ${escapeHTML(d?.name||"Unassigned")} • ${c.date}</p>${c.media?.length?`<p>Attachments: ${c.media.join(", ")}</p>`:""}${c.solution?`<div class="info-box"><b>Doctor response:</b><br>${escapeHTML(c.solution)}</div>`:""}</div>`}).join(""):"<div class='list-item'>No complaints yet.</div>";
}
function renderDoctorComplaints(){doctorComplaintList.innerHTML=db.complaints.map(c=>{const u=db.users.find(x=>x.id===c.userId);return `<div class="list-item"><span class="status-badge">${escapeHTML(c.status)}</span><h3>Complaint #${c.id} • ${escapeHTML(c.animal)}</h3><p>Farmer: ${escapeHTML(u?.name||"Unknown")}</p><p>${escapeHTML(c.symptoms)}</p><p>Date: ${c.date}</p>${c.solution?`<div class="info-box">${escapeHTML(c.solution)}</div>`:""}</div>`}).join("")}
function renderProfile(){
  if(!currentUser){profileCard.innerHTML="<p>Please login to view profile.</p>";return}
  profileCard.innerHTML=`<div class="profile-row"><b>Name</b><span>${escapeHTML(currentUser.name)}</span></div><div class="profile-row"><b>Email</b><span>${escapeHTML(currentUser.email)}</span></div><div class="profile-row"><b>Role</b><span>${escapeHTML(currentUser.role)}</span></div><div class="profile-row"><b>Clinic</b><span>${escapeHTML(currentUser.clinic||"—")}</span></div><button class="btn primary" style="margin-top:20px" onclick="logout()">Logout</button>`;
}
function renderDoctorData(){
  userList.innerHTML=db.users.filter(u=>u.role==="Farmer").map(u=>`<div class="list-item"><h3>${escapeHTML(u.name)}</h3><p>${escapeHTML(u.email)}</p></div>`).join("")||"<div class='list-item'>No farmers registered.</div>";
  paymentList.innerHTML=db.payments.map(p=>{const u=db.users.find(x=>x.id===p.userId),d=db.doctors.find(x=>x.id===p.doctorId);return `<div class="list-item"><h3>PKR ${p.amount} • ${escapeHTML(p.method)}</h3><p>Farmer: ${escapeHTML(u?.name||"Unknown")} • Doctor: ${escapeHTML(d?.name||"Unknown")} • ${p.date}</p></div>`}).join("")||"<div class='list-item'>No payments recorded.</div>";
  feedbackList.innerHTML=db.feedback.map(f=>{const u=db.users.find(x=>x.id===f.userId),d=db.doctors.find(x=>x.id===f.doctorId);return `<div class="list-item"><h3>${"⭐".repeat(f.rating)} • ${escapeHTML(d?.name||"Doctor")}</h3><p>${escapeHTML(f.text)}</p><small>By ${escapeHTML(u?.name||"Farmer")} • ${f.date}</small></div>`}).join("")||"<div class='list-item'>No feedback yet.</div>";
}
function renderReport(){
  const counts={};
  db.complaints.forEach(c=>{const key=c.animal+" symptoms";counts[key]=(counts[key]||0)+1});
  reportSummary.innerHTML=Object.entries(counts).map(([k,v])=>`<div class="summary-card"><b>${v}</b><span>${escapeHTML(k)} recorded</span></div>`).join("")||"<div class='summary-card'>No complaint data available.</div>";
  const canvas=document.getElementById("reportChart"),ctx=canvas.getContext("2d");ctx.clearRect(0,0,canvas.width,canvas.height);
  const vals=Object.values(counts),labels=Object.keys(counts),max=Math.max(...vals,1),barW=canvas.width/Math.max(vals.length,1)*.55;
  ctx.font="14px Segoe UI";ctx.textAlign="center";
  vals.forEach((v,i)=>{const x=(i+.5)*canvas.width/vals.length,y=320-(v/max)*250;ctx.fillStyle="#28764f";ctx.fillRect(x-barW/2,y,barW,320-y);ctx.fillStyle="#17221d";ctx.fillText(labels[i],x,345);ctx.fillText(v,x,y-8)});
}
function renderAll(){
  renderDoctors();renderCures();renderNews();renderComplaints();renderDoctorComplaints();renderProfile();renderDoctorData();renderReport();updatePaymentDetails();
  if(currentUser){dashName.textContent=currentUser.name}
}
function logout(){currentUser=null;localStorage.removeItem("vetcure_current_user");toast("Logged out.");showPage("home")}
(function init(){
  const id=Number(localStorage.getItem("vetcure_current_user"));
  currentUser=db.users.find(u=>u.id===id)||null;
  renderAll();
  document.getElementById("clinicWrap").style.display="none";
})();