var map;
var infoWindow;
var markers = []

function initMap() {
    var ATL = {lat: 33.753746, lng: -84.386330}
    map = new google.maps.Map(document.getElementById('map'), {
        center: ATL,
        zoom: 8
    });
    infoWindow = new google.maps.InfoWindow();
    createMarker()
}

const getStore = ()=>{
    const API_URL = 'http://localhost:3000/api/stores';
    const zipCode = document.getElementById('zip-code').value;
    if(!zipCode) return;
    const fullUrl = `${API_URL}?zip_code=${zipCode}`
    fetch(fullUrl)
    .then((response)=>{
        if (response.status==200) {
            return response.json()
        } else{
            throw new Error(response.status)
        }
    }).then((data)=>{
        if (data.length>0) {
            clearLocations()
            searchStoreNear(data)
            setStoreList(data)
            onClickListener()
        } else {
            clearLocations()
            noStoreFound()
        }
        
    })
}

function clearLocations() {
    infoWindow.close();
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers.length = 0;
}

const noStoreFound = ()=>{
    let noStore = `
    <div class="no-stores">
        <p>Oooppss</p>
        <span>No Stores Found</span>
    </div>
    `
    document.querySelector('.stores-list').innerHTML = noStore;
}

const onEnter = (e)=>{
    if (e.key=='Enter') {
        getStore()
    }
}

const onClickListener = ()=>{
    let storeElement = document.querySelectorAll('.store-conatiner');
    storeElement.forEach((elem,index)=>{
        elem.addEventListener('click',()=>{
            google.maps.event.trigger(markers[index], 'click');
        })
    })
}

const setStoreList = (stores)=>{
    let storeListHTML = '';
    stores.forEach((store,index)=>{
        storeListHTML += `
        <div class="store-conatiner">
            <div class="store-background">
                <div class="store-info-container">
                    <div class="store-address">
                        <span>${store.addressLines[0]}</span>
                        <span>${store.addressLines[1]}</span>
                    </div>
                    <div class="store-phone-number">
                        ${store.phoneNumber}
                    </div>
                </div>
                <div class="store-number">${index+1}</div>
            </div>  
        </div>
        `
    })
    document.querySelector('.stores-list').innerHTML = storeListHTML;
}

const searchStoreNear = (stores)=>{
    var bounds = new google.maps.LatLngBounds();
    stores.forEach((store,index)=>{
        let latlng = new google.maps.LatLng(
            store.location.coordinates[1],
            store.location.coordinates[0]
        )
        let name = store.storeName;
        let address = store.addressLines[0];
        let openStatusText = store.openStatusText;
        let phoneNumber = store.phoneNumber
        createMarker(latlng,name,address,index,openStatusText,phoneNumber)
        bounds.extend(latlng);
    })
    map.fitBounds(bounds);
}

const createMarker = (latlng,name,address,index,openStatusText,phoneNumber)=>{
    var html = `
    <div class="store-info">
        <div class="store-name">
            ${name}
        </div>
        <div class="open-status">
            ${openStatusText}
        </div>
        <div class="location">
            <i class="fa fa-location-arrow"></i>
            <span>
                ${address}
            </span>
        </div>
        <div class="telephone">
            <i class="fa fa-phone"></i>
            <span>
                <a href="tell:${phoneNumber}">${phoneNumber}</a>
            </span>
        </div>
    </div>
    `;
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        label: `${index+1}`
    });
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
      });
      markers.push(marker)
}