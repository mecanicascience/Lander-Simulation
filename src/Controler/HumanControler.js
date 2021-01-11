class HumanControler extends Controler {
    /** For players landers controlled with keyboard */
    constructor() {
        super();
    }

    /**
    * Initialize HumanControler
    * @param lander The attached lander
    */
    initialize(lander) {
        this.lander = lander;
    }

    /** Update vessel thrust based on keys pressed */
    update(dt) {
        let omega = 5;
        let omethrust = 50;

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
