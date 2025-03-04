class Cube{
    constructor(){
        this.type="cube";
        // this.position=[0.0, 0.0, 0.0];
        this.color=[1.0,1.0,1.0,1.0];
        // this.size=5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum=-2;
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // gl.uniform1f(u_Size, size);
        // Draw
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Front of cube
        drawTriangle3DUVNormal( [0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0], 
                          [0,0, 1,1, 1,0],
                          [0,0,-1, 0,0,-1, 0,0,-1]);

        // drawTriangle3D( [0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0]);
        drawTriangle3DUVNormal( [0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0], 
                          [0,0, 0,1, 1,1],
                          [0,0,-1, 0,0,-1, 0,0,-1]);

        // gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        // back of cube
        drawTriangle3DUVNormal( [0.0,0.0,1.0,  1.0,1.0,1.0,  1.0,0.0,1.0], 
                          [0,0, 1,1, 1,0],
                          [0,0,1, 0,0,1, 0,0,1]);

        drawTriangle3DUVNormal( [0.0,0.0,1.0,  0.0,1.0,1.0,  1.0,1.0,1.0], 
                          [0,0, 0,1, 1,1],
                          [0,0,1, 0,0,1, 0,0,1]);

        
        // gl.drawArrays(gl.POINTS, 0, 1);

        // Top of cube
        drawTriangle3DUVNormal( [0.0,1.0,0.0,  0.0,1.0,1.0,  1.0,1.0,1.0], 
                          [0,1, 0,0, 1,0],
                          [0,1,0, 0,1,0, 0,1,0]);

        drawTriangle3DUVNormal( [0.0,1.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0], 
                          [0,1, 1,0, 1,1],
                          [0,1,0, 0,1,0, 0,1,0]);

        // Bottom of cube
        drawTriangle3DUVNormal( [0.0,0.0,0.0,  0.0,0.0,1.0,  1.0,0.0,1.0], 
                          [0,0, 0,1, 1,1],
                          [0,-1,0, 0,-1,0, 0,-1,0]);

        drawTriangle3DUVNormal( [0.0,0.0,0.0,  1.0,0.0,1.0,  1.0,0.0,0.0], 
                          [0,0, 1,1, 1,0],
                          [0,-1,0, 0,-1,0, 0,-1,0]);

        // right of cube
        drawTriangle3DUVNormal( [1.0,0.0,0.0, 1.0,1.0,1.0,  1.0,1.0,0.0], 
                          [0,0, 1,1, 0,1],
                          [1,0,0, 1,0,0, 1,0,0]);

        drawTriangle3DUVNormal( [1.0,0.0,0.0,  1.0,0.0,1.0,  1.0,1.0,1.0], 
                          [0,0, 1,0, 1,1],
                          [1,0,0, 1,0,0, 1,0,0]);

        // left of cube
        drawTriangle3DUVNormal( [0.0,0.0,0.0, 0.0,1.0,1.0,  0.0,1.0,0.0], 
                          [1,0, 0,1, 1,1],
                          [-1,0,0, -1,0,0, -1,0,0]);

        drawTriangle3DUVNormal( [0.0,0.0,0.0,  0.0,0.0,1.0,  0.0,1.0,1.0], 
                          [1,0, 0,0, 0,1],
                          [-1,0,0, -1,0,0, -1,0,0]);
    }


    renderFast() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // gl.uniform1f(u_Size, size);
        // Draw
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var allverts = [];
        var allUVs = [];
        // Front of cube
        allverts = allverts.concat([0,0,0,  1,1,0,  1,0,0]);
        allUVs = allUVs.concat([0,0, 1,1, 1,0]);

        allverts = allverts.concat([0,0,0,  0,1,0,  1,1,0]);
        allUVs = allUVs.concat([0,0, 1,1, 1,0]);

        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        // back of cube

        allverts = allverts.concat([0,0,1,  1,1,1,  1,0,1]);
        allUVs = allUVs.concat([0,0, 1,1, 1,0]);

        allverts = allverts.concat([0,0,1,  0,1,1,  1,1,1]);
        allUVs = allUVs.concat([0,0, 0,1, 1,1]);
   
        
        // gl.drawArrays(gl.POINTS, 0, 1);

        // Top of cube
        allverts = allverts.concat([0,1,0,  0,1,1,  1,1,1]);
        allUVs = allUVs.concat([0,1, 0,0, 1,0]);

        allverts = allverts.concat([0,1,0,  1,1,1,  1,1,0]);
        allUVs = allUVs.concat([0,1, 1,0, 1,1]);
  
        // Bottom of cube
        allverts = allverts.concat([0,0,0,  0,0,1,  1,0,1]);
        allUVs = allUVs.concat([0,0, 0,1, 1,1]);

        allverts = allverts.concat([0,0,0,  1,0,1,  1,0,0]);
        allUVs = allUVs.concat([0,0, 1,1, 1,0]);
  

        // right of cube
        allverts = allverts.concat([1,0,0, 1,1,1,  1,1,0]);
        allUVs = allUVs.concat([0,0, 1,1, 0,1]);

        allverts = allverts.concat([1,0,0,  1,0,1,  1,1,1]);
        allUVs = allUVs.concat([0,0, 1,0, 1,1]);
   

        // left of cube
        allverts = allverts.concat([0,0,0, 0,1,1,  0,1,0]);
        allUVs = allUVs.concat([1,0, 0,1, 1,1]);

        allverts = allverts.concat([0,0,0,  0,0,1,  0,1,1]);
        allUVs = allUVs.concat([1,0, 0,0, 0,1]);

        // console.log("allverts: ", allverts);
        //console.log("🟢 RenderFast: Allverts Length:", allverts.length, " Expected:", allverts.length / 9, "Triangles");
        //console.log("🔹 Vertices:", allverts);
        drawTriangle3DUV(allverts, allUVs);
    }
}