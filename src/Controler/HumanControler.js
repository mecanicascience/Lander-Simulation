class HumanControler extends Controler {
    constructor() {
        super();
    }

    initialize(lander) {
        this.lander = lander;
    }

    update(dt) {
        let omega = 3;
        let omethrust = 30;

        if (keyIsDown(RIGHT_ARROW)) {
            this.lander.engine.rotate(-omega * dt);
        }
        if (keyIsDown(LEFT_ARROW)) {
            this.lander.engine.rotate(omega * dt);
        }

        if (keyIsDown(UP_ARROW)) {
            this.lander.engine.thrust(omethrust * dt);
        }
        if (keyIsDown(DOWN_ARROW)) {
            this.lander.engine.thrust(-omethrust * dt);
        }
    }
}
