class Simulator {
    constructor() {
        this.pause = true;

        this.terrain = new Terrain();
        this.terrain.generate();

        this.landers     = [];
        this.displayType = {};
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
                this.landers[i].draw(drawer, 'controler')
        }
    }

    start() {
        this.pause = false;
    }
    pause() {
        this.pause = true;
    }



    displays(type, id = -1) {
        this.displayType = { type : type, id : id }; // type = 'vessel' or 'brain'
    }



    /** Creates a Random population of Landers */
    newPopulation(populationSize, controlersClass, controlersArgs) {
        this.landers = [];

        for (let i = 0; i < populationSize; i++) {
            let controler;
            if (controlersArgs[i] != undefined)
                controler = new controlersClass[i](...controlersArgs[i]);
            else
                controler = new controlersClass[i]();
            this.landers.push(new Lander(this.terrain, controler));
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

            let controler;
            if (d.controlerName == 'NeuralNetworkControler') {
                controler = new NeuralNetworkControler(
                    d.controler.input_nodes,
                    d.controler.hidden_nodes,
                    d.controler.output_nodes
                );
            }
            else if (d.controlerName == 'HumanControler') {
                controler = new HumanControler();
            }

            let lander = new Lander(this.terrain, controler);

            lander.initializeFromJSON(d);
            this.landers.push(lander);
        }
    }

    /** @return a String representation of the current Lander population */
    savePopulation() {
        let res = [ ];
        for (let i = 0; i < this.landers.length; i++)
            res.push(this.landers[i].stringify());
        return JSON.stringify(res);
    }
}
