/*

Sugbu Resto 1.0
- initial implementation
- Author: Philip Batingana Jr.

*/


let map;
let placesService;
let directionsService;
let directionsRenderer;
let restoInfoWindow;
let sugbuMercadoCoordinates;

let restoMarkers = [];
let restoZoneCircles = [];

const divSugbuRestoCustomCtrl = $('<div>');
const divCustomCtrlBox = $('<div>', {class: 'custom-ctrl-box'});
const divCustomCtrlText = $('<div>', {class: 'custom-ctrl-text'});
const divRestoVisibilityCustomCtrl = $('<div>');
const divAllRestoBox = $('<div>', {
    id: 'divAllRestoBox',
    class: 'custom-ctrl-box',
});
const divAllRestoText = $('<div>', {class: 'custom-ctrl-text'});
const divOpenRestoBox = $('<div>', {
    id: 'divOpenRestoBox',
    class: 'custom-ctrl-box',
});
const divOpenRestoText = $('<div>', {class: 'custom-ctrl-text'});
const divClosedRestoBox = $('<div>', {
    id: 'divClosedRestoBox',
    class: 'custom-ctrl-box',
});
const divClosedRestoText = $('<div>', {class: 'custom-ctrl-text'});

const foodSpecialtyList = ["Adobo", "Bulalo", "Caesar Salad", "Doughnut", "Escabeche",
    "Fillet Mignon", "Granola", "Hotdog", "Ice Cream", "Jumbo Hotdog",
    "Kale", "Luncheon Meat", "Meatballs", "Nachos", "Orange Cake",
    "Pistachio Ice Cream", "Quail Eggs", "Rolled Oats", "Spaghetti", "Tilapia",
    "Ultimate Burger", "Vegan Carbonara", "Western Chicken Wings", "Xtremely Spicy Burger", "Yakisoba", "Zucchini Bread"];


function initMap() {

    sugbuMercadoCoordinates = new google.maps.LatLng(10.3321805864036, 123.90576817157448);
    map = new google.maps.Map($('#map')[0], {
        center: sugbuMercadoCoordinates,
        zoom: 14,
        fullscreenControl: false,
    });
    placesService = new google.maps.places.PlacesService(map);
    restoInfoWindow = new google.maps.InfoWindow();

    directionsService = new google.maps.DirectionsService;
    directionsRenderer = new google.maps.DirectionsRenderer;

    createRestoSearchBtn();
}

function createRestoSearchBtn() {

    divCustomCtrlText.html('Show Sugbu Restos');
    
    divCustomCtrlBox.prop('title', 'Click here to show all restos in Cebu!');
    divCustomCtrlBox.on('click', (evt) => {
        
        divCustomCtrlBox.off('click');

        const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(10.24750899645879, 123.82314920975604),
            new google.maps.LatLng(10.441015786569968, 124.00259721741834)
        );
    
        const plotRestosCallback = (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                for (let i = 0; i < results.length; i++) {
                    setTimeout(() => createMarker(results[i]), i * 50);
                }
                map.setCenter(sugbuMercadoCoordinates);
                createRestoMarkupVisibilityToggleBtns();
            }
        }
        
        performRestoSearch(bounds, plotRestosCallback);
        createDrawingControl();
    });

    divCustomCtrlBox.append(divCustomCtrlText);
    divSugbuRestoCustomCtrl.append(divCustomCtrlBox);

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(divSugbuRestoCustomCtrl[0]);
}

function createMarker(resto) {

    if (!resto.geometry || !resto.geometry.location) return;

    const restoMarker = new google.maps.Marker({
        map,
        position: resto.geometry.location,
        icon: (resto.business_status === 'OPERATIONAL') ? 'imgs/sugbu-resto-marker-v1.png' : 'imgs/sugbu-resto-marker-closed-v1.png',
        animation: google.maps.Animation.DROP,
        specialty: foodSpecialtyList[Math.floor(Math.random() * foodSpecialtyList.length)],
        business_status: resto.business_status,
    });

    restoMarkers.push({
        placeId: resto.place_id,
        restoMarker: restoMarker,
    });

    restoMarker.addListener("click", () => {

        restoMarker.setAnimation(google.maps.Animation.BOUNCE);

        let contentString = `<div style='font-weight: bold;'>${resto.name}</div>`
        + `<div>Specialty: ${restoMarker.specialty}</div>`
        + `<div title='Based on Customer Reviews statistic'># of Customer Visits: ${resto.user_ratings_total}</div>`
        + `<button id='${resto.place_id}' class='get-directions-btn'>Get Directions</button>`;

        restoInfoWindow.setContent(contentString);
        restoInfoWindow.setZIndex(10);
        restoInfoWindow.open({
            anchor: restoMarker,
            map,
            shouldFocus: false,
        });

        google.maps.event.addListener(restoInfoWindow, 'domready', () => {
            $(`button[id='${resto.place_id}']`).on('click', giveDirections);
        });

        restoMarker.setAnimation(null);
    });
}

function createDrawingControl() {

    let restoCountWithinCircle = 0;
    const circleInfoWindow = new google.maps.InfoWindow();

    const drawingManager = new google.maps.drawing.DrawingManager({
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.CIRCLE,
          ],
        },
        circleOptions: {
            strokeColor: "#000000",
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: "#000000",
            fillOpacity: 0.5,
            map,
            editable: true,
            draggable: true,
            zIndex: 1,
        },
    });
    
    drawingManager.setMap(map);

    drawingManager.addListener('circlecomplete', function(circle) {

        restoZoneCircles.push(circle);
        
        ['bounds_changed', 'dragend', 'mouseover'].forEach((eventName) => {
            circle.addListener(eventName, () => {
                restoCountWithinCircle = 0;
                for (let i = 0; i < restoMarkers.length; i++) {
                    if (google.maps.geometry.spherical.computeDistanceBetween(restoMarkers[i].restoMarker.getPosition(), circle.getCenter()) <= circle.getRadius()
                        && restoMarkers[i].restoMarker.getVisible()) {
                        restoCountWithinCircle++;
                    }
                }
            });
            if (eventName === 'bounds_changed' || eventName === 'dragend') {
                circleInfoWindow.close();
            }
        });

        circle.addListener('mouseover', () => {
            let contentString = `<div style='font-weight: bold;'># of Restos Within the Circle: <span style='color: #ea4335;'>${restoCountWithinCircle}</span></div>`;
            circleInfoWindow.setContent(contentString);
            circleInfoWindow.setZIndex(9);
            circleInfoWindow.setPosition(circle.getCenter());
            circleInfoWindow.open(map);
        });

        ['mouseout', 'dragstart'].forEach((eventName) => {
            circle.addListener(eventName, () => {
                circleInfoWindow.close();
            });
        });
    });

    divCustomCtrlText.html('Clear Circles');
    divCustomCtrlText.on('click', function(evt){
        restoZoneCircles.forEach((circle) => circle.setMap(null));
        restoZoneCircles = [];
    });
}

function createRestoMarkupVisibilityToggleBtns() {

    divAllRestoText.html('All Restos');
    divOpenRestoText.html('Operational');
    divClosedRestoText.html('Closed');

    divAllRestoBox.append(divAllRestoText);
    divOpenRestoBox.append(divOpenRestoText);
    divClosedRestoBox.append(divClosedRestoText);

    divAllRestoBox.on('click', () => filterRestoVisibility('ALL'));
    divOpenRestoBox.on('click', () => filterRestoVisibility('OPERATIONAL'));
    divClosedRestoBox.on('click', () => filterRestoVisibility('CLOSED'));

    divRestoVisibilityCustomCtrl.append(divAllRestoBox, divOpenRestoBox, divClosedRestoBox);
    divRestoVisibilityCustomCtrl.addClass('div-resto-visibility-custom-ctrl');

    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(divRestoVisibilityCustomCtrl[0]);

    divAllRestoBox.click();
}

function filterRestoVisibility(mode) {

    $('.selected-resto-visibility-ctrl-btn').removeClass('selected-resto-visibility-ctrl-btn');

    let restoMarkersToShow = 'OPERATIONAL, CLOSED_TEMPORARILY';

    switch(mode) {
        case 'ALL':
            $('#divAllRestoBox').addClass('selected-resto-visibility-ctrl-btn');
            restoMarkersToShow = 'OPERATIONAL, CLOSED_TEMPORARILY';
            break;
        case 'OPERATIONAL':
            $('#divOpenRestoBox').addClass('selected-resto-visibility-ctrl-btn');
            restoMarkersToShow = 'OPERATIONAL'
            break;
        case 'CLOSED':
            $('#divClosedRestoBox').addClass('selected-resto-visibility-ctrl-btn');
            restoMarkersToShow = 'CLOSED_TEMPORARILY'
            break;
        default:
            break;
    }

    restoMarkers.forEach((restoMarkerInstance) => {
        restoMarkerInstance.restoMarker.setVisible(restoMarkersToShow.includes(restoMarkerInstance.restoMarker.business_status));
    });
    
}

function giveDirections(evt) {
    
    restoInfoWindow.close();

    onGeoLocationError = () => {
        console.log('Encountered error while trying to get current location.');
    };

    onGeoLocationSuccess = (position) => {

        const myCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        };

        let restoDestination = restoMarkers.filter((elem) => elem.placeId === evt.target.id)[0].restoMarker;

        directionsRenderer.setMap(map);

        directionsService
            .route({
                origin: myCoordinates,
                destination: restoDestination.getPosition(),
                travelMode: google.maps.TravelMode.DRIVING,
            })
            .then((response) => {
                directionsRenderer.setDirections(response);
                map.setCenter(myCoordinates);
            })
            .catch((e) => console.log('Directions request failed. Details: ' + e));
        
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onGeoLocationSuccess, onGeoLocationError);
    } else {
        console.log('Geolocation is not supported by this browser.');
    }

}

function performRestoSearch(bounds, callback) {

    const request = {
        bounds: bounds,
        type: ['restaurant'],
    };

    if (placesService) {
        placesService.textSearch(request, callback);
        placesService.nearbySearch(request, callback);
    } else {
        console.error('google.maps.places.PlacesService instance not initialized');
    }
}


window.initMap = initMap;