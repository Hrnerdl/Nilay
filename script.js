// Nöbet verilerini saklamak için bir obje (Tarih: // Nöbet verilerini saklamak için bir obje (Tarih: Saat)
let shifts = JSON.parse(localStorage.getItem('shifts')) || {};

// Geçerli Takvim Ayını tutar.
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
                    
// Sabit Nöbet Seçenekleri
const SHIFT_OPTIONS = [
    { value: 0, label: "0 Saat (Boş/İzin)" },
    { value: 8, label: "8 Saat" },
    { value: 16, label: "16 Saat" },
    { value: 24, label: "24 Saat" }
];

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

const getShiftColorClass = (hours) => {
    if (hours === 8) return 'shift-8';
    if (hours === 16) return 'shift-16';
    if (hours === 24) return 'shift-24';
    return ''; 
};


// --- Aylık Giriş Modalı Yönetimi ve İşlemleri (GÜNCELLENDİ) ---

// Toplu Giriş Modalındaki Gün Inputlarını Oluşturma (SELECT KULLANIMI)
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
        
        // SELECT elementini oluştur
        let selectHtml = `<select id="${dateKey}" name="${dateKey}">`;
        
        SHIFT_OPTIONS.forEach(option => {
            const selected = (option.value === existingHours) ? 'selected' : '';
            selectHtml += `<option value="${option.value}" ${selected}>${option.label}</option>`;
        });
        
        selectHtml += `</select>`;

        dayInputGroup.innerHTML = `
            <label for="${dateKey}">
                ${day}. ${monthNames[month].substring(0, 3)} (${dayName})
            </label>
            ${selectHtml}
        `;
        daysInputList.appendChild(dayInputGroup);
    }
};

const openFullMonthInputModal = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    document.getElementById('input-month').value = monthKey;
    document.getElementById('modal-month-name').textContent = monthNames[month];

    generateDayInputs(year, month);
    fullMonthInputModal.style.display = 'block';
};

// Toplu Giriş Formu Submit Olayı (SELECT VERİLERİNİ OKUMA)
fullMonthShiftForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const selectedMonth = document.getElementById('input-month').value;
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; 
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Tüm günlerin SELECT elementlerini kontrol et
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        // Artık input değil, select okuyoruz
        const hoursSelect = document.getElementById(dateKey); 
        
        if (hoursSelect) {
            // Değeri string olarak alır, parseInt ile sayıya çeviririz
            const hours = parseInt(hoursSelect.value); 
            
            if (hours > 0) {
                shifts[dateKey] = hours; 
            } else {
                delete shifts[dateKey]; // 0 girildiyse siliyoruz (Boş Gün)
            }
        }
    }
    
    saveShifts();
    fullMonthInputModal.style.display = 'none';
    
    currentMonth = new Date(year, month, 1);
    renderCalendar(currentMonth);
    
    startSection.classList.add('hidden');
    calendarView.classList.remove('hidden');
});

document.getElementById('input-month').addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    document.getElementById('modal-month-name').textContent = monthNames[month - 1];
    generateDayInputs(date.getFullYear(), date.getMonth());
});


// --- Takvim Oluşturma Fonksiyonu (GÜNCELLENDİ) ---

const renderCalendar = (date) => {
    calendarEl.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;

    // Yeni gün isimleri sırası: Pzt, Sal, Çar, Per, Cum, Cmt, Paz
    const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.classList.add('calendar-day-header');
        header.textContent = day;
        calendarEl.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Haftanın başlangıcı Pazartesi (1) olmalı.
    // getDay() Pazar (0) ile başlar.
    // Pazar (0) -> 6 boşluk (son gün)
    // Pazartesi (1) -> 0 boşluk (ilk gün)
    // Salı (2) -> 1 boşluk
    // ...
    // Cumartesi (6) -> 5 boşluk
    const startDayIndex = (firstDay === 0) ? 6 : firstDay - 1; // Pazar=0, Pzt=1... Cmt=6 -> 6 boşluk, 0 boşluk... 5 boşluk

    for (let i = 0; i < startDayIndex; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('empty-day');
        calendarEl.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const hours = shifts[dateKey]; 

        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.setAttribute('data-date', dateKey); 

        const dayNumberEl = document.createElement('div');
        dayNumberEl.classList.add('day-number');
        dayNumberEl.textContent = day;
        dayEl.appendChild(dayNumberEl);

        if (hours) { // Nöbet Günü
            dayEl.classList.add('shift-day');
            
            const shiftInfoEl = document.createElement('div');
            shiftInfoEl.classList.add('shift-info');
            
            const colorClass = getShiftColorClass(hours);
            if (colorClass) {
                shiftInfoEl.classList.add(colorClass); 
            }
            
            shiftInfoEl.textContent = `${hours} Saat`;
            dayEl.appendChild(shiftInfoEl);
            
            dayEl.addEventListener('click', () => openEditModal(dateKey, hours));

        } else { // Boş/İzin Günü
            dayEl.classList.add('free-day');
            
            const emojiEl = document.createElement('div');
            emojiEl.textContent = '😊'; 
            emojiEl.classList.add('free-day-emoji');
            dayEl.appendChild(emojiEl);
            
            dayEl.addEventListener('click', () => openEditModal(dateKey, 0));
        }
        
        calendarEl.appendChild(dayEl);
    }
};

// --- Tek Gün Düzenleme Modalı Fonksiyonları (GÜNCELLENDİ) ---

let currentEditingDate = null; 

// openEditModal (SELECT DEĞERİNİ AYARLAMA)
const openEditModal = (dateKey, hours) => {
    currentEditingDate = dateKey;
    const dateParts = dateKey.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`; 

    document.getElementById('edit-date-display').textContent = `${formattedDate} tarihindeki nöbeti düzenle`;
    
    // Select elementinin değerini (hours) ayarlıyoruz
    document.getElementById('edit-hours').value = hours;
    
    editModal.style.display = 'block';
};

const closeEditModal = () => {
    editModal.style.display = 'none';
    currentEditingDate = null;
};

// Tek Gün Kaydetme Formu (SELECT VERİSİNİ OKUMA)
document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditingDate) return;

    // Select'ten gelen değeri okuyoruz
    const newHours = parseInt(document.getElementById('edit-hours').value);
    
    if (newHours > 0) {
        shifts[currentEditingDate] = newHours;
    } else {
        delete shifts[currentEditingDate]; 
    }

    saveShifts();
    renderCalendar(currentMonth);
    closeEditModal();
});

// Tek Gün Silme Butonu (Değişiklik Yok)
document.getElementById('delete-shift-btn').addEventListener('click', () => {
    if (!currentEditingDate) return;

    if (confirm(`${currentEditingDate} tarihindeki nöbeti silmek istediğinizden emin misiniz?`)) {
        delete shifts[currentEditingDate];
        saveShifts();
        renderCalendar(currentMonth);
        closeEditModal();
    }
});


// --- Olay Dinleyicileri (Başlatma ve Navigasyon) (Değişiklik Yok) ---

document.getElementById('open-input-modal-btn').addEventListener('click', () => {
    openFullMonthInputModal(new Date());
});

document.getElementById('reopen-input-modal-btn').addEventListener('click', () => {
    openFullMonthInputModal(currentMonth);
});

document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar(currentMonth);
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar(currentMonth);
});

document.querySelector('.full-month-close-btn').addEventListener('click', () => fullMonthInputModal.style.display = 'none');
document.querySelector('.edit-close-btn').addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => {
    if (event.target === fullMonthInputModal) {
        fullMonthInputModal.style.display = 'none';
    } else if (event.target === editModal) {
        closeEditModal();
    }
});

// --- Uygulamayı Başlat (Değişiklik Yok) ---
document.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(shifts).length > 0) {
        const lastDate = Object.keys(shifts).sort().pop();
        if (lastDate) {
            const [year, month] = lastDate.split('-').map(Number);
            currentMonth = new Date(year, month - 1, 1);
        }
        
        startSection.classList.add('hidden');
        calendarView.classList.remove('hidden');
        renderCalendar(currentMonth);
    } else {
        startSection.classList.remove('hidden');
        calendarView.classList.add('hidden');
    }
});

