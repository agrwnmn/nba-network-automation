// Global variables
let map;
let draftData;
let markers = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadDraftData();
    initializeMap();
    updateStatistics();
    populatePlayerList();
    setupEventListeners();
});

// Load draft data
async function loadDraftData() {
    try {
        const response = await fetch('data/draft-2024.json');
        draftData = await response.json();
    } catch (error) {
        console.error('Error loading draft data:', error);
        // Fallback to show something even if data fails to load
        draftData = { players: [] };
    }
}

// Initialize Leaflet map
function initializeMap() {
    // Create map centered on USA
    map = L.map('map').setView([39.8283, -98.5795], 4);
    
    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    
    // Add player markers
    draftData.players.forEach(player => {
        addPlayerMarker(player);
    });
}

// Add marker for each player
function addPlayerMarker(player) {
    const location = player.is_international && player.birthplace ? 
        player.birthplace.coordinates : 
        player.high_school.coordinates;
    
    // Create custom icon
    const customIcon = L.divIcon({
        className: `player-marker ${player.is_international ? 'international' : ''}`,
        html: `<span>${player.draft_position}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
    
    // Create marker
    const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .addTo(map);
    
    // Create popup content
    const popupContent = createPopupContent(player);
    marker.bindPopup(popupContent);
    
    // Add hover effect
    marker.on('mouseover', function() {
        this.openPopup();
    });
    
    // Store marker reference
    markers.push({ marker, player });
}

// Create popup content
function createPopupContent(player) {
    const location = player.is_international ? 
        (player.birthplace ? 
            `${player.birthplace.city}, ${player.birthplace.country}` : 
            `${player.high_school.city}, ${player.high_school.country}`) :
        `${player.high_school.city}, ${player.high_school.state}`;
    
    const schoolInfo = player.high_school.name;
    
    // Use placeholder images if actual images aren't available
    const profilePhoto = `assets/img/players/${player.profile_photo || 'placeholder.jpg'}`;
    const teamLogo = `assets/img/teams/${player.team_logo || 'nba-logo.png'}`;
    
    return `
        <div class="player-popup">
            <div class="popup-header">
                <img src="${profilePhoto}" alt="${player.name}" class="popup-photo" onerror="this.src='https://via.placeholder.com/60'">
                <div class="popup-info">
                    <h3>#${player.draft_position} ${player.name}</h3>
                    <p><strong>High School:</strong> ${schoolInfo}</p>
                    <p><strong>Location:</strong> ${location}</p>
                </div>
            </div>
            <div class="popup-team">
                <img src="${teamLogo}" alt="${player.team}" class="team-logo" onerror="this.src='https://via.placeholder.com/30'">
                <span><strong>Drafted by:</strong> ${player.team}</span>
            </div>
        </div>
    `;
}

// Update statistics
function updateStatistics() {
    const totalPlayers = draftData.players.length;
    const intlPlayers = draftData.players.filter(p => p.is_international).length;
    const usaPlayers = totalPlayers - intlPlayers;
    
    // Count unique countries
    const countries = new Set();
    draftData.players.forEach(player => {
        if (player.is_international && player.birthplace) {
            countries.add(player.birthplace.country);
        } else {
            countries.add(player.high_school.country);
        }
    });
    
    // Update DOM
    document.getElementById('total-players').textContent = totalPlayers;
    document.getElementById('usa-players').textContent = usaPlayers;
    document.getElementById('intl-players').textContent = intlPlayers;
    document.getElementById('countries').textContent = countries.size;
}

// Populate player list in sidebar
function populatePlayerList() {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';
    
    draftData.players.forEach(player => {
        const playerItem = createPlayerListItem(player);
        playerList.appendChild(playerItem);
    });
}

// Create player list item
function createPlayerListItem(player) {
    const div = document.createElement('div');
    div.className = 'player-item';
    div.innerHTML = `
        <span class="player-rank">${player.draft_position}</span>
        <div class="player-details">
            <h4>${player.name}</h4>
            <p>${player.team}</p>
            <p>${player.is_international ? '🌍 International' : '🇺🇸 USA'}</p>
        </div>
    `;
    
    // Click to zoom to player on map
    div.addEventListener('click', () => {
        const markerData = markers.find(m => m.player.draft_position === player.draft_position);
        if (markerData) {
            const location = player.is_international && player.birthplace ? 
                player.birthplace.coordinates : 
                player.high_school.coordinates;
            
            map.setView([location.lat, location.lng], 8);
            markerData.marker.openPopup();
        }
    });
    
    return div;
}

// Setup event listeners
function setupEventListeners() {
    // Toggle sidebar
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
    
    // Modal close
    const modal = document.getElementById('player-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}