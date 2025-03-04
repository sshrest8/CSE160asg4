class Camera{
    constructor(){
        this.fov=90;
        this.eye=new Vector3([0,2,1]);
        this.at=new Vector3([0,0,-100]);
        this.up=new Vector3([0,1,0]);
        this.speed=0.2;
        this.gravity = -0.001;
        this.jumpStrength = 0.1;
        this.velocity = new Vector3([0, this.gravity, 0]);
        this.isGrounded = false;
        this.isFalling = false;
        this.selectedBlock = 1;
        // this.lastX = null;
        // this.lastY = null;
    }
    moveForward() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        f.elements[1] *= 0.1;
        // console.log(` move forward: (${f.elements[0]}, ${f.elements[1]}, ${f.elements[2]})`);
            
        if (!this.checkCollision(f)) {
            this.at.add(f);
            this.eye.add(f);
            this.checkGroundStatus();
            // console.log(`move forward: (${f.elements[0]}, ${f.elements[1]}, ${f.elements[2]})`);
        } else {
                console.log(`Movement Blocked Collision detected.`);
        }
    }

    moveBackwards() {
        var b = new Vector3();
        b.set(this.eye);    
        b.sub(this.at);
        b.normalize();
        b.mul(this.speed);
        b.elements[1] = 0;
        if (!this.checkCollision(b)) {
            this.at.add(b);
            this.eye.add(b);
        }
    }

    moveLeft() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var s = new Vector3();
        s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);
        if (!this.checkCollision(s)) {
            this.at.add(s);
            this.eye.add(s);
        }
        
    }

    moveRight() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var s = new Vector3();
        s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);
        // console.log("!this.checkCollision(s): ", !this.checkCollision(s))
        if (!this.checkCollision(s)) {
            this.at.add(s);
            this.eye.add(s);
        }
        
    }

    panLeft(degrees) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(degrees, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let fPrime = rotationMatrix.multiplyVector3(f);
        this.at = fPrime.add(this.eye);
    }

    panRight(degrees) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(-degrees, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let fPrime = rotationMatrix.multiplyVector3(f);
        this.at = fPrime.add(this.eye);
        
    }

    panUp(degrees) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let right = Vector3.cross(f, this.up);
        right.normalize()

        var rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(degrees, right.elements[0], right.elements[1], right.elements[2]);
        let fPrime = rotationMatrix.multiplyVector3(f);
        if (Math.abs(fPrime.elements[1]) < this.fov) { 
            this.at = fPrime.add(this.eye);
        }
    }

    onMouseMove(event) {
        // if (this.lastX == null || this.lastY == null) {
        //     this.lastX = event.clientX;
        //     this.lastY = event.clientY;
        //     return;
        // }

        if (document.pointerLockElement !== canvas) {
            return;
        }

        let deltaX = event.movementX || 0;
        let deltaY = event.movementY || 0;

        this.panRight(deltaX * this.speed);
        this.panUp(-deltaY * this.speed);

        // let deltaX = event.clientX - this.lastX;
        // let deltaY = event.clientY - this.lastY;

        // this.lastX = event.clientX;
        // this.lastY = event.clientY;


        // let rotationSpeed = this.speed;
        // this.panRight(deltaX * rotationSpeed);
        // this.panUp(-deltaY * rotationSpeed);
    }

    checkCollision(dir) {
        let futurePosition = new Vector3(this.eye.elements);
        futurePosition.add(dir);

        let x = Math.floor(futurePosition.elements[0] + g_map.length / 2);
        let y = Math.floor(futurePosition.elements[1]);
        let z = Math.floor(futurePosition.elements[2] + g_map[0].length / 2);

        

        if (x < 0 || x >= g_map.length || z < 0 || z >= g_map[0].length) {
            this.isFalling = true;  // player is now falling
            return false;
        }

        let blockHeight = g_map[x][z] || 0;
        // let groundY = blockHeight + 1;
        


        if (y < blockHeight) {
            // console.log(` Collision Feet Y: ${y} < Block Height: ${y}`);
            return true;
        }



        // console.log("No collision detected");
        return false;
    }

    checkGroundStatus() {
        let x = Math.floor(this.eye.elements[0] + g_map.length / 2);
        let z = Math.floor(this.eye.elements[2] + g_map[0].length / 2);
    
        //  map boundaries
        if (x < 0 || x >= g_map.length || z < 0 || z >= g_map[0].length) {

            this.isFalling = true;
            this.isGrounded = false;
            return;
        }
    
        let blockHeight = g_map[x][z] || 0;
        let groundY = blockHeight + 1;
    
        if (this.eye.elements[1] <= groundY + 0.1) { 
            this.isGrounded = true;
            this.isFalling = false;
            this.eye.elements[1] = groundY;
        } else {

            this.isGrounded = false;
            this.isFalling = true;
        }
    }


    applyGravity() {
        if (this.isFalling) {
            this.isGrounded = false;
            this.velocity.elements[1] += this.gravity;
            this.eye.elements[1] += this.velocity.elements[1];
            this.at.elements[1] += this.velocity.elements[1];

            let x = Math.floor(this.eye.elements[0] + g_map.length / 2);
            let z = Math.floor(this.eye.elements[2] + g_map[0].length / 2);

            if (x >= 0 && x < g_map.length && z >= 0 && z < g_map[0].length) {
                let blockHeight = g_map[x][z] || 0;
                let groundY = blockHeight + 1;

                if (this.eye.elements[1] <= groundY) {
                    // console.log("Landed");
                    this.isGrounded = true;
                    this.isFalling = false;
                    this.velocity.elements[1] = 0;
                    this.eye.elements[1] = groundY;
                    // console.log("Landed");
                }
            }

            if (this.eye.elements[1] < -20) {
                console.log("player fell respawning");
                this.respawnPlayer();
            }
        }
    }


    update() {

        // this.eye.elements[1] += this.velocity.elements[1];
        // this.at.elements[1] += this.velocity.elements[1];

        // console.log("this.eye.elements[1]: ", this.eye.elements[1]);
        // console.log("this.at.elements[1]: ", this.at.elements[1]);

        this.applyGravity();

        // if (this.eye.elements[1] < -10) { // If player falls, reset position
        //     console.log("Player fell! Respawning...");
        //     this.respawnPlayer();
        // }
    }

    jump() {
        if (this.isGrounded) {
            console.log("Jumping");
            this.velocity.elements[1] = this.jumpStrength;
            this.isGrounded = false;
        } else {
            console.log("cant jump");
        }
    }

    respawnPlayer() {
        this.eye = new Vector3([0,2,1]);
        this.at = new Vector3([0, 0, -100]);
        this.velocity = new Vector3([0, 0, 0]);
        this.isFalling = false;
        this.isGrounded = false;
    }

    breakBlock() {
        let target = this.getBlockInFront();
        if (!target) {
            console.log("no block to break");
            return;
        }

        let { x, y, z } = target;

        if (g_map[x] && g_map[x][z] !== undefined && g_map[x][z] > 0) {
            console.log(`breaking block at (${x}, ${y}, ${z})`);
            g_map[x][z] = 0;
        } else {
            console.log("bo block to break");
        }
    }

    placeBlock() {
        let target = this.getBlockInFront(true);
        if (!target) {
            console.log("cant place block here");
            return;
        }

        let { x, y, z } = target;

        if (g_map[x] && g_map[x][z] !== undefined && g_map[x][z] === 0) {
            console.log(`placing block type ${this.selectedBlock} at (${x}, ${y}, ${z})`);
            g_map[x][z] = this.selectedBlock;
        } else {
            console.log(`block occupied at (${x}, ${y}, ${z})`);
            if (y + 1 < g_map.length && g_map[x][z] === 0) {
                console.log(`placing block above at (${x}, ${y + 1}, ${z})`);
                g_map[x][z] = this.selectedBlock;
            } else {
                console.log("cannot place block");
            }
        }
    }

    getBlockInFront(place = false) {
        let forward = new Vector3();
        forward.set(this.at);
        forward.sub(this.eye);
        forward.normalize();
        forward.mul(3);

        let blockX = Math.floor(this.eye.elements[0] + forward.elements[0] + g_map.length / 2);
        let blockY = Math.floor(this.eye.elements[1] + forward.elements[1]);
        let blockZ = Math.floor(this.eye.elements[2] + forward.elements[2] + g_map[0].length / 2);

        if (blockX < 0 || blockX >= g_map.length || blockZ < 0 || blockZ >= g_map[0].length) {
            return null;
        }

        if (place) {
            if (g_map[blockX][blockZ] !== 0) { 
                blockY += 1;
            }
        }

        return { x: blockX, y: blockY, z: blockZ };
    }


}