import * as THREE from "./threejs/Three.js";
import * as c from "./threejs/controls/FlyControls.js";
import * as s from "./threejs/objects/Sky.js";

const clock = new THREE.Clock();

//return array with height data from img
function getHeightData(img, scale) {

    if (scale === undefined) scale=1;

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

function loadImage(imageUrl, sizeUrl) {
    let img = new Image();
    img.onload = function() {
        onLoadImage(img, sizeUrl);
    }
    img.src = imageUrl;
}

function onLoadImage(img, sizeUrl) {

    var sizes;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "size.json", false);
    xmlhttp.send();
    if (xmlhttp.status === 200) {
        sizes = JSON.parse(xmlhttp.responseText);
    } else {
        console.error(`error loading size.json`);
        return;
    }

    //get height data from img
    var data = getHeightData(img);
    var feet = sizes.size * 6076.12;
    var pixels = sizes.width * sizes.height;

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
    var geometry = new THREE.PlaneGeometry(feet, feet , sizes.width-1, sizes.height-1);
    var material = new THREE.MeshLambertMaterial({color: 0xaaddaa});
    var plane = new THREE.Mesh( geometry, material );

    //set height of vertices
    for ( var i = 0; i < pixels; i++ ) {
        plane.geometry.attributes.position.array[i * 3 + 2] = data[i]/10;
    }

    plane.rotateX(-3.14159/2);
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    scene.add(plane);
    camera.position.y = 10000;
    camera.position.z = feet/2;
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

loadImage("heightmap.png","size.js");
