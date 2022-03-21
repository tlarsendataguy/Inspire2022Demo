import * as THREE from "./threejs/Three.js";
import * as c from "./threejs/controls/FlyControls.js";
import * as s from "./threejs/objects/Sky.js";

const clock = new THREE.Clock();
const nmToFt = 6076.12;

const renderData = {
    imgUrl: '',
    sizesUrl: '',
    error: '',
    img: undefined,
    sizeFt: 0,
    width: 0,
    height: 0,
    pixels: function() {
        return this.width * this.height;
    },
    resetData: function() {
        this.imgUrl = '';
        this.sizesUrl = '';
        this.error = '';
        this.img = undefined;
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

function startPipeline(imgUrl, sizesUrl) {
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
    }
    xmlhttp.send();
}

function loadImage() {
    renderData.img = new Image();
    renderData.img.onload = startRender;
    renderData.img.src = renderData.imgUrl;
}

function startRender() {
    //get height data from img
    var data = getHeightData(renderData.img);

    // plane
    const scene = new THREE.Scene();

    var sky = new s.Sky();
    sky.scale.setScalar(450000)
    scene.add(sky);

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.y = 40000;
    light.position.z = -40000;
    scene.add(light);

    const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 5000000 );
    var geometry = new THREE.PlaneGeometry(renderData.sizeFt, renderData.sizeFt , renderData.width-1, renderData.height-1);
    var material = new THREE.MeshLambertMaterial({color: 0xaaddaa});
    var plane = new THREE.Mesh( geometry, material );

    //set height of vertices
    for ( var i = 0; i < renderData.pixels(); i++ ) {
        plane.geometry.attributes.position.array[i * 3 + 2] = data[i]/10;
    }

    plane.rotateX(-3.14159/2);
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    scene.add(plane);
    camera.position.y = 10000;
    camera.position.z = renderData.sizeFt/2;
    camera.rotateX(-3.14159/5);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth-20, window.innerHeight-20 );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
    document.body.appendChild( renderer.domElement );


    function animate() {
        requestAnimationFrame( animate );
        render();
    }

    function render() {
        const delta = clock.getDelta();
        controls.update( delta );
        renderer.render( scene, camera );

    }

    var controls = new c.FlyControls( camera, renderer.domElement );

    controls.movementSpeed = 4000;
    controls.domElement = renderer.domElement;
    controls.rollSpeed = 1.0;
    controls.autoForward = false;
    controls.dragToLook = false;

    animate();
}

function getHeightData(img, ) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );

    var size = img.width * img.height;
    var data = new Int32Array( size );

    context.drawImage(img,0,0);

    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;
    const view = new DataView(pix.buffer);

    for (var i = 0; i < size; i++) {
        view.setUint8(i*4 + 3, 0);
        data[i] = view.getInt32(i*4, true);
    }

    return data;
}

startPipeline("heightmap.png","size.json");
