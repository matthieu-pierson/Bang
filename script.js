/* Translations */
const translations = {
    fr: {
        // Setup view
        subtitle: "Distributeur de Rôles",
        instruction: "Entrez les noms des joueurs, séparés par des virgules.",
        distribute: "Distribuer",
        editRules: "⚙️ Modifier les Règles",
        viewDistribution: "📋 Voir la Dernière Distribution",
        
        // Game view
        passDevice: "Passe l'appareil à...",
        tapToReveal: "Touche pour Révéler",
        tapToHide: "Touche à nouveau pour cacher",
        
        // End view
        allRolesDistributed: "Tous les rôles distribués !",
        newGame: "Nouvelle Partie",
        
        // Editor view
        editorTitle: "Éditeur de Règles",
        players: "Joueurs",
        currentConfigs: "Configurations Actuelles",
        addConfig: "Ajouter une Configuration",
        sheriff: "Shérif",
        renegade: "Renégat",
        outlaw: "Hors-la-loi",
        deputy: "Adjoint",
        add: "Ajouter",
        reset: "Réinitialiser",
        back: "Retour",
        delete: "Supprimer",
        noConfig: "Aucune configuration",
        
        // Distribution view
        lastDistribution: "Dernière Distribution",
        
        // Errors
        errorPlayers: "Veuillez entrer entre 4 et 7 joueurs.",
        errorRules: "Erreur de chargement des règles pour ce nombre de joueurs.",
        errorTotal: "Le total doit être {count} joueurs (actuellement {current})",
        configAdded: "Configuration ajoutée !",
        confirmReset: "Êtes-vous sûr de vouloir réinitialiser toutes les règles aux valeurs par défaut ?",
        
        // Roles
        roleSheriff: "Shérif",
        roleRenegade: "Renégat",
        roleOutlaw: "Hors-la-loi",
        roleDeputy: "Adjoint"
    },
    en: {
        // Setup view
        subtitle: "Role Distributor",
        instruction: "Enter player names, separated by commas.",
        distribute: "Distribute",
        editRules: "⚙️ Edit Rules",
        viewDistribution: "📋 View Last Distribution",
        
        // Game view
        passDevice: "Pass the device to...",
        tapToReveal: "Tap to Reveal",
        tapToHide: "Tap again to hide",
        
        // End view
        allRolesDistributed: "All roles distributed!",
        newGame: "New Game",
        
        // Editor view
        editorTitle: "Rules Editor",
        players: "Players",
        currentConfigs: "Current Configurations",
        addConfig: "Add Configuration",
        sheriff: "Sheriff",
        renegade: "Renegade",
        outlaw: "Outlaw",
        deputy: "Deputy",
        add: "Add",
        reset: "Reset",
        back: "Back",
        delete: "Delete",
        noConfig: "No configuration",
        
        // Distribution view
        lastDistribution: "Last Distribution",
        
        // Errors
        errorPlayers: "Please enter between 4 and 7 players.",
        errorRules: "Error loading rules for this number of players.",
        errorTotal: "Total must be {count} players (currently {current})",
        configAdded: "Configuration added!",
        confirmReset: "Are you sure you want to reset all rules to default values?",
        
        // Roles
        roleSheriff: "Sheriff",
        roleRenegade: "Renegade",
        roleOutlaw: "Outlaw",
        roleDeputy: "Deputy"
    }
};

let currentLang = 'fr';

function t(key, params = {}) {
    let text = translations[currentLang][key] || key;
    // Replace parameters like {count}
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    return text;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('bang_language', lang);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update dynamic content
    updateDynamicTranslations();
}

function updateDynamicTranslations() {
    // Update instruction text if in game view
    if (isCardRevealed) {
        display.instruction.textContent = t('tapToHide');
    } else if (currentIndex < players.length) {
        display.instruction.textContent = t('passDevice');
    }
}

// Load saved language preference
function loadLanguage() {
    const savedLang = localStorage.getItem('bang_language') || 'fr';
    setLanguage(savedLang);
}

/* Game Logic */

// Default rules embedded directly (no need for external file)
const DEFAULT_RULES_TEXT = `4 joueurs : 1 sherif, 1 renegat, 0 horslaloi, 2 adjoint
4 joueurs : 1 sherif, 1 renegat, 1 horslaloi, 1 adjoint
4 joueurs : 1 sherif, 1 renegat, 2 horslaloi, 0 adjoint

5 joueurs : 1 sherif, 1 renegat, 0 horslaloi, 3 adjoint
5 joueurs : 1 sherif, 1 renegat, 1 horslaloi, 2 adjoint
5 joueurs : 1 sherif, 1 renegat, 2 horslaloi, 1 adjoint
5 joueurs : 1 sherif, 1 renegat, 3 horslaloi, 0 adjoint

6 joueurs : 1 sherif, 1 renegat, 0 horslaloi, 4 adjoint
6 joueurs : 1 sherif, 1 renegat, 1 horslaloi, 3 adjoint
6 joueurs : 1 sherif, 1 renegat, 2 horslaloi, 2 adjoint
6 joueurs : 1 sherif, 1 renegat, 3 horslaloi, 1 adjoint
6 joueurs : 1 sherif, 1 renegat, 4 horslaloi, 0 adjoint

7 joueurs : 1 sherif, 1 renegat, 0 horslaloi, 5 adjoint
7 joueurs : 1 sherif, 1 renegat, 1 horslaloi, 4 adjoint
7 joueurs : 1 sherif, 1 renegat, 2 horslaloi, 3 adjoint
7 joueurs : 1 sherif, 1 renegat, 3 horslaloi, 2 adjoint
7 joueurs : 1 sherif, 1 renegat, 4 horslaloi, 1 adjoint
7 joueurs : 1 sherif, 1 renegat, 5 horslaloi, 0 adjoint`;

let RULES = {};
let DEFAULT_RULES = {}; // Store defaults for reset

// LocalStorage keys
const RULES_STORAGE_KEY = 'bang_custom_rules';
const DISTRIBUTION_STORAGE_KEY = 'bang_last_distribution';

// Parse rules text and build RULES object
function loadRules() {
    try {
        // Try to load custom rules from localStorage first
        const customRules = localStorage.getItem(RULES_STORAGE_KEY);
        if (customRules) {
            RULES = JSON.parse(customRules);
            console.log('Loaded custom rules from localStorage:', RULES);

            // Still load defaults for reset functionality
            loadDefaultRules();
            return;
        }

        // Load from embedded rules if no custom rules
        loadDefaultRules();
        RULES = JSON.parse(JSON.stringify(DEFAULT_RULES)); // Deep copy
        console.log('Loaded default rules:', RULES);
    } catch (error) {
        console.error('Error loading rules:', error);
        showError('Failed to load rules. Please refresh the page.');
    }
}

function loadDefaultRules() {
    const lines = DEFAULT_RULES_TEXT.split('\n').filter(line => line.trim().length > 0);

    const tempRules = {};
    lines.forEach(line => {
        // Parse: "4 joueurs : 1 sherif, 1 renegat, 0 horslaloi, 2 adjoint"
        const match = line.match(/(\d+)\s+joueurs\s*:\s*(\d+)\s+sherif,\s*(\d+)\s+renegat,\s*(\d+)\s+horslaloi,\s*(\d+)\s+adjoint/i);

        if (match) {
            const playerCount = parseInt(match[1]);
            const sheriffCount = parseInt(match[2]);
            const renegadeCount = parseInt(match[3]);
            const outlawCount = parseInt(match[4]);
            const deputyCount = parseInt(match[5]);

            // Build role array
            const roles = [];
            for (let i = 0; i < sheriffCount; i++) roles.push('Shérif');
            for (let i = 0; i < renegadeCount; i++) roles.push('Renégat');
            for (let i = 0; i < outlawCount; i++) roles.push('Hors-la-loi');
            for (let i = 0; i < deputyCount; i++) roles.push('Adjoint');

            // Add to tempRules
            if (!tempRules[playerCount]) {
                tempRules[playerCount] = [];
            }
            tempRules[playerCount].push(roles);
        }
    });

    DEFAULT_RULES = tempRules;
}

function saveCustomRules() {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(RULES));
    console.log('Saved custom rules to localStorage');
}

function resetToDefaults() {
    localStorage.removeItem(RULES_STORAGE_KEY);
    RULES = JSON.parse(JSON.stringify(DEFAULT_RULES)); // Deep copy
    console.log('Reset to default rules:', RULES);
}

// DOM Elements
const views = {
    setup: document.getElementById('setup-view'),
    game: document.getElementById('game-view'),
    end: document.getElementById('end-view'),
    editor: document.getElementById('rules-editor-view'),
    distribution: document.getElementById('distribution-view')
};

const inputs = {
    names: document.getElementById('player-names'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    editRulesBtn: document.getElementById('edit-rules-btn'),
    closeEditorBtn: document.getElementById('close-editor-btn'),
    resetRulesBtn: document.getElementById('reset-rules-btn'),
    addConfigBtn: document.getElementById('add-config-btn'),
    sheriffInput: document.getElementById('input-sheriff'),
    renegadeInput: document.getElementById('input-renegade'),
    outlawInput: document.getElementById('input-outlaw'),
    deputyInput: document.getElementById('input-deputy'),
    viewDistributionBtn: document.getElementById('view-distribution-btn'),
    closeDistributionBtn: document.getElementById('close-distribution-btn')
};

const display = {
    playerName: document.getElementById('player-name-display'),
    card: document.getElementById('role-card'),
    roleName: document.getElementById('role-name'),
    roleDesc: document.getElementById('role-description'),
    instruction: document.getElementById('current-instruction'),
    error: document.getElementById('error-msg'),
    configList: document.getElementById('config-list'),
    configError: document.getElementById('config-error'),
    distributionList: document.getElementById('distribution-list')
};

// State
let players = [];
let assignedRoles = [];
let currentIndex = 0;
let isCardRevealed = false;
let isClickDisabled = false; // Prevent spam clicking
let lastDistribution = null; // Store the last game distribution

// Helpers
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomRule(count) {
    const options = RULES[count];
    if (!options) return null;
    const randomIndex = Math.floor(Math.random() * options.length);
    return [...options[randomIndex]]; // Return a copy
}

function switchView(viewName) {
    Object.values(views).forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });

    // Tiny timeout to allow display:none to process, then fade in
    const target = views[viewName];
    target.classList.remove('hidden');

    // Force reflow
    requestAnimationFrame(() => {
        target.classList.add('active');
    });
}

function showError(msg) {
    display.error.textContent = msg;
    display.error.classList.remove('hidden');
}

// Actions
function startGame() {
    const rawText = inputs.names.value;
    const namesList = rawText.split(',').map(n => n.trim()).filter(n => n.length > 0);

    // Clear error
    display.error.textContent = "";
    display.error.classList.add('hidden');

    if (namesList.length < 4 || namesList.length > 7) {
        showError(t('errorPlayers'));
        return;
    }

    players = namesList;
    const rolesConfig = getRandomRule(players.length);

    if (!rolesConfig) {
        showError(t('errorRules'));
        return;
    }

    // Shuffle roles
    assignedRoles = shuffle(rolesConfig);
    currentIndex = 0;
    isCardRevealed = false;

    // Store distribution for later viewing
    lastDistribution = players.map((name, index) => ({
        name: name,
        role: assignedRoles[index]
    }));
    
    // Save to localStorage
    localStorage.setItem(DISTRIBUTION_STORAGE_KEY, JSON.stringify(lastDistribution));

    // Show the "View Distribution" button
    inputs.viewDistributionBtn.classList.remove('hidden');

    // UI Reset
    display.card.classList.remove('flipped');

    updateGameView();
    switchView('game');
}

function updateGameView() {
    if (currentIndex >= players.length) {
        switchView('end');
        return;
    }

    const currentPlayer = players[currentIndex];
    const currentRole = assignedRoles[currentIndex];

    display.playerName.textContent = currentPlayer;
    display.instruction.textContent = t('passDevice');

    // Pre-set role text but hide it behind card
    display.roleName.textContent = currentRole;

    // Set icon and color based on role
    display.roleDesc.textContent = getRoleIcon(currentRole);
    const cardBack = document.querySelector('.card-back');
    if (cardBack) {
        cardBack.style.background = getRoleColor(currentRole);
    }
    
    // Update card display based on image mode
    updateCardDisplay();
}

function handleCardClick() {
    // Prevent spam clicking
    if (isClickDisabled) {
        return;
    }

    if (isCardRevealed) {
        // Disable clicks temporarily
        isClickDisabled = true;

        // Hide card logic
        display.card.classList.remove('flipped');

        // Wait for flip back then change player
        setTimeout(() => {
            isCardRevealed = false;
            currentIndex++;
            updateGameView();
            // Re-enable clicks after animation completes
            isClickDisabled = false;
        }, 400);
        return;
    }

    // Reveal - disable clicks temporarily
    isClickDisabled = true;
    display.card.classList.add('flipped');
    display.instruction.textContent = t('tapToHide');
    isCardRevealed = true;

    // Re-enable clicks after animation + delay to prevent accidental double-click
    setTimeout(() => {
        isClickDisabled = false;
    }, 800); // 800ms delay gives user time to see the card
}

function restartGame() {
    switchView('setup');
}

// Rule Editor Functions
let selectedPlayerCount = 4;

function openRuleEditor() {
    selectedPlayerCount = 4;
    updateConfigList();
    switchView('editor');
}

function closeRuleEditor() {
    switchView('setup');
}

function selectPlayerCount(count) {
    selectedPlayerCount = count;

    // Update tab UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.count) === count) {
            btn.classList.add('active');
        }
    });

    updateConfigList();
}

function updateConfigList() {
    const configs = RULES[selectedPlayerCount] || [];
    display.configList.innerHTML = '';

    if (configs.length === 0) {
        display.configList.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">${t('noConfig')}</p>`;
        return;
    }

    configs.forEach((config, index) => {
        const item = document.createElement('div');
        item.className = 'config-item';

        // Count roles
        const counts = {
            'Shérif': 0,
            'Renégat': 0,
            'Hors-la-loi': 0,
            'Adjoint': 0
        };
        config.forEach(role => counts[role]++);

        const rolesText = `${counts['Shérif']} Shérif, ${counts['Renégat']} Renégat, ${counts['Hors-la-loi']} Hors-la-loi, ${counts['Adjoint']} Adjoint`;

        item.innerHTML = `
            <span class="config-roles">${rolesText}</span>
            <button class="delete-config-btn" data-index="${index}">${t('delete')}</button>
        `;

        display.configList.appendChild(item);
    });

    // Add delete event listeners
    document.querySelectorAll('.delete-config-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            removeConfiguration(index);
        });
    });
}

function addConfiguration() {
    const sheriff = parseInt(inputs.sheriffInput.value) || 0;
    const renegade = parseInt(inputs.renegadeInput.value) || 0;
    const outlaw = parseInt(inputs.outlawInput.value) || 0;
    const deputy = parseInt(inputs.deputyInput.value) || 0;

    // Clear error
    display.configError.textContent = '';
    display.configError.classList.add('hidden');

    // Validate
    const total = sheriff + renegade + outlaw + deputy;
    if (total !== selectedPlayerCount) {
        display.configError.textContent = t('errorTotal', { count: selectedPlayerCount, current: total });
        display.configError.classList.remove('hidden');
        return;
    }

    // Build role array
    const roles = [];
    for (let i = 0; i < sheriff; i++) roles.push(t('roleSheriff'));
    for (let i = 0; i < renegade; i++) roles.push(t('roleRenegade'));
    for (let i = 0; i < outlaw; i++) roles.push(t('roleOutlaw'));
    for (let i = 0; i < deputy; i++) roles.push(t('roleDeputy'));

    // Add to RULES
    if (!RULES[selectedPlayerCount]) {
        RULES[selectedPlayerCount] = [];
    }
    RULES[selectedPlayerCount].push(roles);

    // Save and update UI
    saveCustomRules();
    updateConfigList();

    // Show success feedback
    display.configError.textContent = t('configAdded');
    display.configError.style.color = 'var(--primary-accent)';
    display.configError.classList.remove('hidden');
    setTimeout(() => {
        display.configError.classList.add('hidden');
        display.configError.style.color = '';
    }, 2000);
}

function removeConfiguration(index) {
    if (!RULES[selectedPlayerCount]) return;

    RULES[selectedPlayerCount].splice(index, 1);
    saveCustomRules();
    updateConfigList();
}

function handleResetRules() {
    if (confirm(t('confirmReset'))) {
        resetToDefaults();

        // Reload the page to ensure clean state
        window.location.reload();
    }
}

// Distribution Viewer Functions
function openDistributionView() {
    if (!lastDistribution) {
        return;
    }

    // Populate the distribution list
    display.distributionList.innerHTML = '';

    lastDistribution.forEach(({ name, role }) => {
        const item = document.createElement('div');
        item.className = 'distribution-item';

        const icon = getRoleIcon(role);
        const roleColor = getRoleColor(role);

        item.innerHTML = `
            <div class="distribution-card">
                <div class="distribution-player-name">${name}</div>
                <div class="distribution-role" style="background: ${roleColor};">
                    <span class="distribution-icon">${icon}</span>
                    <span class="distribution-role-name">${role}</span>
                </div>
            </div>
        `;

        display.distributionList.appendChild(item);
    });

    switchView('distribution');
}

function closeDistributionView() {
    switchView('setup');
}

function loadLastDistribution() {
    const savedDistribution = localStorage.getItem(DISTRIBUTION_STORAGE_KEY);
    if (savedDistribution) {
        try {
            lastDistribution = JSON.parse(savedDistribution);
            inputs.viewDistributionBtn.classList.remove('hidden');
        } catch (e) {
            console.error("Failed to parse last distribution from localStorage", e);
            lastDistribution = null;
        }
    }
}

// Events
inputs.startBtn.addEventListener('click', startGame);
display.card.addEventListener('click', handleCardClick);
inputs.restartBtn.addEventListener('click', restartGame);
inputs.editRulesBtn.addEventListener('click', openRuleEditor);
inputs.closeEditorBtn.addEventListener('click', closeRuleEditor);
inputs.resetRulesBtn.addEventListener('click', handleResetRules);
inputs.viewDistributionBtn.addEventListener('click', openDistributionView);
inputs.closeDistributionBtn.addEventListener('click', closeDistributionView);
inputs.addConfigBtn.addEventListener('click', addConfiguration);

// Tab buttons
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.count);
        selectPlayerCount(count);
    });
});

// Load rules on page load
loadRules();

// Language switcher event listeners
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
    });
});

// Load language on page load
loadLanguage();
loadLastDistribution();

// Image mode toggle
let useCardImages = true;

function getRoleImagePath(role) {
    const roleMap = {
        'Shérif': 'sherif.png',
        'Sheriff': 'sherif.png',
        'Renégat': 'renegat.png',
        'Renegade': 'renegat.png',
        'Hors-la-loi': 'horslaloi.png',
        'Outlaw': 'horslaloi.png',
        'Adjoint': 'adjoint.png',
        'Deputy': 'adjoint.png'
    };
    return `resources/roles/${roleMap[role] || 'sherif.png'}`;
}

function getRoleColor(role) {
    const r = role.toLowerCase();
    if (r === 'shérif' || r === 'sheriff') return '#FFD700';
    if (r === 'renégat' || r === 'renegade') return '#FF6B6B';
    if (r === 'hors-la-loi' || r === 'outlaw') return '#8B4513';
    if (r === 'adjoint' || r === 'deputy') return '#4A90E2';
    return 'var(--primary-accent)'; // Default
}

function getRoleIcon(role) {
    const r = role.toLowerCase();
    if (r === 'shérif' || r === 'sheriff') return "★";
    if (r === 'renégat' || r === 'renegade') return "🦅";
    if (r === 'hors-la-loi' || r === 'outlaw') return "🔫";
    if (r === 'adjoint' || r === 'deputy') return "👮";
    return "★"; // Default
}

function toggleCardImages() {
    useCardImages = !useCardImages;
    localStorage.setItem('bang_use_images', useCardImages);
    
    const toggleBtn = document.getElementById('toggle-images-btn');
    toggleBtn.classList.toggle('active', useCardImages);
    
    // Update current card if in game view
    updateCardDisplay();
}

function updateCardDisplay() {
    if (currentIndex >= assignedRoles.length) return;
    
    const cardBack = document.querySelector('.card-back');
    const roleReveal = document.querySelector('.role-reveal');
    
    if (useCardImages) {
        cardBack.classList.add('image-mode');
        
        // Remove existing image if any
        const existingImg = roleReveal.querySelector('.role-image');
        if (existingImg) {
            existingImg.remove();
        }
        
        // Add image
        const img = document.createElement('img');
        img.className = 'role-image';
        img.src = getRoleImagePath(assignedRoles[currentIndex]);
        img.alt = assignedRoles[currentIndex];
        roleReveal.appendChild(img);
    } else {
        cardBack.classList.remove('image-mode');
        
        // Remove image if exists
        const existingImg = roleReveal.querySelector('.role-image');
        if (existingImg) {
            existingImg.remove();
        }
    }
}

// Load image preference
function loadImagePreference() {
    const saved = localStorage.getItem('bang_use_images');
    // Default to true if no preference saved
    useCardImages = saved === null ? true : saved === 'true';
    
    const toggleBtn = document.getElementById('toggle-images-btn');
    if (toggleBtn) {
        toggleBtn.classList.toggle('active', useCardImages);
    }
}

// Add event listener for toggle button
const toggleImagesBtn = document.getElementById('toggle-images-btn');
if (toggleImagesBtn) {
    toggleImagesBtn.addEventListener('click', toggleCardImages);
}

// Load image preference on page load
loadImagePreference();

// Burger Menu
const burgerMenu = document.querySelector('.burger-menu');
const navMenu = document.querySelector('.nav-menu');

burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('open');
    navMenu.classList.toggle('open');
});

// Close menu when a nav button is clicked
navMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        burgerMenu.classList.remove('open');
        navMenu.classList.remove('open');
    }
});