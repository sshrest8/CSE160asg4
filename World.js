// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = a_Normal;
        v_VertPos = u_ModelMatrix * a_Position;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;
    void main() {

        if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;     // use color

        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV,1.0,1.0);     // use uv debug color

        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);     // use texture0

        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);     // use texture1

        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);     // use texture2

        } else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);     // use texture3

        } else if (u_whichTexture == -3) {
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);       // use normal

        } else {                                    // error, put redish
            gl_FragColor = vec4(1,.2,.2,1);
        }
        
        vec3 lightVector = u_lightPos-vec3(v_VertPos);
        float r=length(lightVector);
        // if (r<1.0) {
        //     gl_FragColor= vec4(1,0,0,1);
        // } else if (r<2.0) {
        //     gl_FragColor= vec4(0,1,0,1);
        // }

        // N dot L
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N,L), 0.0);

        // Reflection
        vec3 R = reflect(-L, N);

        // eye
        vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

        // Specular
        float specular = pow(max(dot(E,R), 0.0), 50.0);

        vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * nDotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;

        if (u_lightOn) {
            gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
        }
        // gl_FragColor = vec4(specular * 1.0 +diffuse+ambient, 1.0);
        // gl_FragColor = gl_FragColor * nDotL;
        // gl_FragColor.a = 1.0;
        // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);


    }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;
let a_Normal;
let u_lightPos;
let u_cameraPos;
let u_lightOn = true;


function setupWebGl(){
        // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return false;
    }

    // get storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix')
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log("Failed to get the storage location of u_ProjectionMatrix");
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    
    // // Get the storage location of a_Position
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // // Get the storage location of a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log("Failed to get the storage location of u_lightPos");
        return;
    }

    // // Get the storage location of u_cameraPos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (u_cameraPos < 0) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    // // Get the storage location of u_lightOn
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (u_lightOn < 0) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }

    
    // Get the storage location of u_Sampler

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return false;
    }
    
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
      console.log('Failed to get the storage location of u_Sampler2');
      return false;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
      console.log('Failed to get the storage location of u_Sampler3');
      return false;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if (!u_Size) {
    //     console.log('Failed to get the storage location of u_Size');
    //     return;
    // }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// GLobal related UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_segments=5;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_headAngle = 0;
let g_magentaAngle = 0;
let g_walkAngle1 = 0;
let g_walkAngle2 = 0;
let g_tailAngle1 = 0;
let g_tailAngle2 = 0;
let g_tailAngle3 = 0;
let g_walkAnimation1 = false;
let g_magentaAnimation = false;
let g_speed = 1;

let g_camera;
let g_normalOn = false;
let g_lightPos=[0,4,-2];
let g_lightOn = true;

// let shiftClick = false;
// let carrotScale = 0;
// let carrotTranslate = -14;


// Set up actions for the HTML UI Elements
function addActionsForHtmlUI(){
    // Button Events (Shape Type)

    // document.getElementById('animationWalkOnButton').onclick = function() { g_walkAnimation1 = true; renderAllShapes();};
    // document.getElementById('animationWalkOffButton').onclick = function() { g_walkAnimation1 = false; renderAllShapes();};
    document.getElementById('normalOn').onclick = function() {g_normalOn = true;};
    document.getElementById('normalOff').onclick = function() {g_normalOn = false;};

    document.getElementById('lightOn').onclick = function() {g_lightOn = true;};
    document.getElementById('lightOff').onclick = function() {g_lightOn = false;};
    
    document.getElementById('8x8Button').onclick = function() { g_map = g_map8;
                                                                mapSize = 8;

                                                                renderAllShapes();  
                                                                
                                                            };
    document.getElementById('32x32Button').onclick = function() { g_map = g_map32;
                                                                  mapSize = 32;
                                                                  renderAllShapes();
                                                                };
                            

    // // // Slider Events

    document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});
    
    
    // document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });

    // document.getElementById('tailSlide1').addEventListener('mousemove', function() { g_tailAngle1 = this.value; renderAllShapes(); });
    // document.getElementById('tailSlide2').addEventListener('mousemove', function() { g_tailAngle2 = this.value; renderAllShapes(); });
    // document.getElementById('tailSlide3').addEventListener('mousemove', function() { g_tailAngle3 = this.value; renderAllShapes(); });

    // document.getElementById('speedSlide').addEventListener('mousemove', function() { g_speed = this.value; renderAllShapes(); });
    
    // document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngleX = this.value; renderAllShapes(); });
    // document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_segments= this.value; });                                                  
    


}

function initTextures() {
    var image = new Image();  // Create the image object
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ sendImageToTEXTURE0(image); };
    // Tell the browser to load an image
    image.src = 'starsky.jpg';

    // add more textures later
    var image1 = new Image();  // Create the image object
    if (!image1) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    image1.onload = function(){ sendImageToTEXTURE1(image1); };
    // Tell the browser to load an image
    image1.src = 'cartesiancoordmap1024.jpg';

    var image2 = new Image();  // Create the image object
    if (!image2) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    image2.onload = function(){ sendImageToTEXTURE2(image2); };
    // Tell the browser to load an image
    image2.src = 'wood.jpg';

    var image3 = new Image();  // Create the image object
    if (!image3) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    image3.onload = function(){ sendImageToTEXTURE3(image3); };
    // Tell the browser to load an image
    image3.src = 'portal.png';
  
    return true;
}

function sendImageToTEXTURE0(image) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
    console.log("Finished loadTexture0")
}

function sendImageToTEXTURE1(image1) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
    console.log("Finished loadTexture1")
}

function sendImageToTEXTURE2(image) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);
    console.log("Finished loadTexture2")
}

function sendImageToTEXTURE3(image) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE3);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler3, 3);
    console.log("Finished loadTexture3")
}

function main() {
    
    setupWebGl();
    connectVariablesToGLSL();
    // Set up actions for the HTML UI elements 
    addActionsForHtmlUI();
    // Register function (event handler) to be called on a mouse press

    
    cameraControl();
    initTextures();
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // drawCap();
    //renderAllShapes();
    requestAnimationFrame(tick)
}

function cameraControl(){
    g_camera = new Camera();
    document.onkeydown = keydown;

    canvas.onclick = function() {
        canvas.requestPointerLock();
    };


    canvas.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === canvas) {
            g_camera.onMouseMove(event);
            renderAllShapes();
        }
    });

    document.addEventListener("pointerlockchange", function() {
        if (document.pointerLockElement !== canvas) {
            console.log("Pointer unlocked.");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            document.exitPointerLock();
        }
    });

    document.addEventListener("mousedown", (event) => {
        if (event.button === 2) {
            g_camera.placeBlock();
        }
        if (event.button === 0) {
            g_camera.breakBlock();
        }
    });


    // canvas.addEventListener('mouseleave', () => {
    //     g_camera.lastX = null;
    //     g_camera.lastY = null;
    // });
}


var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick(){
    // Print some debug info so we know we are running
    g_seconds = performance.now() / 1000.0 - g_startTime;
    // console.log(g_seconds);

    g_camera.update();

    updateAnimationAngles();
    // Draw everthing
    renderAllShapes();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}


var g_shapesList = [];
// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];


function click(ev) {
    if (!shiftClick){let [x,y] = convertCoordinatesEventToGL(ev);

        g_globalAngleX = x * 180;
        g_globalAngleY = y * 90;


        // Draw every shape that is supposed to be in the canvas
        renderAllShapes();
    }
}

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x,y]);
}

function updateAnimationAngles() {
    // if (g_yellowAnimation) {
    //     g_yellowAngle = (45 * Math.sin(g_seconds));
    // }
    // if (g_magentaAnimation) {
    //     g_magentaAngle = (45 * Math.sin(3 * g_seconds));
    // }
    g_lightPos[0]= Math.cos(g_seconds);
    if (g_walkAnimation1) {
        g_walkAngle1 = (45 * Math.sin(g_speed * g_seconds));
        g_walkAngle2 = (1 - 45 * Math.sin(g_speed * g_seconds));
        g_tailAngle1 = (30 * Math.sin(g_speed * g_seconds));
        g_tailAngle2 = (30 * Math.sin(g_speed * g_seconds));
        g_tailAngle3 = (30 * Math.sin(g_speed * g_seconds));
        if (g_speed > 16){
            g_headAngle = (45 * Math.sin(g_speed / 2 * g_seconds));
            // pigSoung.play();
        } else {
            g_headAngle = 45 * Math.sin(g_speed / 5 * g_seconds);
        }
    }
    
    // if (g_walkAnimation1) {
    //     g_walkAngle2 = (1 - 45 * Math.sin(3 * g_seconds));
    // }
    // if (g_walkAnimation1) {
    //     g_tailAngle = (30 * Math.sin(4 * g_seconds));
    // }
}

function keydown(ev) {
    ev.preventDefault();

    if (ev.keyCode == 68) {  // D key
        g_camera.moveRight();
        //console.log("D pressed, calling moveRight")
    } else if (ev.keyCode == 65) {   // A key
        g_camera.moveLeft();
        //console.log("A pressed, calling moveLeft")
    } else if (ev.keyCode == 87) {   // W key
        g_camera.moveForward();
        //console.log("W pressed, calling moveForward")
    } else if (ev.keyCode == 83) {   // S key
        g_camera.moveBackwards();
        // console.log("S pressed, calling moveBackwards")
    // } else if (ev.keyCode == 69) {   // E key
    //     g_camera.panRight();
    // } else if (ev.keyCode == 81) {   // Q key
    //     g_camera.panLeft();
    } else if (ev.keyCode == 32){
        g_camera.jump();
    }
    renderAllShapes();
}


var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

// var g_map =[];

var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];



var g_map32 = [
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// function drawMap() {
//     for (x = 0; x < 8; x++){
//         for (y = 0; y < 8; y++){
//             wallCount = g_map[x][y];
//             if (wallCount >= 1) {
//                 var wall = new Cube();
//                 wall.color = [1.0,1.0,1.0,1.0];
//                 wall.textureNum = 2;
//                 wall.matrix.translate(x - 4, -0.75, y - 4);
//                 var wallCoordinatesMat = new Matrix4(wall.matrix);
//                 wall.renderFast();
//                 if (wallCount > 1){
//                     for (let walls = 0; walls < wallCount - 1; walls++) {
//                         var upperWall = new Cube();
//                         upperWall.color = [1.0,1.0,1.0,1.0];
//                         upperWall.textureNum = 2;
//                         upperWall.matrix = wallCoordinatesMat;
//                         upperWall.matrix.translate(0, 1, 0);
//                         upperWall.renderFast();

//                     }
//                 }
//             }
//         }
            
//     }
// }

function drawMap() {
    let mapSize = (g_map === g_map32) ? 32 : 8;

    for (let x = 0; x < mapSize; x++) {
        for (let y = 0; y < mapSize; y++) {
            let wallCount = g_map[x][y];

            if (wallCount >= 1) {
                var wall = new Cube();
                console.log(wall instanceof Cube);
                wall.color = [1.0, 1.0, 1.0, 1.0];
                if (g_normalOn) wall.textureNum=-3;


                wall.matrix.translate(x - mapSize / 2, -0.75, y - mapSize / 2);
                var wallCoordinatesMat = new Matrix4(wall.matrix);

                wall.render();

                if (wallCount > 1) {
                    for (let h = 1; h < wallCount; h++) {
                        var upperWall = new Cube();
                        upperWall.color = [1.0, 1.0, 1.0, 1.0];
                        if (g_normalOn) upperWall.textureNum=-3;

                        upperWall.matrix.set(wallCoordinatesMat); 
                        upperWall.matrix.translate(0, h, 0);
                        upperWall.render();
                    }
                }
            }
        }
    }
}


function renderAllShapes(){
    // Check the time at the start of the function
    var startTime = performance.now();


    // pass the proj matrix
    var projMat = new Matrix4();
    projMat.setPerspective(50, 1 * canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);


    // pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],  // eye
                      g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],  // at
                      g_up[0] ,g_up[1] ,g_up[2]); // (eye, at, up)
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_globalAngleX,0,1,0);
    globalRotMat.rotate(g_globalAngleY, 1,0,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //var len = g_points.length;

    var len = g_shapesList.length;
    drawMap();

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    // console.log("camera poses:", g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

    // pass ilght status
    gl.uniform1i(u_lightOn, g_lightOn);


    var light = new Cube();
    light.color = [2,2,0.0,1.0];
    light.matrix.translate(g_lightPos[0],  g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1, -.1, -.1);
    light.matrix.translate(-0.5, 5, -0.5);
    light.render();


    var sphere = new Sphere();
    sphere.color = [0.4,0.4,0.4,1];
    if (g_normalOn) sphere.textureNum=-3;
    sphere.matrix.translate(0,1,-2);
    sphere.render();

    // Draw the floor
    var floor = new Cube();
    floor.color = [1.0,0.0,0.0,1.0];
    floor.textureNum=3;
    floor.matrix.translate(0, -10, 0.0);
    floor.matrix.scale(100, 0, 100);
    floor.matrix.translate(-0.5, -50, -0.5);
    floor.render();

    // Draw the sky
    var sky = new Cube();
    sky.color = [0.8,0.8,0.8,1.0];
    if (g_normalOn) sky.textureNum=-3;
    sky.matrix.scale(-10,-10,-10);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    // Check the time at the end of the function, and show on the webpage
    var duration = performance.now() - startTime;
    sendTextToHTML("nusendmdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}



