// Yeni buton
const bulkBtn = document.createElement("button");
bulkBtn.textContent = "Aylık Nöbet Girişi";
bulkBtn.className = "primary";
document.querySelector(".controls").appendChild(bulkBtn);

// Yeni modal
const bulkModal = document.createElement("div");
bulkModal.className = "modal";
bulkModal.setAttribute("aria-hidden","true");
bulkModal.innerHTML = `
  <div class="modal-card">
    <button class="close" id="closeBulk">×</button>
    <h2>Aylık Nöbet Girişi</h2>
    <form id="bulkForm">
      <label>Ay (YYYY-AA)<input type="month" id="bulkMonth" required></label>
      <label>Çalışma Günleri<input type="text" id="bulkDays" placeholder="ör: 1,2,5-10,15"></label>
      <label>Başlangıç Saati<input type="time" id="bulkStart" required></label>
      <label>Bitiş Saati<input type="time" id="bulkEnd" required></label>
      <div class="form-actions">
        <button type="submit" class="primary">Kaydet</button>
      </div>
    </form>
  </div>`;
document.body.appendChild(bulkModal);

// Açma/kapama
bulkBtn.addEventListener("click", ()=>bulkModal.setAttribute("aria-hidden","false"));
document.getElementById("closeBulk").addEventListener("click", ()=>bulkModal.setAttribute("aria-hidden","true"));

// Toplu kayıt
document.getElementById("bulkForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const month = document.getElementById("bulkMonth").value; // ör: 2025-09
  const daysStr = document.getElementById("bulkDays").value;
  const start = document.getElementById("bulkStart").value;
  const end = document.getElementById("bulkEnd").value;

  if(!month || !daysStr || !start || !end) return alert("Eksik bilgi girdiniz");

  // Günleri parse et
  let days = [];
  daysStr.split(",").forEach(part=>{
    if(part.includes("-")){
      let [a,b] = part.split("-").map(n=>parseInt(n.trim()));
      for(let i=a;i<=b;i++) days.push(i);
    } else {
      days.push(parseInt(part.trim()));
    }
  });

  days.forEach(d=>{
    const date = `${month}-${String(d).padStart(2,"0")}`;
    shifts.push({
      id: Math.random().toString(36).slice(2),
      date,
      start,
      end,
      note: "Toplu giriş"
    });
  });

  saveShifts();
  bulkModal.setAttribute("aria-hidden","true");
  renderCalendar();
});
