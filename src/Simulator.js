class Simulator {
    constructor() {
        this.pause = true;

        this.terrain = new Terrain();
        this.terrain.generate();

        this.landers     = [];
        this.displayType = {}
    }

    update(dt) {
        for (let i = 0; i < this.landers.length; i++)
             this.landers[i].update(dt);
    }

    draw(drawer) {
        if (this.pause)
            return;

        if (this.displayType.type == 'vessel')
            this.terrain.draw(drawer);

        for (let i = 0; i < this.landers.length; i++) {
            if (this.displayType.type == 'vessel')
                this.landers[i].draw(drawer);
            else if (i == this.displayType.id)
                this.landers[i].draw(drawer, 'brain')
        }
    }

    start() {
        this.pause = false;
    }
    stop() {
        this.pause = true;
    }



    displays(type, id = -1) {
        this.displayType = { type : type, id : id }; // type = 'vessel' or 'brain'
    }



    /** Creates a Random population of Landers */
    newPopulation(populationSize, neuralDimensions) {
        this.landers = [];

        if (neuralDimensions == undefined) {
            neuralDimensions = Array(populationSize).fill({
                input_nodes  : 20,
                hidden_nodes : 20,
                output_nodes : 20
            });
        }

        for (let i = 0; i < populationSize; i++) {
            let brain = new LanderBrain(
                neuralDimensions[i].input_nodes,
                neuralDimensions[i].hidden_nodes,
                neuralDimensions[i].output_nodes
            );
            this.landers.push(new Lander(this.terrain, brain));
        }

        this.landers.forEach((item, i) => {
            item.initialize(
                new Vector(-70, 70),
                new Vector(random(0, 60)-30, random(0, 60)-30),
                2*Math.PI * random(0, 1),
                random(0, 100)
            )
        });
    }

    /** Loads a population of Neural Networks from JSON string */
    loadPopulation(pop) {
        this.landers = [];

        let datas = JSON.parse(pop);
        for (let i = 0; i < datas.length; i++) {
            let d = JSON.parse(datas[i]);
            let brain = new LanderBrain(
                d.brain.input_nodes,
                d.brain.hidden_nodes,
                d.brain.output_nodes
            );
            let lander = new Lander(this.terrain, brain);

            lander.initializeFromJSON(d);
            this.landers.push(lander);
        }
    }

    /** @return a String representation of the current Lander population */
    savePopulation() {
        let res = [];
        for (let i = 0; i < this.landers.length; i++)
            res.push(this.landers[i].stringify());
        return JSON.stringify(res);
    }
}
