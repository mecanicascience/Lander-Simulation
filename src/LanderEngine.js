class LanderEngine {
    constructor() {
        this.thrustAmount = 9*5;
        this.thrustAngle  = 0; // in rad
    }

    getThrustForce() {
        let thrust = new Vector(0, this.thrustAmount);

        // Rotates thrust by the thrustAngle along the Z axis in the (XY) plane
        return new Vector(
            thrust.x * Math.cos(this.thrustAngle) - thrust.y * Math.sin(this.thrustAngle),
            thrust.x * Math.sin(this.thrustAngle) + thrust.y * Math.cos(this.thrustAngle)
        );
    }


    draw(drawer) {
        
    }
}
