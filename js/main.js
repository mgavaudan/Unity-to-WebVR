var container, stats;
var camera, scene, projector, raycaster, renderer;
var vrEffect;
var vrControls;
var fullScreenButton = document.querySelector( '.button' );
var radius = 100, theta = 0;

// Collada Loader

var dae;
var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load( 'js/model.dae', function ( collada ) {
	dae = collada.scene;
	dae.traverse( function ( child ) {
		if ( child instanceof THREE.SkinnedMesh ) {
			var animation = new THREE.Animation( child, child.geometry.animation );
			animation.play();
		}
	} );
	dae.scale.x = dae.scale.y = dae.scale.z = 1;
	dae.position.x = dae.position.y = dae.position.z = 0;
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

	// three.js scene

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );

	scene = new THREE.Scene();

	var light = new THREE.DirectionalLight( 0xffffff, 2 );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( -1, -1, -1 ).normalize();
	scene.add( light );

	scene.add( dae );

	// VR WebGL code

	projector = new THREE.Projector();
	raycaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer();

	var fullScreenButton = document.querySelector( '.button' );
	fullScreenButton.onclick = function() {
		vrEffect.setFullScreen( true );
	};

	vrEffect = new THREE.VREffect(renderer, VREffectLoaded);
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

	theta += 0.01;

	camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
	camera.lookAt( scene.position );

	// find intersections

	var vector = new THREE.Vector3( 10, 10, 1 );
	projector.unprojectVector( vector, camera );

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

	vrControls.update();
	vrEffect.render( scene, camera );

}