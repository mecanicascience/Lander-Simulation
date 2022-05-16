class Controler {
    /** Abstract Controler class. Please do not call directly */
    constructor(simulator) {
        this.simulator = simulator;
    }

    /**
    * Updates the controler
    * @param dt The delta time (in seconds)
    */
    update(dt) { }
    /**
    * Draws the controler to the screen
    * @param drawer The drawing instance object
    */
    draw(drawer) { }

    /**
    * Initialize the controler
    * @param lander The attached lander
    * @param args Optional arguments
    */
    initialize(lander, args) { }

    /**
    * Initialize the controler from JSON datas
    * @param lander The attached lander to the Controler
    * @param data Optional data for the Controler
    */
    initializeFromJSON(lander, data) {
        this.initialize(lander);
    }

    /** @return an object representation of this object */
    stringify() { return {} }
}
