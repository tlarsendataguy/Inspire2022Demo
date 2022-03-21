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
    document.getElementById("loadingDialogContent").innerText = "Running workflow...";
    document.getElementById("loadingDialog").style.visibility = "visible";

    let req = new XMLHttpRequest();
    req.onload = function() {
        console.log("success")
        console.log(req.responseText);
        let response = JSON.parse(req.responseText)
        if (response.Errors === null) {
            document.getElementById("loadingDialogContent").innerText = "Rendering heightmap...";
            let file1 = response.OutputFiles[0];
            let file2 = response.OutputFiles[1];
            if (file1.includes("size.json")) {
                startPipeline(file2, file1);
            } else {
                startPipeline(file1, file2);
            }
        }
    };
    req.onerror = function() {
        console.log(`error ${req.responseText}`);
    };
    let payload = {
        Lat: latLng.lat().toFixed(6),
        Lon: latLng.lng().toFixed(6),
        Size: "10"
    }
    req.open("POST", window.location, true);
    req.setRequestHeader("content-type", "application/json; charset=UTF-8")
    req.send(JSON.stringify(payload));
}
