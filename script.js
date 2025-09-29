// Nöbet verilerini saklamak için bir obje (Tarih: Saat)
let shifts = JSON.parse(localStorage.getItem('shifts')) || {};

// Geçerli Takvim Ayı
let currentMonth = new Date();

// DOM Elementleri
const calendarEl = document.getElementById('calendar');
const currentMonthYearEl = document.getElementById('current-month-year');
const shiftForm = document.getElementById('shift-form');
const editModal = document.getElementById('edit-modal');
const closeBtn = document.querySelector('.close-button');
const editForm = document.getElementById('edit-form');
const deleteShiftBtn = document.getElementById('delete-shift-btn');

// --- Helper Fonksiyonlar ---

// Verileri Local Storage'a kaydetme
const saveShifts = () => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
};

// Tarih objesini YYYY-MM-DD formatına çevirme
const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
};

// --- Takvim Oluşturma Fonksiyonu ---

const renderCalendar = (date) => {
    calendarEl.innerHTML = ''; // Takvimi temizle

    const year = date.getFullYear();
    const month = date.getMonth();

    // Ay ve Yıl Başlığını Güncelle
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;

    // Haftanın Günleri Başlıkları
    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.classList.add('calendar-day-header');
        header.textContent = day;
        calendarEl.appendChild(header);
    });

    // Ayın ilk günü ve toplam gün sayısı
    const firstDay = new Date(year, month, 1).getDay(); // 0=Pazar, 1=Pazartesi...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // İlk günün Pazartesi'den başlaması için boşluklar
    // JS'te Pazar 0 olduğu için, Pazartesi 1'i 7 yapıyoruz (Türk takvimi)
    const startDayIndex = (firstDay === 0 ? 6 : firstDay - 1); 
    
    for (let i = 0; i < startDayIndex; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('empty-day');
        calendarEl.appendChild(emptyDay);
    }

    // Günleri Ekleme
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateKey = formatDate(fullDate);
        const hours = shifts[dateKey];

        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.setAttribute('data-date', dateKey); // Tarih bilgisini kaydet

        // Gün Numarası
        const dayNumberEl = document.createElement('div');
        dayNumberEl.classList.add('day-number');
        dayNumberEl.textContent = day;
        dayEl.appendChild(dayNumberEl);

        // Nöbet Varsa Bilgiyi Ekle
        if (hours) {
            const shiftInfoEl = document.createElement('div');
            shiftInfoEl.classList.add('shift-info');
            shiftInfoEl.textContent = `${hours} Saat`;
            dayEl.appendChild(shiftInfoEl);
            
            // Nöbet olan günlere özel tıklama olayı
            dayEl.addEventListener('click', () => openEditModal(dateKey, hours));
        } else {
             // Nöbet olmayan günlere hızlı ekleme için tıklama olayı
            dayEl.addEventListener('click', () => {
                // Hızlı ekleme için formu ilgili tarihe odaklayabiliriz
                document.getElementById('shift-date').value = dateKey;
                document.getElementById('shift-hours').focus();
            });
        }
        
        calendarEl.appendChild(dayEl);
    }
};

// --- Olay Dinleyicileri (Event Listeners) ---

// 1. Nöbet Ekleme Formu
shiftForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dateInput = document.getElementById('shift-date').value;
    const hoursInput = parseInt(document.getElementById('shift-hours').value);

    if (dateInput && hoursInput > 0) {
        shifts[dateInput] = hoursInput;
        saveShifts();
        renderCalendar(currentMonth);
        
        // Formu temizle
        shiftForm.reset(); 
    }
});

// 2. Ay Değiştirme Butonları
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar(currentMonth);
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar(currentMonth);
});

// --- Düzenleme Modalı Fonksiyonları ---

let currentEditingDate = null; // Hangi tarihi düzenlediğimizi tutar

const openEditModal = (dateKey, hours) => {
    currentEditingDate = dateKey;
    const dateParts = dateKey.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`; // DD.MM.YYYY

    document.getElementById('edit-date-display').textContent = `${formattedDate} tarihindeki nöbeti düzenle`;
    document.getElementById('edit-hours').value = hours;
    editModal.style.display = 'block';
};

const closeEditModal = () => {
    editModal.style.display = 'none';
    currentEditingDate = null;
};

// Modal kapatma tuşları
closeBtn.addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

// 3. Nöbet Düzenleme Formu
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditingDate) return;

    const newHours = parseInt(document.getElementById('edit-hours').value);
    
    if (newHours > 0) {
        shifts[currentEditingDate] = newHours;
        saveShifts();
        renderCalendar(currentMonth);
        closeEditModal();
    }
});

// 4. Nöbet Silme Butonu
deleteShiftBtn.addEventListener('click', () => {
    if (!currentEditingDate) return;

    if (confirm(`${currentEditingDate} tarihindeki nöbeti silmek istediğinizden emin misiniz?`)) {
        delete shifts[currentEditingDate];
        saveShifts();
        renderCalendar(currentMonth);
        closeEditModal();
    }
});


// Uygulamayı Başlat
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar(currentMonth);
});
