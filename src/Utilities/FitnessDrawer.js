class FitnessDrawer {
    constructor(simulator) {
        this.simulator = simulator;
    }

    draw(drawer) {
        let stats = this.simulator.fitnessStats;
        let generationCount = this.simulator.neuralNetworkGeneration;

        let s = new Vector(
            (_pSimulationInstance.config.engine.plotter.scale.x) * 0.8,
            (_pSimulationInstance.config.engine.plotter.scale.y / 2) * 0.8
        );
        let o = _pSimulationInstance.config.engine.plotter.offset;
        let deltaSpace = new Vector(0.3 * s.x, 0.8 * s.y);

        let globalMax = -Infinity;
        for (let i = 0; i < stats.length; i++)
            if (stats[i].max > globalMax)
                globalMax = stats[i].max;
        globalMax = Math.round(globalMax);

        // Draw Graph
        let fac = 0.05;
        let sx = 2*s.x/(globalMax*fac);
        let sy = 2*s.y/(globalMax*fac);

        drawer
            .push()
            .translate(-s.x, o.y - s.y)
            .stroke(255)
            .strokeWeight(2)
            .line(0, 0, sx*(globalMax*fac), 0)
            .line(0, 0, 0, sy*(globalMax*fac));
        for (let i = 2; i < stats.length; i++) {
            let x = (i - 1) / (generationCount - 2) * sx*(globalMax*fac);
            drawer.line(x, -sy*(globalMax*fac)*0.01, x, sy*(globalMax*fac)*0.01);
        }

        // Draw Datas
        let oldPos = [];
        let xUnit = sx;
        let yUnit = sy;
        for (let i = 0; i < stats.length; i++) {
            let d = stats[i];
            let x = (i - 1) / (generationCount - 2) * sx*(globalMax*fac);
            let pos = [
                { x : x, y : d.max / globalMax * sy*(globalMax*fac) },
                { x : x, y : d.min / globalMax * sy*(globalMax*fac) },
                { x : x, y : d.moy / globalMax * sy*(globalMax*fac) }
            ];

            if (i > 1)
                drawer
                    .stroke(200, 70, 70) // max
                    .line(oldPos[0].x, oldPos[0].y, pos[0].x, pos[0].y)
                    .stroke(70, 70, 200) // min
                    .line(oldPos[1].x, oldPos[1].y, pos[1].x, pos[1].y)
                    .stroke(70, 200, 70) // moy
                    .line(oldPos[2].x, oldPos[2].y, pos[2].x, pos[2].y);

            oldPos = pos;
        }

        drawer.pop();
    }
}
