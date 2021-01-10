class Lander {
    constructor(terrain, controler) {
        this.terrain = terrain;
        this.engine    = new LanderEngine();
        this.controler = controler;

        this.collided = false;
        this.DEBUG = false;
    }

    initialize(r0, v0, thrustAngle0, thrustAmount0) {
        this.m = 5;
        this.r0 = r0;
        this.v0 = v0;
        this.thrustAngle0 = thrustAngle0;
        this.thrustAmount0 = thrustAmount0;

        this.pos = new Vector(r0.x, r0.y);
        this.vel = new Vector(v0.x, v0.y);
        this.acc = new Vector(   0,    0);

        this.engine.initialize(thrustAngle0, thrustAmount0);

        this.forces = [];
        this.rigidbody = [
            new Vector(-1.3, 5),
            new Vector( 1.3, 5),
            new Vector( 1.3, -2.2),
            new Vector(-1.3, -2.2)
        ];

        this.controler.initialize(this);
    }

    initializeFromJSON(d) {
        this.initialize(
            new Vector(d.r0.x, d.r0.y),
            new Vector(d.v0.x, d.v0.y),
            d.thrustAngle0,
            d.thrustAmount0
        );
        this.controler.initializeFromJSON(this, d.controler);
    }



    update(dt) {
        if (this.collided)
            return;

        // Using explicit Euler method
        this.pos.add((this.vel.copy()).mult(dt));
        this.vel.add((this.acc.copy()).mult(dt));
        this.acc.set(0, 0);

        // Call the controller
        this.controler.update(dt);

        // Computes new acceleration by forces
        this.forces = this.calculateForces();
        let netForces = new Vector();
        for (let i = 0; i < this.forces.length; i++)
            netForces.add(this.forces[i]);
        this.acc.add(netForces.div(this.m));

        // Computes and react to collisions
        if (this.intersectWithBoundaries())
            this.collided = true;
    }


    draw(drawer, type) {
        if (type == 'controler') {
            this.controler.draw(drawer);
            return;
        }

        this.drawBody(drawer);

        if (this.DEBUG)
            this.drawDebug(drawer);
    }





    calculateForces() {
        let forces = [];

        // Weight
        let g = 9.81; /** @TODO Implement g = g(z) */
        forces.push(new Vector(0, -this.m * g, 0, 'rgb(200, 70, 70)'));

        // Thrust
        forces.push(this.engine.getThrustForce());

        return forces;
    }




    intersectWithBoundaries() {
        let angle = {
            cos : Math.cos(this.engine.thrustAngle),
            sin : Math.sin(this.engine.thrustAngle),
        };

        // Sides Walls intersection
        for (let j = 0; j < this.rigidbody.length; j++) {
            let pos = {
                x : angle.cos * this.rigidbody[j].x - angle.sin * this.rigidbody[j].y + this.pos.x,
                y : angle.sin * this.rigidbody[j].x + angle.cos * this.rigidbody[j].y + this.pos.y
            };
            if (pos.x < -100 || pos.x > 100)
                return true;
        }

        // Terrain intersection
        for (let i = 0; i < this.terrain.points.length - 1; i++) {
            for (let j = 0; j < this.rigidbody.length; j++) {
                let pos = {
                    x : angle.cos * this.rigidbody[j].x - angle.sin * this.rigidbody[j].y + this.pos.x,
                    y : angle.sin * this.rigidbody[j].x + angle.cos * this.rigidbody[j].y + this.pos.y
                };
                let p1 = this.terrain.points[i];
                let p2 = this.terrain.points[i+1];

                if (pos.x < p1.x || pos.x > p2.x)
                    continue;

                let x = (pos.x - p1.x) / (p2.x - p1.x);
                if (pos.y <= x * (p2.y - p1.y) + p1.y)
                    return true;
            }
        }
        return false;
    }




    drawBody(drawer) {
        drawer
            .stroke(255, 255, 255, 0.7)
            .fill  (255, 255, 255, 0.5)
            .push()
                .translate(this.pos.x, this.pos.y)
                .rotate(this.engine.thrustAngle)
                .scale(0.7)

                // Lander
                .beginShape()
                    .vertex(-2, 0)
                    .vertex(-3, 4)
                    .vertex(-2, 7)
                    .vertex( 2, 7)
                    .vertex( 3, 4)
                    .vertex( 2, 0)
                .endShape()

                // LanderEngine
                this.engine.draw(drawer);
        drawer.pop();
    }

    drawDebug(drawer) {
        // Draw forces
        for (let i = 0; i < this.forces.length; i++)
            this.forces[i].div(5).draw(this.pos);

        // Draw rigidbody
        drawer.push()
            .translate(this.pos.x, this.pos.y)
            .rotate(this.engine.thrustAngle);
        for (let i = 0; i < this.rigidbody.length; i++) {
            let e = this.rigidbody[i+1];
            if (e == undefined)
                e = this.rigidbody[0];

            drawer
                .noFill()
                .stroke(70, 200, 70)
                .strokeWeight(3)
                .line(this.rigidbody[i].x, this.rigidbody[i].y, e.x, e.y)
        }
        drawer.pop();


        // Draw collision projection on the surface
        let angle = {
            cos : Math.cos(this.engine.thrustAngle),
            sin : Math.sin(this.engine.thrustAngle),
        };

        for (let i = 0; i < this.terrain.points.length - 1; i++) {
            for (let j = 0; j < this.rigidbody.length; j++) {
                let pos = {
                    x : angle.cos * this.rigidbody[j].x - angle.sin * this.rigidbody[j].y + this.pos.x,
                    y : angle.sin * this.rigidbody[j].x + angle.cos * this.rigidbody[j].y + this.pos.y
                };
                let p1 = this.terrain.points[i];
                let p2 = this.terrain.points[i+1];

                if (pos.x < p1.x || pos.x > p2.x)
                    continue;

                let x = (pos.x - p1.x) / (p2.x - p1.x);
                drawer
                    .fill(255, 0, 0)
                    .ellipse(pos.x, x * (p2.y - p1.y) + p1.y, 5, 5, true);
            }
        }


        // PURE DEBUG
        drawer
            .noStroke()
            .fill(255, 0, 0, 0.6)
            .ellipse(this.pos.x, this.pos.y, 5, 5, true);
    }





    isUnder(mx, my, leftPoint, rightPoint) {
        if (mx < leftPoint.x || mx > rightPoint.x) // between the two x positions
            return false;
        if(my < mx*(rightPoint.y - leftPoint.y)/(rightPoint.x - leftPoint.x) + leftPoint.y) // under the line
            return true;
    }

    stringify() {
        return JSON.stringify({
            m : this.m,
            r0 : this.r0,
            v0 : this.v0,
            thrustAngle0  : this.thrustAngle0,
            thrustAmount0 : this.thrustAmount0,
            controlerName : this.controler.constructor.name,
            controler : this.controler.stringify()
        });
    }
}
