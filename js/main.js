var container, stats;
var camera, scene, projector, raycaster, renderer;
var vrEffect;
var vrControls;
var fullScreenButton = document.querySelector( '.button' );
var radius = 100, theta = 0;
var flag=0;

// Collada Loader

var dae;
var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load( 'assets/model.dae', function ( collada ) {
	dae = collada.scene;
	dae.traverse( function ( child ) {
		if ( child instanceof THREE.SkinnedMesh ) {
			var animation = new THREE.Animation( child, child.geometry.animation );
			animation.play();
		}
	} );
	dae.scale.x = dae.scale.y = dae.scale.z = 1;
	dae.position.x = dae.position.z = 0;
	dae.position.y = 0;
	dae.updateMatrix();
	init();
	animate();
} );

function init() {

	// canvas

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// text info top of screen

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.innerHTML = 'GacVR';
	container.appendChild( info );

	//*********************** three.js scene *********************************//

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );

	scene = new THREE.Scene();

	// lights

	var light = new THREE.DirectionalLight( 0xffffff, 2 );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( -1, -1, -1 ).normalize();
	scene.add( light );

	// models

	scene.add( dae );

	//floor

	// var texture = THREE.ImageUtils.loadTexture('assets/asphalt.jpg');
	// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	// texture.repeat.set(10, 10);
 
	// var ground = new THREE.Mesh( new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
	// 	new THREE.MeshBasicMaterial(
	// 	{ color: this.textureGround ? 0xffffff : 0xaaaaaa, ambient: 0x333333, map:texture }
	// 	)
	// );
	// ground.rotation.x = -Math.PI/2;
	// ground.position.y = -250;
	// scene.add( ground );
	
	//sky

    // define path and box sides images
    var path = 'assets/';
    var sides = [ path + 'sbox_px.jpg', path + 'sbox_nx.jpg', path + 'sbox_py.jpg', path + 'sbox_ny.jpg', path + 'sbox_pz.jpg', path + 'sbox_nz.jpg' ];
 
    // load images
    var scCube = THREE.ImageUtils.loadTextureCube(sides);
    scCube.format = THREE.RGBFormat;
 
    // prepare skybox material (shader)
    var skyShader = THREE.ShaderLib["cube"];
    skyShader.uniforms["tCube"].value = scCube;
    var skyMaterial = new THREE.ShaderMaterial( {
      fragmentShader: skyShader.fragmentShader, vertexShader: skyShader.vertexShader,
      uniforms: skyShader.uniforms, depthWrite: false, side: THREE.BackSide
    });
 
    // create Mesh with cube geometry and add to the scene
    var skyBox = new THREE.Mesh(new THREE.CubeGeometry(500, 500, 500), skyMaterial);
    skyMaterial.needsUpdate = true;
 
    this.scene.add(skyBox);
	



	//************************************************************************//

	// VR WebGL code

	projector = new THREE.Projector();
	raycaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer();

	var fullScreenButton = document.querySelector( '.button' );
	fullScreenButton.onclick = function() {
		vrEffect.setFullScreen( true );
	};

	vrEffect = new THREE.VREffect(renderer, VREffectLoaded);
	var manager = new WebVRManager(renderer, vrEffect, {hideButton: false});
	vrControls = new THREE.VRControls(camera);
	function VREffectLoaded(error) {
		if (error) {
			fullScreenButton.innerHTML = error;
			fullScreenButton.classList.add('error');
		}
	}

	renderer.setClearColor( 0x7ec0ee );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	vrEffect.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	render();
	stats.update();

}

function render() {



	theta += 0.05;

	camera.position.x = radius * Math.sin( 2*THREE.Math.degToRad( theta ) );
	camera.position.y = radius * Math.abs(Math.sin( THREE.Math.degToRad( theta ) ));
	camera.position.z = radius * Math.cos( 2*THREE.Math.degToRad( theta ) );
	camera.lookAt( dae.position );
	
	

	var vector = new THREE.Vector3( 10, 10, 1 );
	projector.unprojectVector( vector, camera );

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

	vrControls.update();
	vrEffect.render( scene, camera );

}
