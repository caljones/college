const headlinesEl = document.querySelector('.headlines');

let camera; 
let scene;
let renderer;

let light1;
let light2;
let light3;
let container;

let windowState = {};
let contentState = {};
let canvasState = {}

const HALF_PI = Math.PI / 2;

setWindowState();
setCanvasState();

setTimeout(() => {
  init()
}, 200);

function handleScroll(e) {
  windowState.isScrolling = true;
  clearTimeout(windowState.scrollTimeout)
  windowState.scrollTimeout = setTimeout(() => {
    windowState.isScrolling = false;
    canvasState.isBackwardMotion = false;
    canvasState.isForwardMotion = false;
  }, 100)
  let oldScrollY = windowState.scrollY
  windowState.scrollY = window.scrollY;
  if (e.deltaY > 0) {
    canvasState.isBackwardMotion = true;
  } else {
    canvasState.isForwardMotion = true;
  }
}

function init() {
  canvasState.isInitialized = true;
  canvasState.frame = 0;
  
  createScene();
  createTerrain();
  handleResize();
  createCamera();
  createLights();
  createRenderer();
  addEventListeners();
  createRobot();

  animate(100, 0);
}

function createScene() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  scene = new THREE.Scene();
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( 1 );
  renderer.setSize( window.innerWidth, windowState.height );
  // scene.background = new THREE.Color(0x15151f);
  renderer.setClearColor(0x000000, 0)

  container.appendChild( renderer.domElement );

  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
}

function createCamera() {
  camera = new THREE.PerspectiveCamera( 34.6, windowState.width / windowState.height, 1, 1000 );

  camera.position.x = 0;
  // camera.position.y = -22;
  camera.aspect = windowState.width / windowState.height;
  camera.position.z = 19.5;
  camera.lookAt(0,0,0);

  scene.add( camera );
}

function createLights() {

  scene.add( new THREE.AmbientLight( 0xffffff, 0.11 ) );

  canvasState.lights = new THREE.Group();

  light1 = new THREE.DirectionalLight( 0x0000ff, 0.75, 0, 0.3 );
  light2 = new THREE.DirectionalLight( 0xff0000,0.75, 0, 0.3 );
  light3 = new THREE.DirectionalLight( 0x00ff00,0.75, 0, 0.3 );
  
  light1.position.set( -1.5, 1.5, 3);
  light2.position.set( 1.5, 1.5, 3);
  light3.position.set( 0, -1.5, 3);
  
  canvasState.lights.add( light1 );
  canvasState.lights.add( light2 );
  canvasState.lights.add( light3 );
  scene.add(canvasState.lights)

}

function createTerrain() {
  const planeGeometry = new THREE.PlaneGeometry(100,100,20,20);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  })
  canvasState.terrain = new THREE.Mesh(planeGeometry, planeMaterial)
  
  canvasState.terrain.position.z = -1;
  planeGeometry.computeVertexNormals(true);
  planeMaterial.shading = THREE.FlatShading;
  planeMaterial.needsUpdate = true
  planeGeometry.attributes.position.needsUpdate = true;
  canvasState.terrain.receiveShadow = true;
  // canvasState.terrain.castShadow = true;
  // scene.add(canvasState.terrain);
}

function createRobot() {
  canvasState.ballContainer = new THREE.Group();
  const ballGeometry = new THREE.IcosahedronGeometry(1, 1);
  const ballMaterial = new THREE.MeshPhongMaterial({
    color: 0x111111,
    shading: THREE.FlatShading
  });
  canvasState.ball = new THREE.Mesh(ballGeometry, ballMaterial);
  canvasState.ball.receiveShadow = true;
  canvasState.ball.castShadow = true;
  canvasState.ball.userProps = {
    startZ: Math.random() * 5,
    vZ: Math.random() + 0.5,
  }

  canvasState.ballContainer.add(canvasState.ball);
  scene.add(canvasState.ballContainer);
}

function handleResize() {
  const newWidth = window.innerWidth - windowState.scrollbarWidth;
  if (canvasState.isInitialized && windowState.width === newWidth && windowState.isSmallScreen) return;
  windowState.isSmallScreen = newWidth < 1000;
  setWindowState();
  setContentState();
  setCanvasState();
  windowState.width = newWidth;
  windowState.heightScale = windowState.isSmallScreen ? 1.2 : 1;
  windowState.height = window.innerHeight * windowState.heightScale;
  document.body.style.setProperty('--screenHeight', windowState.height);
  if (!camera) return;
  camera.aspect = windowState.width / windowState.height;
  camera.updateProjectionMatrix();
  renderer.setSize( windowState.width, windowState.height );
}

function setWindowState() {
  windowState = {
    width: window.innerWidth,
    height: window.innerHeight,
    heightScale: windowState.heightScale || 1,
    scrollY: window.scrollY,
    mouseX: 0,
    mouseY: 0,
    isSmallScreen: false,
    isMouseDown: false,
    devScreenW: 1680,
    devScreenH: 915,
    devScreenAspect: undefined,
    aspect: undefined,
    scrollbarWidth: window.innerWidth - document.querySelector('body').offsetWidth,
    scrollTimeout: undefined
  }

  windowState.isSmallScreen = windowState.width < 1000;
  windowState.devScreenAspect = windowState.devScreenW / windowState.devScreenH;
  windowState.aspect = windowState.width / windowState.height;
  windowState.heightScale = windowState.isSmallScreen ? 1.2 : 1;
  windowState.height = windowState.height * windowState.heightScale;
}

function setContentState() {
  contentState = {
    scrollHeight: document.body.getBoundingClientRect().height - windowState.height,
  }
}

function setCanvasState() {
  canvasState = {
    isInitialized: canvasState.isInitialized || false,
    ball: canvasState.ball,
    terrain: canvasState.terrain,
    isUnlocked: canvasState.isUnlocked || false,
    mouseX: 0,
    mouseY: 0,
    view: canvasState.view || 0,
    frame: canvasState.frame || 0,
    revealFrame: canvasState.revealFrame || 0,
    scaleX: windowState.width / windowState.devScreenW,
    scaleY: windowState.height / windowState.heightScale / windowState.devScreenH,
    scaleAspect: windowState.aspect / windowState.devScreenAspect,
    boxScaleX: undefined,
    boxScaleY: undefined,
    vX: 0,
    vY: 0,
    vZ: 0,
    mainY: 0,
    friction: 0.95,
    gravity: 0.9
  }
}

function addEventListeners() {
  window.addEventListener('resize', handleResize );
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keyup', handleKeyup)
  window.addEventListener('wheel', handleScroll);
}

function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowUp':
      canvasState.isForwardMotion = true;
      break;
    case 'ArrowDown':
      canvasState.isBackwardMotion = true;
      break;
    case 'ArrowLeft':
      canvasState.isLeftMotion = true;
      break;
    case 'ArrowRight':
      canvasState.isRightMotion = true;
      break;
    case ' ':
      canvasState.isJumping = true;
      break;
    }
  }
  
  function handleKeyup(e) {
    switch (e.key) {
      case 'ArrowUp':
        canvasState.isForwardMotion = false;
        break;
      case 'ArrowDown':
        canvasState.isBackwardMotion = false;
        break;
      case 'ArrowLeft':
        canvasState.isLeftMotion = false;
        break;
      case 'ArrowRight':
        canvasState.isRightMotion = false;
        break;
  }
}

function handleMouseMove(e) {
  windowState.mouseX = (e.pageX - windowState.width / 2) / windowState.width;
  windowState.mouseY = (e.pageY - windowState.scrollY - windowState.height / 2) / windowState.height;
  light1.position.x = windowState.mouseX * 6;
  light1.position.y = -windowState.mouseY * 6;
  light2.position.x = -windowState.mouseX * 6;
  light2.position.y = -windowState.mouseY * 6;
  light3.position.y = windowState.mouseY * 6;
}

function handleMouseDown() {
  windowState.isMouseDown = true;
}

function handleMouseUp() {
  windowState.isMouseDown = false;
}


function animate(now, then) {
  const elapsed = now - then;
  const frameDuration = windowState.isScrolling ? 16 : 16;
  if (elapsed >= frameDuration) {

    renderer.render( scene, camera );
    let aX = 0;
    let aY = 0;
    let aZ = -0.015;
    canvasState.vX *= canvasState.friction;
    canvasState.vY *= canvasState.friction;
    
    if (canvasState.isForwardMotion) {
      aY = 0.004;
    }
    if (canvasState.isBackwardMotion) {
      aY = -0.004;
    }
    if (canvasState.isLeftMotion) {
      aX = -0.004;
    }
    if (canvasState.isRightMotion) {
      aX = 0.004;
    }
    if (canvasState.isJumping) {
      aZ = 0.3;
      canvasState.isJumping = false;
    }
    canvasState.vX += aX;
    canvasState.vY += aY;
    canvasState.vZ += aZ;
    // canvasState.ballContainer.position.x += Math.min(0.1, canvasState.vX);
    // canvasState.ballContainer.position.y += Math.min(0.1, canvasState.vY);
    // canvasState.ballContainer.position.z += canvasState.vZ;
    // canvasState.ballContainer.position.z = Math.max(0, canvasState.ballContainer.position.z)
    if (canvasState.ballContainer && canvasState.ballContainer.position.z === 0 && canvasState.vZ < 0) {
      canvasState.vZ = 0;
    }
    canvasState.ball.rotation.x -= Math.min(0.1, canvasState.vY);
    canvasState.ballContainer.rotation.y += Math.min(0.1, canvasState.vX);
    canvasState.mainY += canvasState.vY * 100;
    document.querySelector('main').style.transform = `translateY(${canvasState.mainY}px)`
  } else {
    now = then;
  }

  requestAnimationFrame( (next) => { animate(next, now)} );

}