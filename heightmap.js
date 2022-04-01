import * as THREE from "./threejs/Three.js";
import * as c from "./threejs/controls/FlyControls.js";
import * as s from "./threejs/objects/Sky.js";

const clock = new THREE.Clock();
const nmToFt = 6076.12;
const scale = 0.01;

const renderData = {
    imgUrl: '',
    sizesUrl: '',
    error: '',
    img: null,
    scene: null,
    controls: null,
    onWindowResize: null,
    sizeFt: 0,
    width: 0,
    height: 0,
    animationFrameId: 0,
    pixels: function() {
        return this.width * this.height;
    },
    resetData: function() {
        this.imgUrl = '';
        this.sizesUrl = '';
        this.error = '';
        this.img = null;
        this.scene = null;
        this.controls = null;
        this.onWindowResize = null;
        this.sizeFt = 0;
        this.width = 0;
        this.height = 0;
    },
    setError: function(msg) {
       this.resetData();
       this.error = msg;
       console.error(msg);
    }
};

window.startPipeline = function(imgUrl, sizesUrl) {
    renderData.resetData();
    renderData.imgUrl = imgUrl;
    renderData.sizesUrl = sizesUrl;
    getSizes(loadImage);
}

function getSizes(next) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", renderData.sizesUrl, true);
    xmlhttp.onload = function() {
        if (xmlhttp.status !== 200) {
            renderData.setError(`error ${xmlhttp.status} retrieving size data`);
            document.getElementById("loadingDialogContent").innerText = "error parsing sizes";
            document.getElementById("closeLoadingDialog").style.visibility = "visible";
            return;
        }
        let sizes = JSON.parse(xmlhttp.responseText);
        renderData.sizeFt = sizes.size * nmToFt;
        renderData.width = sizes.width;
        renderData.height = sizes.height;
        next();
    }
    xmlhttp.onerror = function() {
        renderData.setError("could not load size data");
        document.getElementById("loadingDialogContent").innerText = "error loading size data";
        document.getElementById("closeLoadingDialog").style.visibility = "visible";
    }
    xmlhttp.send();
}

function loadImage() {
    renderData.img = new Image();
    renderData.img.onload = startRender;
    renderData.img.src = renderData.imgUrl;
}

function startRender() {

    // plane
    renderData.scene = new THREE.Scene();

    let sky = new s.Sky();
    sky.scale.setScalar(450000 * scale)
    renderData.scene.add(sky);

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.y = 40000;
    light.position.z = -40000;
    renderData.scene.add(light);

    let div = document.getElementById("heightmap");
    let width = div.clientWidth;
    let height = div.clientHeight;

    let camera = new THREE.PerspectiveCamera( 30, width / height, 0.1, 5000000 * scale );
    let geometry = new THREE.PlaneGeometry(renderData.sizeFt * scale, renderData.sizeFt * scale , renderData.width-1, renderData.height-1);
    let material = new THREE.MeshLambertMaterial({color: 0xaaddaa});
    let plane = new THREE.Mesh( geometry, material );

    renderData.onWindowResize = function() {
        let width = div.clientWidth;
        let height = div.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener( 'resize', renderData.onWindowResize, false );

    //set vertice height
    let data = getHeightData(renderData.img);
    for ( let i = 0; i < renderData.pixels(); i++ ) {
        plane.geometry.attributes.position.array[i * 3 + 2] = data[i] / 10 * scale;
    }

    plane.rotateX(-3.14159/2);
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    renderData.scene.add(plane);
    camera.position.y = 10000 * scale;
    camera.position.z = renderData.sizeFt * scale /2;
    let renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    div.appendChild(renderer.domElement);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;

    function animate() {
        renderData.animationFrameId = requestAnimationFrame( animate );
        render();
    }

    function render() {
        const delta = clock.getDelta();
        controls.update( delta );
        renderer.render( renderData.scene, camera );
    }

    let controls = new c.FlyControls( camera, renderer.domElement );
    renderData.controls = controls;
    controls.movementSpeed = 4000 * scale;
    controls.rollSpeed = 1.0;
    controls.autoForward = false;
    controls.dragToLook = true;

    document.addEventListener('keyup', escapeKeyPressed, false);
    document.getElementById("heightmapDialog").style.visibility = "visible";
    document.getElementById("loadingDialog").style.visibility = "hidden";

    animate();
}

function getHeightData(img) {
    let canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    let context = canvas.getContext( '2d' );

    let size = img.width * img.height;
    let data = new Int32Array( size );

    context.drawImage(img,0,0);

    let imgd = context.getImageData(0, 0, img.width, img.height);
    let pix = imgd.data;
    let view = new DataView(pix.buffer);

    for (let i = 0; i < size; i++) {
        view.setUint8(i*4 + 3, 0);
        data[i] = view.getInt32(i*4, true);
    }

    return data;
}

const ESCAPE = 27;

function escapeKeyPressed(e) {
    if (e.keyCode !== ESCAPE) {
        return;
    }
    cancelAnimationFrame(renderData.animationFrameId);
    document.getElementById("heightmapDialog").style.visibility = "hidden";
    document.removeEventListener('keyup', escapeKeyPressed, false);
    window.removeEventListener( 'resize', renderData.onWindowResize, false );

    let heightmap = document.getElementById("heightmap");
    while (heightmap.firstChild) {
        heightmap.removeChild(heightmap.lastChild);
    }
    renderData.controls.dispose();
    renderData.resetData()
}
