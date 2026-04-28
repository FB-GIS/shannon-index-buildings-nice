import { displayAllBati } from "./src/api/bati_api.js";

const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    keepBuffer: 2,
    updateWhenZooming: false,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    colorFilter: ['invert:100%', 'grayscale: 100%']
});

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});




const map = L.map('map', {
    center: [43.70, 7.26],
    zoom: 12,
    layers: [osm]  
});

map.createPane('batiPane');
map.getPane('batiPane').style.zIndex = 450; // tuiles = 200, overlays = 400




var baseMaps = {
    "Satellite": satellite,
    "OpenStreetMap": osm
};

const layerControl = L.control.layers(baseMaps).addTo(map);



L.control.scale({
    position: 'bottomleft',
    imperial: false,
}).addTo(map);




displayAllBati().then((res) => {
    if (res.status === 200) {
        const features = res.bati.map((bati) => {
            let geometry;
            try {
                geometry = JSON.parse(bati.geom);

                geometry.coordinates = geometry.coordinates.map(geom =>
                    geom.map(coord => [coord[0], coord[1]]) 
                );
            } catch(err) {
                console.error('Error parsing geometry :', err);
            }

            return {
                type: "Feature",
                properties: {
                    id: bati.ID,
                    usage: bati.USAGE1,
                    shannon_index: bati.shannon_index
                },
                geometry: geometry
            };
        });


        const geojson = {
            type: "FeatureCollection",
            features: features 
        };

        var options = {
            maxZoom: 18,
            tolerance: 3,
            debug: 0,
            pane: 'batiPane',
            style: (properties) => {
                if(properties.shannon_index > 1.22){
                     return  {fillColor:"#fde725", color:"#fde725", weight: 1.5};
                } 
                else if(properties.shannon_index > 0.97) {
                    return  {fillColor:"#35b779", color:"#35b779", weight: 1.5};
                } 
                else if(properties.shannon_index > 0.71) {
                    return  {fillColor:"#31688e", color:"#31688e", weight: 1.5};
                }
                else {
                return  {fillColor:"#440154", color:"#440154", weight: 1.5};
                }
            }
        };
      
        L.geoJson.vt(geojson, options).addTo(map); 
    }
});




function getColor(d) {
    return d >= 1.22 ? '#fde725' :
           d >= 0.97 ? '#35b779' :
           d >= 0.71 ? '#31688e' :
                       '#440154' ;
};


const legend = L.control({position: 'bottomright'});

legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 0.71, 0.97, 1.22];
    const labels = [];

    for (let i=0; i<grades.length; i++) {
        div.innerHTML += '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : ' &ndash; 1.51');
    }
    return div;
};

legend.addTo(map);