// The babylon engine
var engine;
// The current scene
var scene;
// The HTML canvas
var canvas;

// to go quicker
var v3 = BABYLON.Vector3;

// The function onload is loaded when the DOM has been loaded
document.addEventListener("DOMContentLoaded", function () {
    onload();
}, false);

// Resize the babylon engine when the window is resized
window.addEventListener("resize", function () {
    if (engine) {
        engine.resize();
    }
},false);

/**
 * Onload function : creates the babylon engine and the scene
 */
var onload = function () {
    // Engine creation
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);

    // Scene creation
    var scene = createScene();

    // The render function
    engine.runRenderLoop(function () {
        scene.render();
    }); 

};

var createScene = function() {

    var scene = new BABYLON.Scene(engine);
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0, new BABYLON.CannonJSPlugin()));
    //scene.getPhysicsEngine().setGravity(new BABYLON.Vector3(0, -9.8, 0));

    //Create a light
    var light = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(-40, 100, 0), scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(1, 1, 1);

    //Creating shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.usePoissonSampling = true;
        
    //Create an Arc Rotate Camera - aimed negative z this time
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI, 1.25, 120, new BABYLON.Vector3(0, 10, 0), scene);
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 150;
    camera.attachControl(canvas, true);
    //scene.activeCameras.push(camera);

    /*Creation of sky
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    skybox.infiniteDistance = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./textures/skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;*/

    //creating a hitbox
    var hitbox = BABYLON.Mesh.CreateBox("hitbox", 0.2, scene);
    hitbox.position.x = 54;
    hitbox.position.y = 35.5;

    var materialHitbox = new BABYLON.StandardMaterial("textureHitbox", scene);
    materialHitbox.alpha = 0;

    hitbox.material = materialHitbox;

    //Creating basketboard
    var board = BABYLON.Mesh.CreateBox("board", 15, scene);
    board.scaling.x = 0.05
    board.scaling.y = 1.6
    board.position.x = 56;
    board.position.y = 43;
    board.rotation.x = -Math.PI / 2;
    board.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.3});

    //creation of textured board
    var materialBoard = new BABYLON.StandardMaterial("textureBoard", scene);
    materialBoard.diffuseTexture = new BABYLON.Texture("./textures/bboard.jpg", scene);
    //materialBoard.diffuseTexture.uScale = -0.8;
    //materialBoard.diffuseTexture.vScale = -0.8;
    materialBoard.diffuseColor = new BABYLON.Color3(2, 2, 2);
    materialBoard.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    //Apply the materials to meshes
    board.material = materialBoard;
    
    //Creation a torus
    var torus = BABYLON.Mesh.CreateTorus("torus", 8.5, 0.8, 35, scene);
    torus.position.x = 50.5;
    torus.position.y = 37;
    torus.setPhysicsState({ impostor: BABYLON.PhysicsEngine.MeshImpostor, mass: 0, friction: 0, restitution: 1.5});

    var materialTorus = new BABYLON.StandardMaterial("textureTorus", scene);
    materialTorus.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0);
    materialTorus.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    torus.material = materialTorus;

    //Creation net
    var materialNet = new BABYLON.StandardMaterial("mat1", scene);
    materialNet.diffuseTexture = new BABYLON.Texture("./textures/net.png", scene);
    materialNet.diffuseColor = new BABYLON.Color3(2, 2, 2);
    materialNet.backFaceCulling = false;
    materialNet.diffuseTexture.hasAlpha = true;

    var curvePoints = function(l, t) {
        var path = [];
        var step = l / t;
        var a = 2;
        for (var i = -l/a; i < l/a; i += step ) {
            path.push(new BABYLON.Vector3(0, i, 0 ));
        }
        return path;
    };

    var curve = curvePoints(10, 4);
  
    var radiusFunction = function(i, distance) {
        var radius =  i+0.8;
        return radius;
    };  
  	
  	var subdivisions = 20;
  	var xPosition = 50.5 //50.5
  	var yPosition = 34;

    var tube = BABYLON.Mesh.CreateTube("tube", curve, 6, subdivisions, radiusFunction, 0, scene, true, BABYLON.Mesh.FRONTSIDE);
    tube.position.x = xPosition;
    tube.position.y = yPosition;
    tube.rotation.y = -Math.PI / 2;
    //tube.setPhysicsState({ impostor: BABYLON.PhysicsEngine.MeshImpostor, mass: 0, friction: 0, restitution: 0});
    tube.material = materialNet;

    //Adding particles to the net
    var groundWidth = subdivisions;
	
	var distanceBetweenPoints = 2;	
    //get the position vertices data
	var positions = tube.getVerticesData(BABYLON.VertexBuffer.PositionKind);  
	//where will they be stored
	var spheres = [];  
	for (var i = 0; i < positions.length; i = i + 3) {  
    	//get the position of the i's sphere
    	var v = BABYLON.Vector3.FromArray(positions, i);
    	//create a sphere, position it in "v"
    	var s = BABYLON.MeshBuilder.CreateSphere("s" + i, { diameter: 0.01}, scene);
    	s.position.copyFrom(v);
    	s.position.x += xPosition;
    	s.position.y += yPosition;
    	//push it to the sphere's array for future reference
    	spheres.push(s);
	}

	//create the impostors
	spheres.forEach(function(point, idx) {
    	var mass = idx > (subdivisions+1)*3 ? 0 : 0.1;
    	point.physicsImpostor = new BABYLON.PhysicsImpostor(point, BABYLON.PhysicsImpostor.ParticleImpostor, {
        	mass: mass,
        	friction: 0.1
    	}, scene);
	});

	function createJoint(imp1, imp2, dist) {  
    	var joint = new BABYLON.DistanceJoint({
        	maxDistance: dist
    	})
    	imp1.addJoint(imp2, joint);
	}

	//create the impostors
	spheres.forEach(function(point, idx) {  
    	if (idx + subdivisions < spheres.length) {
    		createJoint(point.physicsImpostor, spheres[idx + subdivisions].physicsImpostor, distanceBetweenPoints);
    		if (idx % subdivisions) {
				createJoint(point.physicsImpostor, spheres[idx - 1].physicsImpostor, 1);
			}
    		//createJoint(point.physicsImpostor, spheres[idx + 1].physicsImpostor,0.1);
    		//createJoint(point.physicsImpostor, spheres[idx + 2].physicsImpostor,0.2);
    		//createJoint(point.physicsImpostor, spheres[idx + 3].physicsImpostor,0.3);
    	}
	});

	tube.registerBeforeRender(function () {
		var positions = [];
		spheres.forEach(function (s) {
			positions.push(s.position.x - xPosition, s.position.y - yPosition, s.position.z);

		});
		tube.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
		tube.refreshBoundingInfo();
	});

    //Creation of ball
    var ball = BABYLON.Mesh.CreateSphere("ball", 10.0, 6.0, scene);
    ball.position.x = -20;
    ball.position.y = +20;

    //creation of textured ball
    var materialBall = new BABYLON.StandardMaterial("textureBall", scene);
    materialBall.diffuseTexture = new BABYLON.Texture("./textures/bBall.png", scene);
    materialBall.diffuseColor = new BABYLON.Color3(2, 2, 2);
    materialBall.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    //Apply the materials to meshes
    ball.material = materialBall;

    //Creation of a floor
    var floor = BABYLON.Mesh.CreateGround("floor", 120, 120, 1, scene);

    floor.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 2 });

    //Creation of textured floor
    var materialFloor= new BABYLON.StandardMaterial("texturePlane", scene);
    materialFloor.ambientTexture = new BABYLON.Texture("./textures/bFloor.png", scene);
    materialFloor.backFaceCulling = true; //Show the front and the back of an element

    //Apply the materials to meshes
    floor.material = materialFloor;

    //Creation of walls
    /*var planeLeft = BABYLON.Mesh.CreatePlane("planeLeft", 120.0, scene, false);
    planeLeft.position.z = 60;
    planeLeft.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.1 });
    var planeRight = BABYLON.Mesh.CreatePlane("planeRight", 120.0, scene, false);
    planeRight.position.z = -60;
    planeRight.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.1 });*/
    var planeFront = BABYLON.Mesh.CreatePlane("planeFront", 120.0, scene, false);
    planeFront.position.x = 60;
    planeFront.rotation.y = Math.PI / 2;
    planeFront.position.y = 60;
    planeFront.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.5 });
    var planeSkirting = BABYLON.Mesh.CreatePlane("planeSkirting", 120.0, scene, false);
    planeSkirting.position.x = 59.9;
    planeSkirting.rotation.y = Math.PI / 2;
    planeSkirting.position.y = 1;
    planeSkirting.scaling.y = 0.03;
    /*var planeBack = BABYLON.Mesh.CreatePlane("planeBack", 120.0, scene, false);
    planeBack.position.x = -60;
    planeBack.rotation.y = Math.PI / 2;
    planeBack.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.1 });*/

    //Creation of textured wall
    var materialPlane = new BABYLON.StandardMaterial("texturePlane", scene);
    materialPlane.ambientTexture = new BABYLON.Texture("./textures/wallc.jpg", scene);
    materialPlane.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    materialPlane.backFaceCulling = false; //Show the front and the back of an element

    //Creation of textured skirting
    var materialSkirting = new BABYLON.StandardMaterial("textureSkirting", scene);
    materialSkirting.diffuseColor = new BABYLON.Color3( 0, 0, 0);
    materialSkirting.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    materialSkirting.backFaceCulling = true; //Show the front and the back of an element

    //Apply the materials to meshes
    //planeLeft.material = materialPlane;
    //planeRight.material = materialPlane;
    planeFront.material = materialPlane;
    planeSkirting.material = materialSkirting;
    //planeBack.material = materialPlane;

    //Adding shadows
    shadowGenerator.getShadowMap().renderList.push(ball);
    shadowGenerator.getShadowMap().renderList.push(board);
    shadowGenerator.getShadowMap().renderList.push(torus);
    //shadowGenerator.getShadowMap().renderList.push(tube);
    
    floor.receiveShadows = true;
    planeFront.receiveShadows = true;
    board.receiveShadows = true;
    torus.receiveShadows = true;
    ball.receiveShadows = true;

    /* Events
    var startingPoint;
    var currentMesh;

    var strengthCounter = 5;
	var counterUp = function() {
  		strengthCounter += 0.5;
	}

    var getGroundPosition = function () {
        // Use a predicate to get position on the ground
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var onPointerDown = function (evt) {
        if (evt.button !== 0) {
            return;
        }

        // check if we are under a mesh
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == basketball; });
        if (pickInfo.hit) {
        	// Start increasing the strength counter. 
  			scene.registerBeforeRender(counterUp);
            currentMesh = pickInfo.pickedMesh;
            startingPoint = getGroundPosition(evt);

            if (startingPoint) { // we need to disconnect camera from canvas
                //basketball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 0 });
                setTimeout(function () {
                    camera.detachControl(canvas);
                }, 0);
            }
        }
    }

    var onPointerUp = function (evt, pickInfo) {
        //ball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 1 });
        if (startingPoint) {
            camera.attachControl(canvas, true);
            startingPoint = null;
            // Stop increasing the strength counter. 
  			scene.unregisterBeforeRender(counterUp);

  			ball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 2 });
			ball.applyImpulse(new BABYLON.Vector3(20, 20, 0), ball.getAbsolutePosition());
  			// Register a function that will run before each render call 
  			scene.registerBeforeRender(function ballCheck() {
    			if (basketball.intersectsMesh(ground, false)) {
      				// The ball intersects with the floor, stop checking its position.  
      				scene.unregisterBeforeRender(ballCheck);
      				// Let the ball roll around for 1.5 seconds before resetting it. 
      				setTimeout(function() {
        				ball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 0 });
        				ball.position.x = -20;
    					ball.position.y = +20;
    					ball.position.z = 0;
      				}, 1500);
    			}
  			});
  			strengthCounter = 5;
           	return;
        }
    }

    var onPointerMove = function (evt) {
        if (!startingPoint) {
            return;
        }

        var current = getGroundPosition(evt);

        if (!current) {
            return;
        }

        var diff = current.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);

        startingPoint = current;

    }

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);

    scene.onDispose = function () {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
    }*/

    //var followCamera = new BABYLON.FollowCamera("followCamera", ball.position, scene);
	//followCamera.radius = 5; // How far from the object should the camera be.
	//followCamera.heightOffset = 1; // How high above the object should it be.
	//followCamera.rotationOffset = 180; // The camera's angle. here - from behind.
	//followCamera.cameraAcceleration = 0.5 // Acceleration of the camera.
	//followCamera.maxCameraSpeed = 20; // The camera's max speed.

	//followCamera.viewport = new BABYLON.Viewport (0.0, 0.0, 0.3, 0.3);

	//scene.activeCameras.push(followCamera);

    //Events
    var strengthCounter = 5;
    var flag = false;
    //var reset = false;

	var counterUp = function() {
  		strengthCounter += 0.5;
	}
	
	// This function will be called on pointer-down events.
	scene.onPointerDown = function(evt, pickInfo) {
  		// Start increasing the strength counter.
  		if(pickInfo.pickedMesh == ball){
  			flag = true;
  			scene.registerBeforeRender(counterUp);
  			setTimeout(function () {
            	camera.detachControl(canvas);
        	}, 0);
  		}
	}
	
	// This function will be called on pointer-up events.
	scene.onPointerUp = function(evt, pickInfo) {
		if(flag){
			flag = false;
			// Create a very small simple mesh.
			var followObject = BABYLON.Mesh.CreateBox("followObject", 0.001, scene);
			// Set its position to be the same as the ball's position.
			followObject.position = ball.position;
			//followCamera.target = followObject;
			camera.attachControl(canvas, true);
			camera.target = followObject;
			// Calculate the direction using the picked point and the ball's position. 
    		var direction = pickInfo.pickedPoint.subtract(ball.getAbsolutePosition());
    		// To be able to apply scaling correctly, normalization is required.
    		direction = direction.normalize();
    		// Give it a bit more power (scale the normalized direction).
    		var impulse = direction.scale(Math.min(strengthCounter, 50));
    		// Apply the impulse (and throw the ball).
    		ball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 0.9 });
    		ball.applyImpulse(impulse, ball.getAbsolutePosition());
  			scene.registerBeforeRender(function ballCheck() {
    			if ( ball.intersectsMesh(floor, false) ) {
                    scene.unregisterBeforeRender(ballCheck);
                    //bounceSound.play();
      				// The ball intersects with the floor, stop checking its position. 
      				// Let the ball roll around for 1.5 seconds before resetting it. 
      				setTimeout(function() {
                        clear()
      				}, 1500);
    			}
                if( ball.intersectsMesh(hitbox, false) ){
                	var scoreTexture = new BABYLON.DynamicTexture("scoreTexture", 512, scene, true);
    				var scoreboard = BABYLON.Mesh.CreatePlane("scoreboard", 6, scene);
    				// Position the scoreboard after the lane.
    				scoreboard.position.y = 40;
    				scoreboard.scaling.x = 2;
    				scoreboard.rotation.y = Math.PI / 2;
    				// Create a material for the scoreboard.
    				scoreboard.material = new BABYLON.StandardMaterial("scoreboardMat", scene);
    				// Set the diffuse texture to be the dynamic texture.
    				scoreboard.material.diffuseTexture = scoreTexture;
    				//scoreboard.material.diffuseTexture.vScale = 1;

                    // Clear the canvas. 
                    scoreTexture.clear();
                    scoreTexture.drawText("You Win!!!", 60, 200,
      					"bold 72px Arial", "white", "black");
                    setTimeout(function() {
                        scoreboard.dispose();
                    }, 1500);
                }
  			});
  			strengthCounter = 5;
		}
	}

    /*sounds Effects

    var bounceSound = new BABYLON.Sound("bounce", "./audio/bounce.mp3", scene, null, {
        loop: false,
        autoplay: false
    });

    var bounceWallSound = new BABYLON.Sound("bounceWall", "./audio/bounceWall.mp3", scene, null, {
        loop: false,
        autoplay: false
    });
    //bounceSound.attachToMesh(floor);

    var muzak =  new BABYLON.Sound("muzak", "./audio/muzak.lite.mp3", scene, null, {
        loop: true,
        autoplay: true
    });

    muzak.setVolume(0.05);*/

    function clear() {
        ball.dispose();
        ball = BABYLON.Mesh.CreateSphere("ball", 10.0, 6.0, scene);
        ball.position.x = -20; //-20
        ball.position.y = +20; //+20

        //creation of textured ball
        var materialBall = new BABYLON.StandardMaterial("textureBall", scene);
        materialBall.diffuseTexture = new BABYLON.Texture("./textures/bBall.png", scene);
        materialBall.diffuseColor = new BABYLON.Color3(2, 2, 2);
        materialBall.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

        //Apply the materials to meshes
        ball.material = materialBall;

        shadowGenerator.getShadowMap().renderList.push(ball);
        var followObject = BABYLON.Mesh.CreateBox("followObject", 0.001, scene);
		// Set its position to be the same as the ball's position.
		followObject.position = ball.position;
		camera.target = followObject;
    }

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
        trigger: BABYLON.ActionManager.OnKeyDownTrigger,
        parameter: "r"
    }, clear));

    function win() {
        ball.dispose();
        ball = BABYLON.Mesh.CreateSphere("ball", 10.0, 6.0, scene);
        ball.position.x = xPosition; //-20
        ball.position.y = yPosition+20; //+20

        //creation of textured ball
        var materialBall = new BABYLON.StandardMaterial("textureBall", scene);
        materialBall.diffuseTexture = new BABYLON.Texture("./textures/bBall.png", scene);
        materialBall.diffuseColor = new BABYLON.Color3(2, 2, 2);
        materialBall.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

        //Apply the materials to meshes
        ball.material = materialBall;

        ball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 0.9 });

        shadowGenerator.getShadowMap().renderList.push(ball);
        var followObject = BABYLON.Mesh.CreateBox("followObject", 0.001, scene);
		// Set its position to be the same as the ball's position.
		followObject.position = ball.position;
		camera.target = followObject;
    }

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({
        trigger: BABYLON.ActionManager.OnKeyDownTrigger,
        parameter: "w"
    }, win));

    return scene;
}