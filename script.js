// Nöbet verilerini saklamak için bir obje (Tarih: Saat)
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
const summaryPanel = document.getElementById('summary-panel'); // YENİ ÖZET PANELİ

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

// --- YENİ: Aylık Özeti Hesaplama ve Gösterme Fonksiyonu ---
const updateSummary = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    let totalHours = 0;
    let freeDays = 0;
    
    // O ayın nöbetlerini filtrele ve hesapla
    Object.keys(shifts).forEach(dateKey => {
        const [shiftYear, shiftMonth] = dateKey.split('-').map(Number);
        
        if (shiftYear === year && (shiftMonth - 1) === month) {
            const hours = shifts[dateKey];
            totalHours += hours;
        }
    });

    // O ayda kaç gün var?
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // O ayın tüm günlerini dolaşarak nöbeti olmayanları say (izin günü)
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = formatDate(new Date(year, month, day));
        if (!shifts[dateKey] || shifts[dateKey] === 0) {
            freeDays++;
        }
    }
    
    summaryPanel.innerHTML = `
        <div class="summary-item">
            <strong>Toplam Çalışma:</strong> <span class="hours-total">${totalHours}</span> Saat
        </div>
        <div class="summary-item">
            <strong>Toplam İzin:</strong> <span class="free-days-total">${freeDays}</span> Gün
        </div>
    `;
};

// --- Aylık Giriş Modalı Yönetimi ve İşlemleri ---

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
    // Modal açılırken o anki ayı otomatik seçer (Özellik 3)
    document.getElementById('input-month').value = monthKey; 
    document.getElementById('modal-month-name').textContent = monthNames[month];

    generateDayInputs(year, month);
    fullMonthInputModal.style.display = 'block';
};

fullMonthShiftForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const selectedMonth = document.getElementById('input-month').value;
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; 
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const hoursSelect = document.getElementById(dateKey); 
        
        if (hoursSelect) {
            const hours = parseInt(hoursSelect.value); 
            
            if (hours > 0) {
                shifts[dateKey] = hours; 
            } else {
                delete shifts[dateKey];
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


// --- Takvim Oluşturma Fonksiyonu (Özet Güncelleme Eklendi) ---

const renderCalendar = (date) => {
    calendarEl.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;

    // ÖZETİ GÜNCELLE
    updateSummary(date); 

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
        const hours = shifts[dateKey]; 

        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.setAttribute('data-date', dateKey); 

        const dayNumberEl = document.createElement('div');
        dayNumberEl.classList.add('day-number');
        dayNumberEl.textContent = day;
        dayEl.appendChild(dayNumberEl);

        if (hours) { 
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

        } else { 
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

// --- Tek Gün Düzenleme Modalı Fonksiyonları ---

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

document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditingDate) return;

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

document.getElementById('delete-shift-btn').addEventListener('click', () => {
    if (!currentEditingDate) return;

    if (confirm(`${currentEditingDate} tarihindeki nöbeti silmek istediğinizden emin misiniz?`)) {
        delete shifts[currentEditingDate];
        saveShifts();
        renderCalendar(currentMonth);
        closeEditModal();
    }
});


// --- Olay Dinleyicileri (Başlatma ve Navigasyon) ---

document.getElementById('open-input-modal-btn').addEventListener('click', () => {
    // Giriş butonuna basıldığında mevcut ayı açar (Özellik 3)
    openFullMonthInputModal(new Date()); 
});

document.getElementById('reopen-input-modal-btn').addEventListener('click', () => {
    // Toplu düzenle butonuna basıldığında gösterilen ayı açar
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

// --- Uygulamayı Başlat (Özellik 3 İyileştirmesi) ---
document.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(shifts).length > 0) {
        // En son girilen nöbet tarihini bul
        const lastDate = Object.keys(shifts).sort().pop();
        if (lastDate) {
            const [year, month] = lastDate.split('-').map(Number);
            // Takvimi en son girilen nöbetin ayında başlat
            currentMonth = new Date(year, month - 1, 1); 
        } else {
            // Veri var ama belki eski bir veri temizliği oldu, mevcut ayda başla
            currentMonth = new Date();
        }
        
        startSection.classList.add('hidden');
        calendarView.classList.remove('hidden');
        renderCalendar(currentMonth);
    } else {
        startSection.classList.remove('hidden');
        calendarView.classList.add('hidden');
    }
});
