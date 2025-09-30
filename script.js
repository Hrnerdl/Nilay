// script.js (GÜNCEL SÜRÜM: Örnek Veri Yok, Ekle/Sil/Düzenle Var, PDF Rapor Var)

// Veri depolama ve ID takibi: Başlangıçta boş
let nextTaskId = 1; 
let patients = []; // Örnek hastalar silindi
let tasks = []; // Örnek görevler silindi

// jsPDF için Türkçe karakter destekleyen bir font (Helvetica'nın yerine kullanılacak)
// Bu, Türkçe karakterlerin (ş, ç, ğ, ı, ö, ü) düzgün görünmesini sağlar.
const TurkishFont = 'helvetica'; // jsPDF'in varsayılan fontlarını kullanıyoruz ve otomatik kodlama ile çözüyoruz.
// jsPDF'in kendisi Türkçe karakteri destekler, ek fonta gerek kalmaz, sadece doğru şekilde kullanmalıyız.


// --- BAŞLANGIÇTA ÇALIŞMASI GEREKEN İŞLEMLER ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    renderTasks();
    renderPatients();
    setupForms();
});

// --- NAVİGASYON İŞLEVLERİ (Aynı Kaldı) ---
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
            
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            if (targetId === 'tasks') {
                renderTasks(); 
            } else if (targetId === 'patient-list') {
                renderPatients(); 
            }
        });
    });
}

// --- GÖREV YÖNETİM İŞLEVLERİ (Ekleme, Silme, Düzenleme) ---
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; 
    let pendingCount = 0;

    tasks.sort((a, b) => a.time.localeCompare(b.time));

    if (tasks.length === 0) {
        taskList.innerHTML = '<li style="border-left: 5px solid #9e9e9e; background-color: #f0f0f0;">Henüz eklenmiş görev yok. Lütfen yukarıdaki formu kullanın.</li>';
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        
        let priorityClass = task.priority === 'high' ? 'priority-high' : 
                            task.priority === 'medium' ? 'priority-medium' : '';
        
        li.className = `${priorityClass} ${task.done ? 'task-done' : ''}`;
        
        li.innerHTML = `
            <span><strong>${task.time}</strong> - ${task.text}</span>
            <div class="task-actions">
                <button onclick="toggleTaskDone(${task.id})" class="button" style="padding: 5px 10px; background-color: ${task.done ? '#4caf50' : '#ff9800'};">${task.done ? 'Yapıldı' : 'Onayla'}</button>
                <button onclick="editTask(${task.id})" class="button edit-button" style="padding: 5px 10px;">Düzenle</button>
                <button onclick="deleteTask(${task.id})" class="button delete-button" style="padding: 5px 10px;">Sil</button>
            </div>
        `;
        
        taskList.appendChild(li);

        if (!task.done) {
            pendingCount++;
        }
    });

    document.getElementById('pending-tasks-count').textContent = pendingCount;
}

window.toggleTaskDone = function(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        tasks[taskIndex].done = !tasks[taskIndex].done; 
        renderTasks();
    }
}

window.deleteTask = function(taskId) {
    if (confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
    }
}

window.editTask = function(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('task-id-to-edit').value = task.id;
    document.getElementById('task-text').value = task.text;
    document.getElementById('task-time').value = task.time;
    document.getElementById('task-priority').value = task.priority;

    document.getElementById('task-form-button').textContent = 'Görevi Kaydet';
    document.getElementById('task-form-button').classList.add('edit-button');
}

window.cancelTaskEdit = function() {
    document.getElementById('add-task-form').reset();
    document.getElementById('task-id-to-edit').value = '';
    document.getElementById('task-form-button').textContent = 'Görevi Ekle';
    document.getElementById('task-form-button').classList.remove('edit-button');
}


// --- HASTA YÖNETİM İŞLEVLERİ (Ekleme, Silme, Düzenleme) ---

function renderPatients() {
    const tableBody = document.getElementById('patient-table-body');
    tableBody.innerHTML = ''; 

    if (patients.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" style="text-align: center; color: #777;">Henüz eklenmiş hasta yok. Lütfen yukarıdaki formu kullanın.</td>';
        tableBody.appendChild(tr);
    }

    patients.forEach(patient => {
        const tr = document.createElement('tr');
        
        const allergyHTML = patient.allergies && patient.allergies.toLowerCase() !== 'yok' && patient.allergies !== ''
            ? `<span class="patient-alert">${patient.allergies.toUpperCase()}!</span>`
            : patient.allergies;

        tr.innerHTML = `
            <td>${patient.room}</td>
            <td>${patient.name}</td>
            <td>${patient.diagnosis}</td>
            <td>${allergyHTML}</td>
            <td>${patient.vital}</td>
            <td>
                <button onclick="editPatient('${patient.room}')" class="button edit-button" style="padding: 5px 8px;">Düz.</button>
                <button onclick="deletePatient('${patient.room}')" class="button delete-button" style="padding: 5px 8px;">Sil</button>
            </td>
        `;
        tr.onclick = () => alert(`Hasta Detayı: ${patient.name}\nOda: ${patient.room}\nTanı: ${patient.diagnosis}\nAlerjiler: ${patient.allergies || 'Yok'}\nSon Vital: ${patient.vital || 'Yok'}`);
        
        tableBody.appendChild(tr);
    });
}

window.deletePatient = function(room) {
    if (confirm(`${room} numaralı hastayı silmek istediğinizden emin misiniz?`)) {
        patients = patients.filter(p => p.room !== room);
        renderPatients();
    }
}

window.editPatient = function(room) {
    const patient = patients.find(p => p.room === room);
    if (!patient) return;

    document.getElementById('original-patient-room').value = patient.room; 
    document.getElementById('patient-room').value = patient.room;
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-diagnosis').value = patient.diagnosis;
    document.getElementById('patient-allergies').value = patient.allergies === 'Yok' ? '' : patient.allergies;
    document.getElementById('patient-vital').value = patient.vital === 'Yok' ? '' : patient.vital;

    document.getElementById('patient-form-button').textContent = 'Kaydet';
    document.getElementById('patient-form-button').classList.add('edit-button');
    document.getElementById('patient-room').disabled = true; 
}

window.cancelPatientEdit = function() {
    document.getElementById('add-patient-form').reset();
    document.getElementById('original-patient-room').value = '';
    document.getElementById('patient-form-button').textContent = 'Hasta Ekle';
    document.getElementById('patient-form-button').classList.remove('edit-button');
    document.getElementById('patient-room').disabled = false; 
}


// --- FORM YÖNETİMİ VE EKLEME/GÜNCELLEME İŞLEMLERİ ---

function setupForms() {
    // GÖREV FORMU (Ekleme ve Güncelleme)
    document.getElementById('add-task-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const idToEdit = document.getElementById('task-id-to-edit').value;
        const text = document.getElementById('task-text').value;
        const time = document.getElementById('task-time').value;
        const priority = document.getElementById('task-priority').value;

        if (idToEdit) {
            const taskIndex = tasks.findIndex(t => t.id === parseInt(idToEdit));
            if (taskIndex > -1) {
                tasks[taskIndex].text = text;
                tasks[taskIndex].time = time;
                tasks[taskIndex].priority = priority;
            }
        } else {
            const newTask = {
                id: nextTaskId++, 
                text: text,
                time: time,
                priority: priority,
                done: false
            };
            tasks.push(newTask);
        }

        renderTasks();
        cancelTaskEdit(); 
    });

    // HASTA FORMU (Ekleme ve Güncelleme)
    document.getElementById('add-patient-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const originalRoom = document.getElementById('original-patient-room').value;
        const room = document.getElementById('patient-room').value;
        const name = document.getElementById('patient-name').value;
        const diagnosis = document.getElementById('patient-diagnosis').value;
        const allergies = document.getElementById('patient-allergies').value || 'Yok';
        const vital = document.getElementById('patient-vital').value || 'Yok';

        if (originalRoom) {
            const patientIndex = patients.findIndex(p => p.room === originalRoom);
            if (patientIndex > -1) {
                patients[patientIndex].name = name;
                patients[patientIndex].diagnosis = diagnosis;
                patients[patientIndex].allergies = allergies;
                patients[patientIndex].vital = vital;
            }
        } else {
            if (patients.some(p => p.room === room)) {
                alert(`Hata: ${room} numaralı oda zaten listede var. Lütfen farklı bir oda numarası girin.`);
                return;
            }

            const newPatient = { room, name, diagnosis, allergies, vital };
            patients.push(newPatient);
        }

        renderPatients();
        cancelPatientEdit(); 
    });
}


// --- PDF RAPORLAMA İŞLEVİ (jsPDF Entegrasyonu) ---

window.generatePDFReport = function() { 
    // jsPDF nesnesini oluştur
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // Dikey, mm birimi, A4 boyutu
    let y_offset = 15; // Dikey başlangıç pozisyonu

    // Başlık Stilini Ayarla
    doc.setFont(TurkishFont, 'bold');
    doc.setFontSize(18);
    doc.text('NÖBET TESLİM RAPORU', 105, y_offset, { align: 'center' });
    y_offset += 10;
    
    doc.setFontSize(10);
    doc.setFont(TurkishFont, 'normal');
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, y_offset);
    doc.text(`Saat: ${new Date().toLocaleTimeString('tr-TR')}`, 190, y_offset, { align: 'right' });
    y_offset += 8;

    // --- VARDİYA NOTLARI ---
    doc.setFontSize(14);
    doc.setFont(TurkishFont, 'bold');
    doc.text('1. Vardiya Boyunca Notlar', 20, y_offset);
    y_offset += 5;
    
    const notes = document.getElementById('notes-area').value || 'Özel not girilmemiştir.';
    doc.setFontSize(10);
    doc.setFont(TurkishFont, 'normal');
    const notesText = doc.splitTextToSize(notes, 170); // Genişlik sınırı 170mm
    doc.text(notesText, 20, y_offset);
    y_offset += notesText.length * 5 + 5; // Metin satır sayısına göre boşluk bırak


    // --- GÖREVLERİN ÖZETİ ---
    const completedTasks = tasks.filter(t => t.done).map(t => [t.time, t.text, "Tamamlandı"]);
    const pendingTasks = tasks.filter(t => !t.done).map(t => [t.time, t.text, "Bekliyor"]);
    const taskData = [...completedTasks, ...pendingTasks];

    doc.setFontSize(14);
    doc.setFont(TurkishFont, 'bold');
    doc.text('2. Görevler ve İlaç Takibi Özeti', 20, y_offset);
    y_offset += 5;

    doc.autoTable({
        startY: y_offset,
        head: [['Saat', 'Görev Tanımı', 'Durum']],
        body: taskData,
        theme: 'striped',
        styles: { font: TurkishFont, cellPadding: 2, fontSize: 9 },
        headStyles: { fillColor: [0, 121, 107] }, // #00796b
        columnStyles: {
            0: { cellWidth: 20 },
            2: { cellWidth: 20 }
        }
    });
    y_offset = doc.lastAutoTable.finalY + 10;

    // --- HASTA LİSTESİ ---
    const patientData = patients.map(p => [
        p.room,
        p.name,
        p.diagnosis,
        p.allergies.toUpperCase(),
        p.vital
    ]);

    doc.setFontSize(14);
    doc.setFont(TurkishFont, 'bold');
    doc.text('3. Hasta Profilleri', 20, y_offset);
    y_offset += 5;
    
    doc.autoTable({
        startY: y_offset,
        head: [['Oda', 'Ad Soyad', 'Tanı', 'Alerjiler', 'Son Vital']],
        body: patientData,
        theme: 'grid',
        styles: { font: TurkishFont, cellPadding: 2, fontSize: 9 },
        headStyles: { fillColor: [0, 47, 63] },
        columnStyles: {
            0: { cellWidth: 15 },
            3: { cellWidth: 30, fontStyle: 'bold', textColor: [255, 0, 0] } // Alerjileri kırmızı yap
        }
    });

    // PDF'i kaydet
    doc.save(`NursiFlow_Rapor_${new Date().toLocaleDateString('tr-TR')}.pdf`);
}
