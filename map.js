let map;
let marker;
let latLng;

const ayxurl = "https://ayxrunner.tlarsendataguy.com/public/heightmap";

function getBounds(from) {
    let twentyMiles = 20 * 1852;
    let l = google.maps.geometry.spherical.computeOffset(from, twentyMiles/2, 270).lng(),
        t = google.maps.geometry.spherical.computeOffset(from, twentyMiles/2, 0).lat(),
        r = google.maps.geometry.spherical.computeOffset(from, twentyMiles/2, 90).lng(),
        b = google.maps.geometry.spherical.computeOffset(from, twentyMiles/2, 180).lat();
    return new google.maps.LatLngBounds(
        new google.maps.LatLng(b,l),
        new google.maps.LatLng(t,r),
    );
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 39.843925, lng: -98.432874 },
        zoom: 5,
    });
    map.addListener("click", (e) => {
        document.getElementById("renderButton").removeAttribute("disabled");
        latLng = e.latLng;
        if (marker === undefined) {
            marker = new google.maps.Rectangle({
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                clickable: false,
                map,
                bounds: getBounds(latLng),
            });
        } else {
            marker.setOptions({
                bounds: getBounds(latLng),
            });
        }
    });
}

function runWorkflow() {
    document.getElementById("loadingDialogContent").innerText = "Running workflow...";
    document.getElementById("loadingDialog").style.visibility = "visible";

    let req = new XMLHttpRequest();
    req.onload = function() {
        console.log("success")
        console.log(req.responseText);
        let response = JSON.parse(req.responseText)
        if (response.Errors === null) {
            document.getElementById("loadingDialogContent").innerText = "Rendering heightmap...";
            let file1 = ayxurl + response.OutputFiles[0];
            let file2 = ayxurl + response.OutputFiles[1];
            if (file1.includes("size.json")) {
                startPipeline(file2, file1);
            } else {
                startPipeline(file1, file2);
            }
        }
    };
    req.onerror = function() {
        console.log(`error ${req.responseText}`);
        document.getElementById("loadingDialogContent").innerText = `error communicating with server: ${req.responseText}`;
        document.getElementById("closeLoadingDialog").style.visibility = "visible";
    };
    let payload = {
        Lat: latLng.lat().toFixed(6),
        Lon: latLng.lng().toFixed(6),
        Size: "20"
    }
    req.open("POST", ayxurl, true);
    req.setRequestHeader("content-type", "application/json; charset=UTF-8")
    req.send(JSON.stringify(payload));
}

function closeLoadingDialog() {
    document.getElementById("loadingDialog").style.visibility = "hidden";
    document.getElementById("closeLoadingDialog").style.visibility = "collapse";
}
