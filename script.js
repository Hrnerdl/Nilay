// Nöbet verilerini saklamak için bir obje (Tarih: Saat)
let shifts = JSON.parse(localStorage.getItem('shifts')) || {};

// Geçerli Takvim Ayı
let currentMonth = new Date();

// DOM Elementleri
const startSection = document.getElementById('start-section');
const calendarView = document.getElementById('calendar-view');
const calendarEl = document.getElementById('calendar');
const currentMonthYearEl = document.getElementById('current-month-year');
const fullMonthInputModal = document.getElementById('full-month-input-modal');
const fullMonthShiftForm = document.getElementById('full-month-shift-form');
const daysInputList = document.getElementById('days-input-list');
const editModal = document.getElementById('edit-modal');

// Ay isimleri
const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

// --- Helper Fonksiyonlar ---

const saveShifts = () => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
};

const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};


// --- Modal Yönetimi ---

// Toplu Giriş Modalını Aç
const openFullMonthInputModal = (year, month) => {
    // Input'a YYYY-MM formatını set et
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    document.getElementById('input-month').value = monthKey;
    document.getElementById('modal-month-name').textContent = monthNames[month];

    generateDayInputs(year, month);
    fullMonthInputModal.style.display = 'block';
};

// Ay seçildiğinde gün inputlarını oluştur
const generateDayInputs = (year, month) => {
    daysInputList.innerHTML = '';
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const existingHours = shifts[dateKey] || 0;

        const dayInputGroup = document.createElement('div');
        dayInputGroup.classList.add('day-input-group');
        
        const dayName = fullDate.toLocaleDateString('tr-TR', { weekday: 'short' });
        
        dayInputGroup.innerHTML = `
            <label for="${dateKey}">
                ${day}. ${monthNames[month].substring(0, 3)} (${dayName})
            </label>
            <input type="number" id="${dateKey}" name="${dateKey}" 
                   min="0" max="24" value="${existingHours}" 
                   placeholder="Saat (0=Boş)">
        `;
        daysInputList.appendChild(dayInputGroup);
    }
};

// Modal kapatma
document.querySelector('#full-month-input-modal .close-button').addEventListener('click', () => {
    fullMonthInputModal.style.display = 'none';
});

// Ay seçimi değiştiğinde gün inputlarını güncelle
document.getElementById('input-month').addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    document.getElementById('modal-month-name').textContent = monthNames[month - 1];
    generateDayInputs(date.getFullYear(), date.getMonth());
});

// Toplu Giriş Formu Submit
fullMonthShiftForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hangi ayın seçildiğini bul
    const selectedMonth = document.getElementById('input-month').value;
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // 0-tabanlı
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Tüm günleri döngüye al
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const hoursInput = document.getElementById(dateKey);
        
        if (hoursInput) {
            const hours = parseInt(hoursInput.value);
            
            if (hours > 0) {
                shifts[dateKey] = hours; // Saat bilgisi 
            } else {
                delete shifts[dateKey]; // 0 veya negatif girildiyse sil (boş gün)
            }
        }
    }
    
    saveShifts();
    fullMonthInputModal.style.display = 'none';
    
    // Takvimi yeni girilen ay ile göster
    currentMonth = new Date(year, month, 1);
    renderCalendar(currentMonth);
    
    // Takvim görünümünü aktif et
    startSection.classList.add('hidden');
    calendarView.classList.remove('hidden');
});


// --- Takvim Oluşturma Fonksiyonu ---

const renderCalendar = (date) => {
    calendarEl.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;

    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.classList.add('calendar-day-header');
        header.textContent = day;
        calendarEl.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayIndex = (firstDay === 0 ? 6 : firstDay - 1); 
    
    for (let i = 0; i < startDayIndex; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('empty-day');
        calendarEl.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const hours = shifts[dateKey]; // Nöbet saati veya undefined

        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.setAttribute('data-date', dateKey); 

        const dayNumberEl = document.createElement('div');
        dayNumberEl.classList.add('day-number');
        dayNumberEl.textContent = day;
        dayEl.appendChild(dayNumberEl);

        if (hours) { // Nöbet Günü (Saat varsa)
            dayEl.classList.add('shift-day');
            const shiftInfoEl = document.createElement('div');
            shiftInfoEl.classList.add('shift-info');
            shiftInfoEl.textContent = `${hours} Saat`;
            dayEl.appendChild(shiftInfoEl);
            
            // Düzenleme/Silme için tıklama
            dayEl.addEventListener('click', () => openEditModal(dateKey, hours));

        } else { // Boş/İzin Günü (Saat yoksa)
            dayEl.classList.add('free-day');
            dayEl.textContent += '😊'; // Gülen Yüz Emojisi
            
            // Hızlı Ekleme/Düzenleme için tıklama
            dayEl.addEventListener('click', () => openEditModal(dateKey, 0));
        }
        
        calendarEl.appendChild(dayEl);
    }
};

// --- Olay Dinleyicileri ---

// Başlatma butonu
document.getElementById('open-input-modal-btn').addEventListener('click', () => {
    const today = new Date();
    openFullMonthInputModal(today.getFullYear(), today.getMonth());
});

// Takvimdeki toplu düzenleme butonu
document.getElementById('reopen-input-modal-btn').addEventListener('click', () => {
    openFullMonthInputModal(currentMonth.getFullYear(), currentMonth.getMonth());
});

// Ay Değiştirme Butonları
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar(currentMonth);
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar(currentMonth);
});

// --- Tek Gün Düzenleme Modalı ---

let currentEditingDate = null; 

const openEditModal = (dateKey, hours) => {
    currentEditingDate = dateKey;
    const dateParts = dateKey.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`; 

    document.getElementById('edit-date-display').textContent = `${formattedDate} tarihindeki nöbeti düzenle`;
    document.getElementById('edit-hours').value = hours;
    editModal.style.display = 'block';
};

const closeEditModal = () => {
    editModal.style.display = 'none';
    currentEditingDate = null;
};

document.querySelector('#edit-modal .close-button').addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

// Tek Gün Kaydetme Formu
document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditingDate) return;

    const newHours = parseInt(document.getElementById('edit-hours').value);
    
    if (newHours > 0) {
        shifts[currentEditingDate] = newHours;
    } else {
        delete shifts[currentEditingDate]; // 0 girilirse sil
    }

    saveShifts();
    renderCalendar(currentMonth);
    closeEditModal();
});

// Tek Gün Silme Butonu
document.getElementById('delete-shift-btn').addEventListener('click', () => {
    if (!currentEditingDate) return;

    if (confirm(`${currentEditingDate} tarihindeki nöbeti silmek istediğinizden emin misiniz?`)) {
        delete shifts[currentEditingDate];
        saveShifts();
        renderCalendar(currentMonth);
        closeEditModal();
    }
});


// --- Uygulamayı Başlat ---
document.addEventListener('DOMContentLoaded', () => {
    // Daha önce giriş yapılmış bir ay varsa, uygulamayı doğrudan takvimde başlat.
    if (Object.keys(shifts).length > 0) {
        // En son girilen tarihi bul ve o aya git
        const lastDate = Object.keys(shifts).sort().pop();
        if (lastDate) {
            const [year, month] = lastDate.split('-').map(Number);
            currentMonth = new Date(year, month - 1, 1);
            
            startSection.classList.add('hidden');
            calendarView.classList.remove('hidden');
            renderCalendar(currentMonth);
        }
    }
});
