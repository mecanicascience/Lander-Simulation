class LanderControler {
    constructor(engine) {
        this.engine = engine;
    }

    update(dt) {
        let omega = 3;
        let omethrust = 30;


        if (keyIsDown(RIGHT_ARROW)) {
            this.engine.rotate(-omega * dt);
        }
        if (keyIsDown(LEFT_ARROW)) {
            this.engine.rotate(omega * dt);
        }

        if (keyIsDown(UP_ARROW)) {
            this.engine.thrust(omethrust * dt);
        }
        if (keyIsDown(DOWN_ARROW)) {
            this.engine.thrust(-omethrust * dt);
        }
    }

    draw(drawer) {

    }
}
