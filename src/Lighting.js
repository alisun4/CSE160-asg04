// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;  // uniform変数
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_globalX = 0;
let g_globalY = 0;
let g_globalZ = 0;
let g_origin = [0, 0];

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablestoGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 25;
let g_headAngle = 0;
let g_leftAngle = -12;
let g_rightAngle = -12;
let g_leftFootAngle = 12;
let g_rightFootAngle = 12;
let g_magentaAngle = 0;
let g_headAnimation = false;
let g_magentaAnimation = false;

// Set up actions for the HTML UI elements
function addActionsforHTMLUI() {

    // Animation On/Off
    // document.getElementById('rotateHeadOffButton').onclick = function() { g_headAnimation = false; };
    // document.getElementById('rotateHeadOnButton').onclick = function() { g_headAnimation = true; };

    
    // Size slider
    document.getElementById('kickLeft').addEventListener('input', function () { g_leftAngle = this.value; renderAllShapes() });
    document.getElementById('kickLeftFoot').addEventListener('input', function () { g_leftFootAngle = this.value; renderAllShapes() });
    document.getElementById('kickRight').addEventListener('input', function () { g_rightAngle = this.value; renderAllShapes() });
    document.getElementById('kickRightFoot').addEventListener('input', function () { g_rightFootAngle = this.value; renderAllShapes() });
    document.getElementById('angleSlide').addEventListener('input', function() { g_globalY = this.value; renderAllShapes(); });
    
}

function main() {
    setupWebGL();
    
    connectVariablestoGLSL();

    addActionsforHTMLUI();

    // Register function (event handler) to be called on a mouse press
    // canvas.onmousedown = click;
    canvas.onmousedown = origin;

    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
    g_seconds=performance.now()/1000.0-g_startTime;
    updateAnimationAngles();
    
    renderAllShapes();
    requestAnimationFrame(tick);
}

var g_shapesList = [];

function origin(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    g_origin = [x, y];
}

function click(ev) {
    let coordinates = convertCoordinatesEventToGL(ev);
    g_globalX = g_globalX - coordinates[0]*360;
    g_globalY = g_globalY - coordinates[1]*360;

    renderAllShapes();
}

function originCoords(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    g_origin = [x, y];
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX;
    var y = ev.clientY;

    let temp = [x,y];
    x = (x - g_origin[0])/400;
    y = (y - g_origin[1])/400;
    g_origin = temp;

    return([x,y]);
}

function updateAnimationAngles() {
    // if (g_headAnimation) {
    //     g_headAngle = (45 * Math.sin(g_seconds));
    // }

    if (g_magentaAnimation) {
        g_magentaAngle = (45 * Math.sin(3 * g_seconds));
      }

}

function renderAllShapes() {
    var startTime = performance.now();

    // var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    // gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    var globalRotMat = new Matrix4(); 
    globalRotMat.rotate(g_globalX,1,0,0); // x-axis
    globalRotMat.rotate(g_globalY,0,1,0); // y-axis
    globalRotMat.rotate(g_globalZ,0,0,1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Colors
    var BLACK = [0.230, 0.182, 0.182, 1.0];
    var BROWN = [0.610, 0.603, 0.531, 1.0];
    var PINK = [0.830, 0.681, 0.681, 1.0];
    var WHITE = [1.0, 1.0, 1.0, 1.0];


    // Bunny head

    var head = new Cube();
    head.color = BROWN;
    head.matrix.scale(0.45, 0.4, 0.4);
    head.matrix.translate(0, 0.4, -2.125);
    head.matrix.translate(-0.5, -0.5, 0);
    head.render();

    // Eyes

    var leftEye = new Cube();
    leftEye.color = BLACK;
    leftEye.matrix.scale(0.075, 0.15, 0.1);
    leftEye.matrix.translate(-2, 1.3, -8.6);
    leftEye.render();

    var rightEye = new Cube();
    rightEye.color = BLACK;
    rightEye.matrix.scale(0.075, 0.15, 0.1);
    rightEye.matrix.translate(1, 1.3, -8.6);
    rightEye.render();
    
    // Ears
    var ear1 = new Cube();
    ear1.color = BROWN;
    ear1.matrix.scale(0.11, 0.6, 0.1);
    ear1.matrix.translate(-1.5, 0.25, -5.75);
    ear1.matrix.rotate(-20, 1, 45, 0);
    ear1.render();

    var ear2 = new Cube();
    ear2.color = BROWN;
    ear2.matrix.scale(0.11, 0.6, 0.1);
    ear2.matrix.translate(0.5, 0.25, -5.75);
    ear2.matrix.rotate(20, 1, 45, 0);
    ear2.render();

    var nose = new Cube();
    nose.color = PINK;
    nose.matrix.scale(0.1, 0.1, 0.1);
    nose.matrix.translate(-0.5, 0.9, -9);
    nose.render();

    
    // Body

    var body = new Cube();
    body.color = BROWN;
    body.matrix.rotate(12, 1, 0, 0);
    body.matrix.scale(0.5, 0.4, 0.8);
    body.matrix.translate(-0.5, -1, -0.8);
    body.render();

    // Legs
    var frontlegL = new Cube();
    frontlegL.color = BROWN;
    frontlegL.matrix.rotate(12, 1, 0, 0);
    frontlegL.matrix.scale(0.15, 0.5, 0.13);
    frontlegL.matrix.translate(-2, -1.5, -5); 
    frontlegL.render();

    var frontlegR = new Cube();
    frontlegR.color = BROWN;
    frontlegR.matrix.rotate(12, 1, 0, 0);
    frontlegR.matrix.scale(0.15, 0.5, 0.13);
    frontlegR.matrix.translate(1, -1.5, -5);
    frontlegR.render();

    // Back haunches
    var haunchL = new Cube();
    haunchL.color = BROWN;
    haunchL.matrix.rotate(12, 1, 0, 0);
    haunchL.matrix.rotate(g_leftAngle, 1, 0, 0);
    haunchL.matrix.rotate(0, 1, 0, 0);
    haunchL.matrix.translate(-0.3, -0.56, -0.15);
    var leftCoords = new Matrix4(haunchL.matrix);
    haunchL.matrix.scale(0.15, 0.4, 0.3);
    haunchL.render();

    var haunchR = new Cube();
    haunchR.color = BROWN;
    haunchR.matrix.rotate(12, 1, 0, 0);
    haunchR.matrix.rotate(g_rightAngle, 1, 0, 0);
    haunchR.matrix.translate(0.15, -0.56, -0.15);
    var rightCoords = new Matrix4(haunchR.matrix);
    haunchR.matrix.scale(0.15, 0.4, 0.3);
    haunchR.render();

    // Back legs

    var backlegL = new Cube();
    backlegL.color = BROWN;
    // backlegL.matrix = haunchL.matrix;
    backlegL.matrix = leftCoords;
    // backlegL.matrix.rotate(-90, 1, 0, 0);
    backlegL.matrix.translate(0, 0, 0.3);
    backlegL.matrix.rotate(280 - g_leftFootAngle, 1, 0, 0);
    backlegL.matrix.translate(0, 0, -0.075 / 2);
    // backlegL.matrix.translate(0, 0.001, 0.5);
    backlegL.matrix.scale(0.15, 0.5, 0.075);
    backlegL.render();

    var backlegR = new Cube();
    backlegR.color = BROWN;
    // backlegR.matrix = haunchR.matrix;
    backlegR.matrix = rightCoords;
    backlegR.matrix.translate(0, 0, 0.3);
    backlegR.matrix.rotate(280 - g_rightFootAngle, 1, 0, 0);
    backlegR.matrix.translate(0, 0, -0.075 / 2);
    // backlegL.matrix.translate(0, 0.001, 0.5);
    backlegR.matrix.scale(0.15, 0.5, 0.075);
    backlegR.render();

    var tail = new Cube();
    tail.color = WHITE;
    tail.matrix.scale(0.2, 0.2, 0.2);
    tail.matrix.translate(-0.5, -1.6, 0);
    tail.matrix.rotate(12, 1, 0, 0);
    tail.render();
    
    var duration = performance.now() - startTime;
	sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {   // we take the text and its htmlID
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
      console.log("Failed to get " + htmlID + " from HTML");
      return;
    }
    htmlElm.innerHTML = text; // send inner html to whatver the text was
  }