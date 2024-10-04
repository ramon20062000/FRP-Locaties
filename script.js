// Initialiseer de map
var map = L.map('map', {
    minZoom: -2,
    maxZoom: 1,
    crs: L.CRS.Simple
});

// Stel de GTA V-kaart in als achtergrond
var gtaBounds = [[0, 0], [2048, 2048]]; // De afmetingen van de afbeelding
var image = L.imageOverlay('https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_2048x2048.png', gtaBounds).addTo(map);

map.fitBounds(gtaBounds);

// Laad eerder opgeslagen markers uit localStorage
var markers = []; // Start met een lege lijst van markers
var markerLayers = {}; // Voor het opslaan van marker lagen

// Voeg een nieuwe POI toe bij het klikken op de knop
document.getElementById('addPoi').addEventListener('click', function() {
    var groupName = document.getElementById('groupName').value;
    var colorName = document.getElementById('colorName').value;
    var color = document.getElementById('colorPicker').value;

    // Bij klikken op de kaart, marker plaatsen
    map.once('click', function(e) {
        var coord = e.latlng;
        var lat = coord.lat;
        var lng = coord.lng;

        // Voeg de marker toe aan de map
        addMarker(lat, lng, colorName, color, groupName);

        // Sla het punt op in de markers array
        markers.push({ lat: lat, lng: lng, name: colorName, color: color, group: groupName });

        // Reset het formulier
        document.getElementById('groupName').value = ''; // Reset naar leeg
        document.getElementById('colorName').value = '';
        document.getElementById('colorPicker').value = '#ff0000'; // Reset naar standaard kleur

        // Update de lijst
        updatePoiList();
    });
});

// Functie om een marker toe te voegen
function addMarker(lat, lng, name, color, group) {
    var marker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%;"></div>`
        })
    }).addTo(map).bindPopup(name);

    // Opslaan van marker in de markerLayers
    if (!markerLayers[group]) {
        markerLayers[group] = [];
    }
    markerLayers[group].push(marker);
}

// Functie om de POI-lijst bij te werken
function updatePoiList() {
    var colorGroups = document.getElementById('colorGroups');
    colorGroups.innerHTML = ''; // Maak de lijst leeg
    var groupSet = new Set();

    markers.forEach(function(marker) {
        groupSet.add(marker.group); // Unieke groepen toevoegen aan de set
    });

    groupSet.forEach(function(group) {
        var groupDiv = document.createElement('div');
        groupDiv.className = 'color-group';

        // Groepheader met naam en een checkbox voor de groep
        var headerDiv = document.createElement('div');
        headerDiv.className = 'color-header';
        headerDiv.textContent = group; // Toon groepsnaam
        groupDiv.appendChild(headerDiv);

        // Checkbox om de groep in of uit te schakelen
        var groupCheckbox = document.createElement('input');
        groupCheckbox.type = 'checkbox';
        groupCheckbox.checked = true; // Standaard is het zichtbaar
        groupCheckbox.addEventListener('change', function() {
            toggleGroupVisibility(group, groupCheckbox.checked);
        });
        headerDiv.prepend(groupCheckbox);

        // Lijst van items voor deze groep
        var itemsDiv = document.createElement('div');
        itemsDiv.className = 'color-items';

        markers.forEach(function(marker) {
            if (marker.group === group) {
                var li = document.createElement('div');
                li.textContent = marker.name; // Toon de naam van de POI

                // Voeg een checkbox toe
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true; // Standaard is het zichtbaar
                checkbox.addEventListener('change', function() {
                    toggleMarker(marker, checkbox.checked);
                });

                li.prepend(checkbox);
                itemsDiv.appendChild(li);
            }
        });

        groupDiv.appendChild(itemsDiv);
        colorGroups.appendChild(groupDiv);

        // Voeg een event listener toe om de sectie in te klappen of uit te vouwen
        headerDiv.addEventListener('click', function() {
            // Toggle display van de items
            itemsDiv.style.display = itemsDiv.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// Functie om een groep van markers te verbergen of weer te geven
function toggleGroupVisibility(group, isVisible) {
    markerLayers[group].forEach(marker => {
        if (isVisible) {
            map.addLayer(marker); // Marker weergeven
        } else {
            map.removeLayer(marker); // Marker verbergen
        }
    });
}

// Functie om een marker te verbergen of weer te geven op basis van de checkbox
function toggleMarker(marker, isVisible) {
    var markerLayer = markerLayers[marker.group].find(m => m.getLatLng().equals([marker.lat, marker.lng]));
    if (isVisible) {
        map.addLayer(markerLayer); // Marker weergeven
    } else {
        map.removeLayer(markerLayer); // Marker verbergen
    }
}

// Bij het laden van de pagina, update de POI-lijst
updatePoiList();
