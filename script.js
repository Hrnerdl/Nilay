// script.js (GÜNCEL SÜRÜM: Ekleme, Silme, Düzenleme)

// Veri depolama ve ID takibi
let nextTaskId = 5; 
let patients = [
    { room: "203", name: "Ayşe Yılmaz", diagnosis: "Pnömoni", allergies: "Penisilin!", vital: "14:00 (120/80)" },
    { room: "204", name: "Mehmet Kaya", diagnosis: "Kırık", allergies: "Yok", vital: "14:00 (36.5 °C)" }
];
let tasks = [
    { id: 1, text: "Oda 203: İlaç (Antibiyotik)", time: "16:00", priority: "high", done: false },
    { id: 2, text: "Oda 204: Vital Belirti Ölçümü", time: "15:00", priority: "medium", done: false },
    { id: 3, text: "Oda 203: IV sıvı kontrolü", time: "14:30", priority: "low", done: true },
    { id: 4, text: "Oda 204: Pansuman değişimi", time: "17:00", priority: "high", done: false }
];

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

// Global olarak erişilebilir hale getirildi
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

    // Form alanlarını doldur
    document.getElementById('task-id-to-edit').value = task.id;
    document.getElementById('task-text').value = task.text;
    document.getElementById('task-time').value = task.time;
    document.getElementById('task-priority').value = task.priority;

    // Butonu güncelle
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

    // Form alanlarını doldur
    document.getElementById('original-patient-room').value = patient.room; // Eski oda numarasını sakla
    document.getElementById('patient-room').value = patient.room;
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-diagnosis').value = patient.diagnosis;
    document.getElementById('patient-allergies').value = patient.allergies === 'Yok' ? '' : patient.allergies;
    document.getElementById('patient-vital').value = patient.vital === 'Yok' ? '' : patient.vital;

    // Butonu güncelle
    document.getElementById('patient-form-button').textContent = 'Kaydet';
    document.getElementById('patient-form-button').classList.add('edit-button');
    document.getElementById('patient-room').disabled = true; // Oda numarasını düzenlerken kilitleriz (isteğe bağlı)
}

window.cancelPatientEdit = function() {
    document.getElementById('add-patient-form').reset();
    document.getElementById('original-patient-room').value = '';
    document.getElementById('patient-form-button').textContent = 'Hasta Ekle';
    document.getElementById('patient-form-button').classList.remove('edit-button');
    document.getElementById('patient-room').disabled = false; // Kilidi aç
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
            // Düzenleme Modu
            const taskIndex = tasks.findIndex(t => t.id === parseInt(idToEdit));
            if (taskIndex > -1) {
                tasks[taskIndex].text = text;
                tasks[taskIndex].time = time;
                tasks[taskIndex].priority = priority;
            }
        } else {
            // Ekleme Modu
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
        cancelTaskEdit(); // Formu temizle ve Ekleme moduna dön
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
            // Düzenleme Modu
            const patientIndex = patients.findIndex(p => p.room === originalRoom);
            if (patientIndex > -1) {
                // Oda numarasını güncellemek istiyorsak bu kısımda yapabiliriz, ancak şimdilik kilitli tuttuk.
                // patients[patientIndex].room = room; 
                patients[patientIndex].name = name;
                patients[patientIndex].diagnosis = diagnosis;
                patients[patientIndex].allergies = allergies;
                patients[patientIndex].vital = vital;
            }
        } else {
            // Ekleme Modu
            if (patients.some(p => p.room === room)) {
                alert(`Hata: ${room} numaralı oda zaten listede var. Lütfen farklı bir oda numarası girin.`);
                return;
            }

            const newPatient = { room, name, diagnosis, allergies, vital };
            patients.push(newPatient);
        }

        renderPatients();
        cancelPatientEdit(); // Formu temizle ve Ekleme moduna dön
    });
}


// --- TESLİM RAPORU İŞLEVİ (Aynı Kaldı) ---
window.generateReport = function() { 
    const notes = document.getElementById('notes-area').value;
    const completedTasks = tasks.filter(t => t.done).map(t => `${t.time} - ${t.text}`);
    const pendingTasks = tasks.filter(t => !t.done).map(t => `${t.time} - ${t.text}`);

    let reportText = `*** NÖBET TESLİM RAPORU ***\n`;
    reportText += `Tarih: ${new Date().toLocaleDateString('tr-TR')}\n`;
    reportText += `Saat: ${new Date().toLocaleTimeString('tr-TR')}\n\n`;
    
    reportText += `--- VARDİYA BOYUNCA ÖZEL NOTLAR ---\n`;
    reportText += `${notes || 'Bugün özel not girilmedi.'}\n\n`;

    reportText += `--- TAMAMLANAN GÖREVLER (${completedTasks.length}) ---\n`;
    reportText += completedTasks.length > 0 ? completedTasks.join('\n') : 'Yok';
    reportText += `\n\n`;

    reportText += `--- BEKLEYEN/DEVREDİLEN GÖREVLER (${pendingTasks.length}) ---\n`;
    reportText += pendingTasks.length > 0 ? pendingTasks.join('\n') : 'Yok';
    
    const reportOutput = document.getElementById('report-output');
    reportOutput.textContent = reportText;
    reportOutput.style.display = 'block';
    
    alert('Teslim Raporu Başarıyla Oluşturuldu!');
}
