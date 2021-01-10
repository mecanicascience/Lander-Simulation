class Simulator {
    /** The main controler of the simulation */
    constructor() {
        this.pause = true;

        this.terrain = new Terrain();
        this.terrain.generate();

        this.landers     = [];
        this.displayType = {};
    }

    /** Updated simulation */
    update(dt) {
        for (let i = 0; i < this.landers.length; i++)
             this.landers[i].update(dt);
    }

    /** Draws every object to the screen */
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

    /** Starts the simulation */
    start() {this.pause = false; }
    /** Pause the simulation */
    pause() { this.pause = true; }


    /**
    * Changes the display mode
    * @param type Type of the display ('vessel' or 'controler')
    * @param id If type is 'controler', the id of the controler to be shown
    */
    displays(type, id = -1) {
        this.displayType = { type : type, id : id };
    }



    /**
    * Creates a Random population of Landers
    * @param populationSize Number of landers to be created
    * @param controlersClass An array of each controler of each vessel
    * @param controlersArgs An array for each lander of arrays of parameters
    */
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

    /**
    * Loads a population of Neural Networks from JSON string
    * @param pop The population as a String
    */
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
