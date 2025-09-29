/* script.js */
modalTitle.textContent = 'Nöbet Ekle';
shiftDate.value = isoDate;
shiftStart.value = '';
shiftEnd.value = '';
shiftNote.value = '';
showModal();
}


function openModalForEdit(id){
const s = shifts.find(x=>x.id===id);
if(!s) return;
shiftId.value = s.id;
modalTitle.textContent = 'Nöbet Düzenle';
shiftDate.value = s.date;
shiftStart.value = s.start;
shiftEnd.value = s.end;
shiftNote.value = s.note||'';
deleteBtn.style.display = 'inline-block';
showModal();
}


function showModal(){ modal.setAttribute('aria-hidden','false'); }
function hideModal(){ modal.setAttribute('aria-hidden','true'); }


shiftForm.addEventListener('submit', (e)=>{
e.preventDefault();
const id = shiftId.value || cryptoRandomId();
const date = shiftDate.value;
const start = shiftStart.value;
const end = shiftEnd.value;
if(!date || !start || !end) return alert('Lütfen tarih ve saatleri girin.');


// validate times: allow crossing midnight (end < start means next day)
const startDt = new Date(`${date}T${start}`);
let endDt = new Date(`${date}T${end}`);
if(endDt <= startDt) {
// treat as next day
endDt = new Date(`${date}T${end}`);
endDt.setDate(endDt.getDate()+1);
}


const durationHours = (endDt - startDt) / (1000*60*60);
const note = shiftNote.value.trim();


const newShift = { id, date, start, end, note, hours: Number(durationHours.toFixed(2)) };


const existing = shifts.findIndex(s=>s.id===id);
if(existing>=0){ shifts[existing] = newShift; }
else shifts.push(newShift);


saveShifts();
hideModal();
renderCalendar();
});


deleteBtn.addEventListener('click', ()=>{
const id = shiftId.value;
if(!id) return;
if(!confirm('Bu nöbeti silmek istediğinize emin misiniz?')) return;
shifts = shifts.filter(s=>s.id!==id);
saveShifts();
hideModal();
renderCalendar();
});


closeModal.addEventListener('click', hideModal);
modal.addEventListener('click', (e)=>{ if(e.target===modal) hideModal(); });


addShiftBtn.addEventListener('click', ()=>{ openModalForDate(new Date().toISOString().slice(0,10)); });


prevBtn.addEventListener('click', ()=>{ viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1); renderCalendar(); });
nextBtn.addEventListener('click', ()=>{ viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1); renderCalendar(); });


function cryptoRandomId(){ return 'id_'+Math.random().toString(36).slice(2,10); }


// initial render
renderCalendar();


// small helpful feature: show daily total when clicking date's header
calendarEl.addEventListener('dblclick', (e)=>{
const shiftsWrap = e.target.closest('.shifts');
if(!shiftsWrap) return;
const date = shiftsWrap.dataset.date;
const dayShifts = shifts.filter(s=>s.date===date);
const total = dayShifts.reduce((sum,s)=>sum+(s.hours||0),0);
alert(`${date} toplam: ${Number(total.toFixed(2))} saat`);
});
})();