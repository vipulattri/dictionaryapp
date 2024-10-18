const form = document.querySelector('form');
const resultDiv = document.querySelector('.result');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    getWordInfo(form.elements[0].value);
});

const getWordInfo = async (word) => {
    try{

  
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        
        const data = await response.json();
        let definitions = data[0].meanings[0].definitions[0];
        resultDiv.innerHTML = `<h2><strong>Word: </strong>${data[0].word} </h2>
        <p>${data[0].meanings[0].partOfSpeech} </p>
        <p><strong>Meaning: </strong>${definitions.definition === undefined?"Not Found":definitions.definition} </p>
        <p><strong>Example: </strong>${definitions.example === undefined?"Not found":definitions.example}</p>
        <p><strong>Antonyms: </strong></p>`;

        // Fetching Antonyns
        if(definitions.antonyms.length ===0){
            resultDiv.innerHTML += `<span>Not found</span>`
        }
        else{
        for(let i =0 ;i<definitions.antonyms.length;i++){
            resultDiv.innerHTML += `<li>${definitions.antonyms[i]}</li>`
        }
    }
    // Adding Read more button 
    resultDiv.innerHTML += `<div> <a href ="${data[0].sourceUrls}" target = "_blank">Read more </a> </div>`
}
catch{
    resultDiv.innerHTML = `<p> Sorry , the word could not be found `
}
    
}
// Three JS

window.addEventListener('load', init, false);

function init() {
  createWorld();
  createPrimitive();
  createGUI();
  //---
  animation();
}

var Theme = {_darkred: 0x000000}

//--------------------------------------------------------------------

var scene, camera, renderer, container;
var start = Date.now();
var _width, _height;
function createWorld() {
  _width = window.innerWidth;
  _height= window.innerHeight;
  //---
  scene = new THREE.Scene();
  //scene.fog = new THREE.Fog(Theme._darkred, 8, 20);
  scene.background = new THREE.Color(Theme._darkred);
  //---
  camera = new THREE.PerspectiveCamera(55, _width/_height, 1, 1000);
  camera.position.z = 12;
  //---
  renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
  renderer.setSize(_width, _height);
  //---
  container = document.getElementById("container");
  container.appendChild(renderer.domElement);
  //---
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  _width = window.innerWidth;
  _height = window.innerHeight;
  renderer.setSize(_width, _height);
  camera.aspect = _width / _height;
  camera.updateProjectionMatrix();
  console.log('- resize -');
}

//--------------------------------------------------------------------

var mat;
var primitiveElement = function() {
  this.mesh = new THREE.Object3D();
  mat = new THREE.ShaderMaterial( {
    wireframe: false,
    //fog: true,
    uniforms: {
      time: {
        type: "f",
        value: 0.0
      },
      pointscale: {
        type: "f",
        value: 0.0
      },
      decay: {
        type: "f",
        value: 0.0
      },
      complex: {
        type: "f",
        value: 0.0
      },
      waves: {
        type: "f",
        value: 0.0
      },
      eqcolor: {
        type: "f",
        value: 0.0
      },
      fragment: {
        type: "i",
        value: true
      },
      redhell: {
        type: "i",
        value: true
      }
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  });
  var geo = new THREE.IcosahedronBufferGeometry(3, 7);
  var mesh = new THREE.Points(geo, mat);
  
  //---
  this.mesh.add(mesh);
}

var _primitive;
function createPrimitive() {
  _primitive = new primitiveElement();
  scene.add(_primitive.mesh);
}

//--------------------------------------------------------------------

var options = {
  perlin: {
    vel: 0.002,
    speed: 0.00050,
    perlins: 1.0,
    decay: 0.10,
    complex: 0.30,
    waves: 20.0,
    eqcolor: 11.0,
    fragment: true,
    redhell: true
  },
  spin: {
    sinVel: 0.0,
    ampVel: 80.0,
  }
}

function createGUI() {
  var gui = new dat.GUI();
  var camGUI = gui.addFolder('Camera');
  //cam.add(, 'speed', 0.0, 30.00).listen();
  camGUI.add(camera.position, 'z', 3, 20).name('Zoom').listen();
  camGUI.add(options.perlin, 'vel', 0.000, 0.02).name('Velocity').listen();
  //camGUI.open();
  
  var mathGUI = gui.addFolder('Math Options');
  mathGUI.add(options.spin, 'sinVel', 0.0, 0.50).name('Sine').listen();
  mathGUI.add(options.spin, 'ampVel', 0.0, 90.00).name('Amplitude').listen();
  //mathGUI.open();
  
  var perlinGUI = gui.addFolder('Setup Perlin Noise');
  perlinGUI.add(options.perlin, 'perlins', 1.0, 5.0).name('Size').step(1);
  perlinGUI.add(options.perlin, 'speed', 0.00000, 0.00050).name('Speed').listen();
  perlinGUI.add(options.perlin, 'decay', 0.0, 1.00).name('Decay').listen();
  perlinGUI.add(options.perlin, 'waves', 0.0, 20.00).name('Waves').listen();
  perlinGUI.add(options.perlin, 'fragment', true).name('Fragment');
  perlinGUI.add(options.perlin, 'complex', 0.1, 1.00).name('Complex').listen();
  perlinGUI.add(options.perlin, 'redhell', true).name('Electroflow');
  perlinGUI.add(options.perlin, 'eqcolor', 0.0, 15.0).name('Hue').listen();
  perlinGUI.open();
}

//--------------------------------------------------------------------

function animation() {
  requestAnimationFrame(animation);
  var performance = Date.now() * 0.003;
  
  _primitive.mesh.rotation.y += options.perlin.vel;
  _primitive.mesh.rotation.x = (Math.sin(performance * options.spin.sinVel) * options.spin.ampVel )* Math.PI / 180;
  //---
  mat.uniforms['time'].value = options.perlin.speed * (Date.now() - start);
  mat.uniforms['pointscale'].value = options.perlin.perlins;
  mat.uniforms['decay'].value = options.perlin.decay;
  mat.uniforms['complex'].value = options.perlin.complex;
  mat.uniforms['waves'].value = options.perlin.waves;
  mat.uniforms['eqcolor'].value = options.perlin.eqcolor;
  mat.uniforms['fragment'].value = options.perlin.fragment;
  mat.uniforms['redhell'].value = options.perlin.redhell;
  //---
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}