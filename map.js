let map;
let marker;
let latLng;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 39.843925, lng: -98.432874 },
        zoom: 5,
    });
    map.addListener("click", (e) => {
        latLng = e.latLng;
        if (marker === undefined) {
            marker = new google.maps.Marker({
                position: latLng,
                map: map,
            });
        } else {
            marker.setPosition(latLng);
        }
    });
}

function runWorkflow() {
    //document.getElementById("loadingDialogContent").innerText = "Running workflow...";
    //document.getElementById("loadingDialog").style.visibility = "visible";

    document.getElementById("heightmapDialog").style.visibility = "visible";
    startPipeline("heightmap.png", "size.json")
}
