// script.js (GÜNCELLENDİ)

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

// --- NAVİGASYON İŞLEVLERİ ---
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


// --- GÖREV YÖNETİM İŞLEVLERİ ---

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
            <button onclick="toggleTaskDone(${task.id})" class="button" style="padding: 5px 10px; background-color: ${task.done ? '#4caf50' : '#ff9800'};">${task.done ? 'Yapıldı' : 'Onayla'}</button>
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

// --- HASTA YÖNETİM İŞLEVLERİ ---

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
        `;
        tr.onclick = () => alert(`Hasta Detayı: ${patient.name}\nOda: ${patient.room}\nTanı: ${patient.diagnosis}\nAlerjiler: ${patient.allergies || 'Yok'}\nSon Vital: ${patient.vital || 'Yok'}`);
        
        tableBody.appendChild(tr);
    });
}


// --- FORM YÖNETİMİ VE EKLEME İŞLEMLERİ ---

function setupForms() {
    // GÖREV EKLEME FORMU
    document.getElementById('add-task-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const text = document.getElementById('task-text').value;
        const time = document.getElementById('task-time').value;
        const priority = document.getElementById('task-priority').value;

        const newTask = {
            id: nextTaskId++, 
            text: text,
            time: time,
            priority: priority,
            done: false
        };
        
        tasks.push(newTask);
        renderTasks();
        this.reset(); 
    });

    // HASTA EKLEME FORMU
    document.getElementById('add-patient-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const room = document.getElementById('patient-room').value;
        const name = document.getElementById('patient-name').value;
        const diagnosis = document.getElementById('patient-diagnosis').value;
        const allergies = document.getElementById('patient-allergies').value || 'Yok'; 
        const vital = document.getElementById('patient-vital').value || 'Yok';

        const newPatient = {
            room: room,
            name: name,
            diagnosis: diagnosis,
            allergies: allergies,
            vital: vital
        };

        // Oda numarasının daha önce eklenip eklenmediğini kontrol et (Basit Kontrol)
        if (patients.some(p => p.room === room)) {
            alert(`Hata: ${room} numaralı oda zaten listede var. Lütfen farklı bir oda numarası girin.`);
            return;
        }

        patients.push(newPatient);
        renderPatients();
        this.reset();
    });
}


// --- TESLİM RAPORU İŞLEVİ ---
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
