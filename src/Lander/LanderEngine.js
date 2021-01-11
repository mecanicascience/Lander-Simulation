class LanderEngine {
    /** The engine of each lander */
    constructor() {
        this.thrustAmount = 0; // 9.8*5;
        this.thrustAngle  = 0; // in rad

        this.deltaFlame = 0;
    }

    /**
    * Creates a new engine
    * @param thrustAngle The default thrust angle
    * @param thrustAmount The default thrust amount
    */
    initialize(thrustAngle, thrustAmount) {
        this.thrustAngle  = thrustAngle;
        this.thrustAmount = thrustAmount;
    }

    /** @return the thrust as a force based on its angle and magnitude */
    getThrustForce() {
        let thrust = new Vector(0, this.thrustAmount);

        // Rotates thrust by the thrustAngle along the Z axis in the (XY) plane
        return new Vector(
            thrust.x * Math.cos(this.thrustAngle) - thrust.y * Math.sin(this.thrustAngle),
            thrust.x * Math.sin(this.thrustAngle) + thrust.y * Math.cos(this.thrustAngle),
            0, 'rgb(70, 70, 200)'
        );
    }

    /**
    * Rotate the engine
    * @param dTheta The angle of rotation (in radians)
    */
    rotate(dTheta) {
        let thetaRange = Math.PI / 4 / 10;

        if (dTheta < -thetaRange)
            dTheta = -thetaRange;
        if (dTheta > thetaRange)
            dTheta = thetaRange;

        this.thrustAngle += dTheta;
    }

    /**
    * Adds thrust to the engine
    * @param dThrust The delta of thrust
    */
    thrust(dThrust) {
        let thrustRange = 0.8;

        if (dThrust < -thrustRange)
            dThrust = -thrustRange;
        if (dThrust > thrustRange)
            dThrust = thrustRange;

        this.thrustAmount += dThrust;

        if (this.thrustAmount < 0)
            this.thrustAmount = 0;
    }


    /** Draws the engine and its flame */
    draw(drawer) {
        this.deltaFlame += 0.1;
        let flameSize = 2*Math.sqrt(this.thrustAmount / 2);

        drawer
            .scale(0.3)

            // Motor Engine
            .stroke(255, 255, 255, 1)
            .fill(255, 255, 255, 0.5)
            .bezier(0, 0, -5, 0, -6, -10, -6, -10)
            .bezier(0, 0,  5, 0,  6, -10,  6, -10)

            // Motor Engine Interior
            .noStroke()
            .beginShape()
                .vertex(0, 0)
                .vertex(-6, -10)
                .vertex( 6, -10)
            .endShape(CLOSE)

            // Flame
            .noStroke()
            .push()
                .translate(0, -10)
                // Big flame
                .fill(30, 30, 200, 0.6)
                .beginShape()
                    .vertex(-4, 0)
                    .vertex( 4, 0)
                    .vertex( 0, -flameSize*(2+2*noise(this.deltaFlame)))
                .endShape(CLOSE)

                // Smaller flame
                .fill(120, 120, 240, 0.6)
                .beginShape()
                    .vertex(-2, 0)
                    .vertex( 2, 0)
                    .vertex( 0, -(flameSize / 2)*(2+2*noise(this.deltaFlame + 0.4)))
                .endShape(CLOSE)
            .pop();
    }
}
