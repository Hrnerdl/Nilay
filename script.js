(() => {
  const STORAGE_KEY = 'nobetShifts_v1';

  const calendarEl = document.getElementById('calendar');
  const monthLabel = document.getElementById('monthLabel');
  const addShiftBtn = document.getElementById('addShiftBtn');

  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const shiftForm = document.getElementById('shiftForm');
  const shiftDate = document.getElementById('shiftDate');
  const shiftStart = document.getElementById('shiftStart');
  const shiftEnd = document.getElementById('shiftEnd');
  const shiftNote = document.getElementById('shiftNote');
  const shiftId = document.getElementById('shiftId');
  const deleteBtn = document.getElementById('deleteShift');

  let viewDate = new Date();
  let shifts = loadShifts();

  function loadShifts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }
  function saveShifts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
  }

  function renderCalendar() {
    calendarEl.innerHTML = '';
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

    const monthName = viewDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
    monthLabel.textContent = monthName;

    let startWeekday = (start.getDay() + 6) % 7;
    let totalCells = startWeekday + end.getDate();
    let rows = Math.ceil(totalCells / 7);
    let cells = rows * 7;

    for (let i = 0; i < cells; i++) {
      const cell = document.createElement('div');
      cell.className = 'day';
      const dayIndex = i - startWeekday + 1;

      if (dayIndex < 1 || dayIndex > end.getDate()) {
        cell.classList.add('dim');
      } else {
        const thisDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayIndex);
        const iso = thisDate.toISOString().slice(0, 10);

        cell.innerHTML = `<div class="date">${thisDate.getDate()}</div>
                          <div class="shifts" data-date="${iso}"></div>`;

        // Takvim hücresine tıklayınca modal aç
        cell.addEventListener('click', () => {
          openModalForDate(iso);
        });
      }
      calendarEl.appendChild(cell);
    }

    // Kaydedilmiş nöbetleri ekrana bas
    shifts.forEach(s => {
      const cellShifts = calendarEl.querySelector(`.shifts[data-date="${s.date}"]`);
      if (!cellShifts) return;
      const pill = document.createElement('div');
      pill.className = 'shift-pill';
      pill.textContent = `${s.start}-${s.end} ${s.note || ''}`;
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        openModalForEdit(s.id);
      });
      cellShifts.appendChild(pill);
    });
  }

  function openModalForDate(date) {
    shiftForm.reset();
    shiftId.value = '';
    shiftDate.value = date;
    deleteBtn.style.display = 'none';
    modal.style.display = 'flex';
  }

  function openModalForEdit(id) {
    const s = shifts.find(x => x.id === id);
    if (!s) return;
    shiftId.value = s.id;
    shiftDate.value = s.date;
    shiftStart.value = s.start;
    shiftEnd.value = s.end;
    shiftNote.value = s.note || '';
    deleteBtn.style.display = 'block';
    modal.style.display = 'flex';
  }

  shiftForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = shiftId.value || Math.random().toString(36).substr(2, 9);
    const newShift = {
      id,
      date: shiftDate.value,
      start: shiftStart.value,
      end: shiftEnd.value,
      note: shiftNote.value
    };
    const index = shifts.findIndex(s => s.id === id);
    if (index >= 0) shifts[index] = newShift;
    else shifts.push(newShift);
    saveShifts();
    modal.style.display = 'none';
    renderCalendar();
  });

  deleteBtn.addEventListener('click', () => {
    const id = shiftId.value;
    shifts = shifts.filter(s => s.id !== id);
    saveShifts();
    modal.style.display = 'none';
    renderCalendar();
  });

  closeModal.addEventListener('click', () => modal.style.display = 'none');
  addShiftBtn.addEventListener('click', () => {
    openModalForDate(new Date().toISOString().slice(0, 10));
  });

  renderCalendar();
})();
