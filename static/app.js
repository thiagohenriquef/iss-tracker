var api = window.location.href || null;

function startPage () {
  request('findISS')
    .then(res => {
      const test = JSON.parse(res);
      const obj = JSON.parse(test);
      window.latitude = Number(obj.iss_position.latitude);
      window.longitude = Number(obj.iss_position.longitude);
    })
    .then(findAstros)
    .catch(err => console.log(err))
}

function findAstros () {
  request('astronauts')
    .then(res => localStorage.setItem('astros', res))
    .then(initMap)
    .catch(err => console.log(err))
}

function request(path = '') {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${api}/${path}`);

    xhr.onload = function() {
      if (xhr.status == 200) {
        resolve(xhr.response);
      }
      else {
        reject(Error(xhr.statusText));
      }
    };
    xhr.onerror = function() {
      reject(Error("Network Error"));
    };
    xhr.send();
  });
}

function initMap() {
  const position = new google.maps.LatLng(latitude, longitude);

  const map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 3,
    mapTypeId: 'satellite'
  });

  const coordInfoWindow = new google.maps.InfoWindow();
  coordInfoWindow.setContent(createInfoWindowContent(position, map.getZoom()));
  coordInfoWindow.setPosition(position,  coordInfoWindow.open(map));

  map.addListener('zoom_changed', function() {
    coordInfoWindow.setContent(createInfoWindowContent(position, map.getZoom()));
    coordInfoWindow.open(map);
  });
}

const TILE_SIZE = 256;

function createInfoWindowContent(latLng, zoom) {
  const scale = 1 << zoom;

  const worldCoordinate = project(latLng);

  const pixelCoordinate = new google.maps.Point(
      Math.floor(worldCoordinate.x * scale),
      Math.floor(worldCoordinate.y * scale));

  const tileCoordinate = new google.maps.Point(
      Math.floor(worldCoordinate.x * scale / TILE_SIZE),
      Math.floor(worldCoordinate.y * scale / TILE_SIZE));

  const { people } = JSON.parse(JSON.parse(localStorage.getItem('astros')));
  return [
    'Position: ',
    'LatLng: ' + latLng,
    'Astronauts inside ISS ' + people.reduce((acc, cur) => `${acc} - ${cur.name}`, '')
  ].join('<br>');
}

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng) {
  var siny = Math.sin(latLng.lat() * Math.PI / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);

  return new google.maps.Point(
      TILE_SIZE * (0.5 + latLng.lng() / 360),
      TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
}