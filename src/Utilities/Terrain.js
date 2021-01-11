class Terrain {
    /** Class of the Terrain constructor */
    constructor(precision) {
        this.points = [];

        let pl = _pSimulationInstance.config.engine.plotter;
        this.size = new Vector(pl.scale.x, pl.scale.y);

        this.precision = precision; // 300;
        this.noiseVal = 0;


        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push(new Vector(
                Math.round(width  * random()),
                Math.round(height * random()),
                random(2, 6)
            ));
        }
    }

    /** Generate a new terrain */
    generate() {
        for (let i = 0; i < this.precision; i++) {
            this.points.push(new Vector(
                2 * this.size.x / (this.precision - 1) * i - this.size.x,
                this.terrainHeight(i)
            ));
        }
    }

    /** @return the height of each index */
    terrainHeight(index) {
        let noise_scalar = this.precision * 0.12;
        let noiseHeightRange = this.size.y / 6;

        return noiseHeightRange * noise(index / noise_scalar);
    }


    /** @return an Array representation of this terrain as [x1, y1, ...] */
    describe() {
        let rep = [];
        for (let i = 0; i < this.points.length; i++)
            rep.push(this.points[i].x, this.points[i].y);
        return rep;
    }


    /** Draws the terrain */
    draw(drawer) {
        this.noiseVal += 0.01;

        // Stars
        for (let i = 0; i < this.stars.length; i++) {
            noStroke();
            fill(`rgba(50, 200, 255, ${noise(this.noiseVal + i)})`);
            circle(this.stars[i].x, this.stars[i].y, this.stars[i].z);
        }


        drawer.beginShape();
            drawer.vertex(-this.size.x, -0.6*this.size.y);
            for (let i = 0; i < this.points.length; i++) {
                // Terrain Ground
                drawer
                    .fill(30, 30, 30, 1)
                    .stroke(255, 255, 255, 0.5)
                    .vertex(this.points[i].x, this.points[i].y);

                // Terrain Surface Ellipses
                // drawer
                //     .fill(255, 255, 255, 0.2)
                //     .stroke(255, 255, 255, 0.8)
                //     .circle(this.points[i].x, this.points[i].y, 5, true);
            }
            drawer.vertex(this.size.x, -0.6*this.size.y);
        drawer.endShape(CLOSE);
    }
}
