// State
let students = [];
let secretQueue = [];

// DOM Elements
const ethicsGate = document.getElementById('ethicsGate');
const btnAgreeGuide = document.getElementById('btnAgreeGuide');
const btnOpenStudentModal = document.getElementById('btnOpenStudentModal');
const btnCloseStudentModal = document.getElementById('btnCloseStudentModal');
const studentModal = document.getElementById('studentModal');
const studentInput = document.getElementById('studentInput');
const btnAddStudents = document.getElementById('btnAddStudents');
const btnClearStudents = document.getElementById('btnClearStudents');
const studentList = document.getElementById('studentList');
const studentCount = document.getElementById('studentCount');

const extractCount = document.getElementById('extractCount');
const btnExtract = document.getElementById('btnExtract');
const slotMachine = document.getElementById('slotMachine');

const secretModal = document.getElementById('secretModal');
const btnCloseSecretModal = document.getElementById('btnCloseSecretModal');
const secretInput = document.getElementById('secretInput');
const btnSaveSecret = document.getElementById('btnSaveSecret');
const btnClearSecret = document.getElementById('btnClearSecret');
const secretStatus = document.getElementById('secretStatus');

const termsModal = document.getElementById('termsModal');
const privacyModal = document.getElementById('privacyModal');
const btnOpenTerms = document.getElementById('btnOpenTerms');
const btnOpenPrivacy = document.getElementById('btnOpenPrivacy');
const btnCloseTerms = document.getElementById('btnCloseTerms');
const btnClosePrivacy = document.getElementById('btnClosePrivacy');

// Initialize
function init() {
    checkEthicsGuide();
    loadStudents();
    renderStudentList();
    updateSlotPlaceholder();
}

// Local Storage
function loadStudents() {
    const stored = localStorage.getItem('randomPresenter_students');
    if (stored) {
        students = JSON.parse(stored);
    }
}

function saveStudents() {
    localStorage.setItem('randomPresenter_students', JSON.stringify(students));
    renderStudentList();
    updateSlotPlaceholder();
}

// UI Rendering
function renderStudentList() {
    studentList.innerHTML = '';
    students.forEach((student, index) => {
        const li = document.createElement('li');
        li.textContent = student;
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = () => {
            students.splice(index, 1);
            saveStudents();
        };
        li.appendChild(deleteBtn);
        studentList.appendChild(li);
    });
    studentCount.textContent = students.length;
}

function updateSlotPlaceholder() {
    if (students.length === 0) {
        slotMachine.innerHTML = '<div class="slot-placeholder">명단을 추가해 주세요.</div>';
    } else {
        slotMachine.innerHTML = `<div class="slot-placeholder">${students.length}명의 학생이 대기 중입니다. 추출을 시작하세요!</div>`;
    }
}

// Modals
btnOpenStudentModal.addEventListener('click', () => {
    studentModal.classList.remove('hidden');
    studentInput.focus();
});

btnCloseStudentModal.addEventListener('click', () => {
    studentModal.classList.add('hidden');
});

// Add Students
btnAddStudents.addEventListener('click', () => {
    const input = studentInput.value.trim();
    if (!input) return;
    
    // Split by comma or newline
    const newStudents = input.split(/[,\\n]+/).map(s => s.trim()).filter(s => s !== '');
    
    if (newStudents.length > 0) {
        // Add only non-duplicates
        newStudents.forEach(name => {
            if (!students.includes(name)) {
                students.push(name);
            }
        });
        saveStudents();
        studentInput.value = '';
    }
});

btnClearStudents.addEventListener('click', () => {
    if (confirm('정말로 모든 명단을 삭제하시겠습니까?')) {
        students = [];
        saveStudents();
    }
});

// Secret Feature (Ctrl + Shift + H)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        secretModal.classList.toggle('hidden');
        if (!secretModal.classList.contains('hidden')) {
            secretInput.focus();
            updateSecretStatus();
        }
    }
});

btnCloseSecretModal.addEventListener('click', () => {
    secretModal.classList.add('hidden');
});

btnSaveSecret.addEventListener('click', () => {
    const input = secretInput.value.trim();
    if (input) {
        secretQueue = input.split(',').map(s => s.trim()).filter(s => s !== '');
        updateSecretStatus();
        setTimeout(() => secretModal.classList.add('hidden'), 1000);
    }
});

btnClearSecret.addEventListener('click', () => {
    secretQueue = [];
    secretInput.value = '';
    updateSecretStatus();
});

function updateSecretStatus() {
    if (secretQueue.length > 0) {
        secretStatus.textContent = `다음 추출 예정: ${secretQueue.join(', ')}`;
    } else {
        secretStatus.textContent = '';
    }
}

// Extract Logic
btnExtract.addEventListener('click', async () => {
    const count = parseInt(extractCount.value);
    
    if (students.length === 0) {
        alert('먼저 학생 명단을 추가해주세요!');
        btnOpenStudentModal.click();
        return;
    }
    
    if (count > students.length) {
        alert('추출 인원이 현재 학생 수보다 많습니다.');
        return;
    }

    btnExtract.disabled = true;
    
    // Determine winners
    let winners = [];
    
    // 1. Process secret queue first
    for (let i = 0; i < count; i++) {
        if (secretQueue.length > 0) {
            winners.push(secretQueue.shift());
        } else {
            break;
        }
    }
    
    // 2. Fill the rest randomly
    const remainingCount = count - winners.length;
    if (remainingCount > 0) {
        // Exclude secret winners from random pool to avoid duplicates
        const availablePool = students.filter(s => !winners.includes(s));
        
        // Shuffle pool
        for (let i = availablePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
        }
        
        winners.push(...availablePool.slice(0, remainingCount));
    }
    
    updateSecretStatus();
    
    // Build slot UI
    slotMachine.innerHTML = '';
    const slotElements = [];
    
    for (let i = 0; i < count; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        
        const track = document.createElement('div');
        track.className = 'slot-track';
        
        // Populate track with dummy items
        const dummyCount = 20 + (i * 10); // More items for later slots to roll longer
        for (let j = 0; j < dummyCount; j++) {
            const item = document.createElement('div');
            item.className = 'slot-item';
            // Random name for blur effect
            item.textContent = students[Math.floor(Math.random() * students.length)];
            track.appendChild(item);
        }
        
        // Add winner at the end
        const winnerItem = document.createElement('div');
        winnerItem.className = 'slot-item';
        winnerItem.textContent = winners[i];
        track.appendChild(winnerItem);
        
        slot.appendChild(track);
        slotMachine.appendChild(slot);
        slotElements.push({ slot, track, items: dummyCount + 1 });
    }
    
    // Animate
    // Set initial position
    slotElements.forEach(el => {
        el.track.style.transform = `translateY(0px)`;
    });
    
    // Trigger reflow
    void slotMachine.offsetWidth;
    
    // Run animation
    const slotHeight = 120; // matched with CSS
    let completedCount = 0;
    
    slotElements.forEach((el, index) => {
        setTimeout(() => {
            const distance = -((el.items - 1) * slotHeight);
            const duration = 2 + (index * 0.5); // seconds
            
            // Using cubic-bezier for a slow-down effect
            el.track.style.transition = `transform ${duration}s cubic-bezier(0.15, 0.85, 0.25, 1)`;
            el.track.style.transform = `translateY(${distance}px)`;
            
            // On complete
            setTimeout(() => {
                el.slot.classList.add('finished');
                completedCount++;
                
                if (completedCount === count) {
                    btnExtract.disabled = false;
                    fireConfetti();
                }
            }, duration * 1000);
            
        }, 100);
    });
});

function fireConfetti() {
    if (typeof confetti === 'function') {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }
}

// Ethics Gate Logic
function checkEthicsGuide() {
    if (localStorage.getItem('randomPresenter_ethicsAgreed') === 'true') {
        ethicsGate.classList.add('hidden');
    }
}

btnAgreeGuide.addEventListener('click', () => {
    localStorage.setItem('randomPresenter_ethicsAgreed', 'true');
    ethicsGate.classList.add('hidden');
});

// Footer Modals Logic
btnOpenTerms.addEventListener('click', (e) => {
    e.preventDefault();
    termsModal.classList.remove('hidden');
});

btnCloseTerms.addEventListener('click', () => {
    termsModal.classList.add('hidden');
});

btnOpenPrivacy.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.classList.remove('hidden');
});

btnClosePrivacy.addEventListener('click', () => {
    privacyModal.classList.add('hidden');
});

// Close modals when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        // If the clicked element is the overlay itself (not its children)
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });
});

// Init
init();
