class Simulator {
    /** The main controler of the simulation */
    constructor(initialConditions, terrainPrecision) {
        this.shouldDrawState = true;
        this.pauseState      = true;
        this.showDebugOutput = false;

        this.terrain = new Terrain(terrainPrecision);
        this.terrain.generate();

        this.landers     = [];
        this.displayType = {};

        this.initialConditions = initialConditions;

        // neuralNetwork' for generative neural network, 'player' for a player mode
        this.simulationMode = 'neuralNetwork';
        this.neuralNetworkGeneration = 0;

        this.gui = new OptionsGUI();
    }

    getInitialAngle() {
        return random(-Math.PI/4, Math.PI/4);
    }

    /** Initialize the controler after the other elements */
    initialize() {
        if (this.simulationMode == 'neuralNetwork') {
            let nnControlersCount = 0;
            for (let i = 0; i < this.landers.length; i++) {
                 if (this.landers[i].controler instanceof NeuralNetworkControler)
                    nnControlersCount += 1;
            }
            if (nnControlersCount <= 2)
                throw new Error('There must be at least 3 Vessels in neuralNetwork simulation mode.')
        }

        this.hasVesselCollided = false;
        this.neuralNetworkGeneration = 1;
        this.updateCallNumber = 0;
        this.resetGUI();
    }



    /** Updated simulation */
    update(dt) {
        _pSimulationInstance.config.engine.runner.simulationSpeed = Math.round(this.simSpeedLab());
        simulationSpeed = _pSimulationInstance.config.engine.runner.simulationSpeed;

        if (this.pauseState)
            return;

        let finished = true;
        for (let i = 0; i < this.landers.length; i++) {
             this.landers[i].update(dt);
             if (!this.landers[i].collided && this.landers[i].controler instanceof NeuralNetworkControler)
                finished = false;
        }

        // Go to next generation
        if (finished && this.simulationMode == 'neuralNetwork') {
            // Log
            this.debugLog(`== Generation ${this.neuralNetworkGeneration} data ==`);
            this.debugLog(`This generation had ${this.landers.length} different landers`
                + ` and called ${this.updateCallNumber} times the update() function.`);

            // Generate a new Terrain
            this.terrain.generate();

            // Generate new population
            let newPop = this.generateNextGeneration();
            this.landers = newPop;

            // Initialize each lander
            let a = this.getInitialAngle();
            this.landers.forEach((item, i) => {
                this.initialConditions[2] = a;
                item.initialize(...this.initialConditions);
                item.controler.initialize(item, 'copy', item.controler.nn);
            });

            // New generation
            this.neuralNetworkGeneration += 1;
            this.hasVesselCollided = false;
            this.updateCallNumber = 0;
            this.resetGUI();

            this.debugLog('=======================\n ');
        }
        else {
            this.updateCallNumber++;
        }
    }

    /** Resets the GUI */
    resetGUI() {
        this.gui.reset();
        this.gui.addLabel('\\text{Generation}', this.neuralNetworkGeneration + '');
        this.gui.addLabel('\\text{Update FPS}', Math.round(1/_pSimulationInstance.dtMoy) + '');
        this.simSpeedLab = this.gui.addInput('\\text{Sim speed}', simulationSpeed, 1, 20);
        this.gui.addList(
            '\\text{Mode}',
            { 'Simulation' : 0, 'Controler' : 1 },
            0, this.gui.datas.configuration,
            (val) => sim.displays(val ? 'controler' : 'vessel', 0)
        );
        this.gui.addInput(
            '\\text{Selected ID}', this.displayType.id, 0, this.landers.length - 1,
            this.gui.datas.configuration,
            (val) => sim.displays(this.displayType.type, Math.round(val))
        );
        this.gui.addCheckbox(
            '\\text{Pause}', false,
            (val) => val ? sim.pause() : sim.play()
        );

        this.gui.addCheckbox(
            '\\text{Graphisms}', this.shouldDrawState,
            (val) => sim.shouldDraw(val)
        );
        this.gui.addCheckbox(
            '\\text{Debug Logs}', this.showDebugOutput,
            (val) => sim.showDebugOutput = val
        );
    }


    /** @return the new Vessel population */
    generateNextGeneration() {
        let curPop = [];
        for (let i = 0; i < this.landers.length; i++) {
            if (this.landers[i].controler instanceof NeuralNetworkControler)
                curPop.push(this.landers[i]);
        }

        // Calculate fitness of the population
        let fitness = curPop.map(el => el.controler.estimateFitness());
        let fitnessDatas = { min : Math.min(...fitness), max : Math.max(...fitness) };


        // Normalize every fitness values to have their sum equals to 1
        let fitSum = fitness.reduce((a, b) => a + b, 0);
        this.debugLog(`Fitness datas :`);
        this.debugLog(`  - Maximum : ${Math.round(fitnessDatas.max)}`);
        this.debugLog(`  - Minimum : ${Math.round(fitnessDatas.min)}`);
        this.debugLog(`  - Total : ${Math.round(fitSum)}`);

        let fitnessNormalized = fitness.map(el => el / fitSum);
        this.debugLog(`Selected Vessel ${this.displayType.id} has a raw fitness of ${Math.round(fitness[this.displayType.id])}`
            + `, that counts as ${Math.round(fitnessNormalized[this.displayType.id]*100)}% of total fitness.`);



        // Sum each values as a probabilistic matingpool [x0, x0 + x1, x0 + x1 + x2, ...]
        let matingPoolProbas = [ fitnessNormalized[0] ];
        for (let i = 1; i < fitnessNormalized.length; i++)
            matingPoolProbas[i] = matingPoolProbas[i - 1] + fitnessNormalized[i];

        // Pick next population IDs from the mating pool
        let newPopIDs = []; // [firstParentIDPair1, secondParentIDPair1, ...]
        let selectedVesselChildren = 0;
        let selectedVesselChildrenPar = [];
        for (let i = 0; i < curPop.length * 2; i++) {
            let r = random(0, 1);
            let j = 0;
            while (r > matingPoolProbas[j])
                j++;

             // Parent can not reproduce themselfs alone
            if (i % 2 == 1 && newPopIDs[i - 1] == j)
                i -= 1;
            else {
                newPopIDs.push(j);
                if (newPopIDs[i - 1] == this.displayType.id)
                    selectedVesselChildrenPar.push(j);
                if (j == this.displayType.id)
                    selectedVesselChildren++;
            }
        }
        this.debugLog(`Selected Vessel ${this.displayType.id} will have ${selectedVesselChildren}/`
            + `${newPopIDs.length/2} (${Math.round(selectedVesselChildren/newPopIDs.length/2*100)}%) children with :`);
        for (let i = 0; i < selectedVesselChildrenPar.length; i++) {
            let id = selectedVesselChildrenPar[i];
            this.debugLog(`  - Vessel ${id} of fitness ${Math.round(fitness[id])}`
                + ` (${Math.round(fitnessNormalized[id]*100)}%)`);
        }

        // Generate and mutate new population
        let newPop = [];
        for (let i = 1; i < newPopIDs.length; i += 2) {
            let p1 = curPop[newPopIDs[i-1]];
            let p2 = curPop[newPopIDs[i]];

            // Crossover between p1 and p2
            let hidden_nodes = p1.hidden_nodes;
            let p3Controler = new NeuralNetworkControler(this, hidden_nodes);
            p3Controler.crossover(p1.controler, p2.controler, 'random-parent');

            // Mutate child
            p3Controler.mutate();

            newPop.push(new Lander(this, this.terrain, p3Controler));
        }

        return newPop;
    }




    /** Draws every object to the screen */
    draw(drawer) {
        if (!this.shouldDrawState)
            return;

        if (this.displayType.type == 'vessel')
            this.terrain.draw(drawer);

        for (let i = 0; i < this.landers.length; i++) {
            if (this.displayType.type == 'vessel')
                this.landers[i].draw(drawer, 'vessel', i == this.displayType.id);
            else if (i == this.displayType.id)
                this.landers[i].draw(drawer, 'controler', i == this.displayType.id)
        }
    }


    /** Pause the simulation */
    pause() { this.pauseState = true;  }

    /** Plays the simulation */
    play()  { this.pauseState = false; }

    /** Displays or hide the graphisms */
    shouldDraw(val) {
    	this.shouldDrawState = val;
    }

    debugLog(el) {
        if (this.showDebugOutput)
            console.log(el);
    }


    /**
    * Changes the display mode
    * @param type Type of the display ('vessel' or 'controler')
    * @param id If type is 'controler', the id of the controler to be shown
    */
    displays(type, id = 0) {
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
                controler = new controlersClass[i](this, ...controlersArgs[i]);
            else
                controler = new controlersClass[i](this);
            this.landers.push(new Lander(this, this.terrain, controler));
        }


        let a = this.getInitialAngle();
        this.landers.forEach((item, i) => {
            this.initialConditions[2] = a;
            item.initialize(...this.initialConditions);
            item.controler.initialize(item);
            this.initialize();
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
                    this, d.controler.hidden_nodes
                );
            }
            else if (d.controlerName == 'HumanControler') {
                controler = new HumanControler(this);
            }

            let lander = new Lander(this, this.terrain, controler);
            lander.initializeFromJSON(d);
            this.landers.push(lander);
            lander.controler.initializeFromJSON(this.landers[i], d.controler);
        }

        this.initialize();
    }

    /** @return a String representation of the current Lander population */
    savePopulation() {
        let res = [ ];
        for (let i = 0; i < this.landers.length; i++)
            res.push(this.landers[i].stringify());
        let jsonStr = JSON.stringify(res);

        let blob = new Blob([jsonStr], { type: 'text/plain' });
        let url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}
