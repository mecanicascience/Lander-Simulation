class Terrain {
    constructor() {
        this.points = [];

        let pl = _pSimulationInstance.config.engine.plotter;
        this.size = new Vector(pl.scale.x, pl.scale.y);

        this.precision = 100;
    }

    generate() {
        for (let i = 0; i < this.precision; i++) {
            this.points.push(new Vector(
                2 * this.size.x / (this.precision - 1) * i - this.size.x,
                this.terrainHeight(i)
            ));
        }
    }

    terrainHeight(index) {
        let noise_scalar = 6;
        let noiseHeightRange = this.size.y / 6;

        return noiseHeightRange * noise(index / noise_scalar);
    }



    draw(drawer) {
        drawer.beginShape();
            drawer.vertex(-this.size.x, -0.6*this.size.y);
            for (let i = 0; i < this.points.length; i++) {
                // Terrain Ground
                drawer
                    .fill(255, 255, 255, 0.2)
                    .stroke(255, 255, 255, 0.5)
                    .vertex(this.points[i].x, this.points[i].y);

                // Terrain Surface
                drawer
                    .fill(255, 255, 255, 0.2)
                    .stroke(255, 255, 255, 0.8)
                    .circle(this.points[i].x, this.points[i].y, 5, true);
            }
            drawer.vertex(this.size.x, -0.6*this.size.y);
        drawer.endShape(CLOSE);
    }
}
