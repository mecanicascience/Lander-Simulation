class Lander {
    constructor(terrain) {
        this.terrain = terrain;

        this.engine    = new LanderEngine();
        this.controler = new LanderControler(this.engine);
    }

    instanciate() {
        this.m = 5;

        this.pos = new Vector(-70, 70);
        this.vel = new Vector(15, 0);
        this.acc = new Vector(0, 0);
    }

    update(dt) {
        // Using explicit Euler method
        this.pos.add((this.vel.copy()).mult(dt));
        this.vel.add((this.acc.copy()).mult(dt));
        this.acc.set(0, 0);

        // Updates vessel controler
        this.controler.update(dt);

        // Computes new acceleration
        this.acc.add(this.calculateForces().div(this.m));
    }

    calculateForces() {
        let netForces = new Vector();

        // Weight
        let g = 9.81; /** @TODO Implement g = g(z) */
        netForces.add(new Vector(0, -this.m * g));

        // Thrust
        netForces.add(this.engine.getThrustForce());

        return netForces;
    }




    draw(drawer) {
        drawer
            .stroke(255, 255, 255, 1)
            .fill(255, 255, 255, 0.5)
            .circle(this.pos.x, this.pos.y, 10, true);

        this.engine.draw(drawer);
    }
}
