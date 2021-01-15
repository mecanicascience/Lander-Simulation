class NeuroSimulator {
    constructor(terrainPrecision) {
        this.terrainPrecision = terrainPrecision;

        this.terrain = new Terrain(terrainPrecision);
        this.terrain.generate();

        this.showDebugOutput = true;
        this.shouldDrawState = true;
        this.pauseState      = true;

        this.globalInnovationNumber = 0;
        this.generationCount = 0;

        this.innovationsList = [];
        this.species         = [ { elements : [] }];
        this.landers         = [];

        this.speciesThreshold = 0.2; // 3
        this.survivorRate     = 0.8;

        this.landersTotal = 5;

        for (let i = 0; i < this.landersTotal; i++) {
            let lander = new Lander(this, this.terrain, new NEATControler(this));
            lander.id = i;
            this.landers.push(lander);
            this.species[0].elements.push(lander);
            lander.speciesIndex = 0;
        }

        this.displayType = { type : 'vessel', id : 0 };
        this.initialConditions = [
            new Vector(-70, 70), // r0
            new Vector( 20, 10), // v0
            0, // thrustAmount
            0  // thrustAngle
        ];


        // this.gui = new OptionsGUI();
        // this.resetGUI();
    }

    initialize() {
        // Landers
        this.landers.forEach((el, i) => {
            el.initialize(...sim.initialConditions);

            // Controlers
            el.controler.initialize(this.landers[i], 6 + this.terrainPrecision, 4);
        });

        this.updateCallNumber = 0;
        this.pauseState = false;
    }


    update(dt) {
        if (this.pauseState)
            return;

        this.landers.forEach(el => el.update(dt));

        if (this.landers.every(el => el.collided)) {
            this.debugLog(`== Generation ${this.generationCount} data ==`);
            this.debugLog(`This generation had ${this.landers.length} different landers`
                + ` and called ${this.updateCallNumber} times the update() function.`);

            // Generate a new Terrain
            this.terrain.generate();

            // Generate new initial conditions
            // this.initialConditions = [
            //     new Vector(-70, 70), // r0
            //     new Vector( 20, 10), // v0
            //     0, // thrustAmount
            //     0  // thrustAngle
            // ];

            // Evolve
            // Generate new species
            this.generateSpecies();
            // Kill the nth low performing landers
            this.killLowPerforming();
            // Kill the species with no lander in them
            this.killEstinctSpecies();
            // Reproduce landers
            this.reproduce();
            // Mutations
            this.mutate();

            // New generation
            this.landers.forEach(lander => {
                lander.initialize(...this.initialConditions);
            });

            this.generationCount += 1;
            this.updateCallNumber = 0;
            // this.resetGUI();
            noLoop();
            console.log(this.species);
            console.log(this.landers);

            this.debugLog('=======================\n ');
        }

        this.updateCallNumber++;
    }

    generateSpecies() {
        // Representant = new random owner in the specie, then clear specie (first el in specie is the owner)
        this.species.forEach((sp, i) => {
            let representant = sp.elements[Math.round(random(0, sp.elements.length - 1))];
            sp.elements.forEach(lander => {
                if (lander != representant)
                    lander.speciesIndex = null;
            });

            this.species[i].elements = [representant];
        });


        // Append vessel to compatible species
        this.landers.forEach(lander => {
            if (lander.speciesIndex != null)
                return;

            sim.species.forEach((sp, spIndex) => {
                let delta = sim.deltaSpecies(sp.elements[0], lander);
                if (delta < sim.speciesThreshold) {
                    sp.elements.push(lander);
                    lander.speciesIndex = spIndex;
                    return;
                }
            });
        });

        // If no specie, create a new one for each "out of a specie" lander
        this.landers.forEach(lander => {
            if (lander.speciesIndex == null) {
                sim.species.push({ elements : [ lander ] });
                lander.speciesIndex = sim.species.length - 1;
            }
        });

        // Computes landers score
        this.landers.forEach(lander => {
            // lander.points = random();
            // lander.adjustedScore = lander.points / sim.species[lander.speciesIndex].elements.length;
            lander.fitness = lander.points;

            let distanceSum = 0;
            for (let i = 0; i < sim.species[lander.speciesIndex].elements.length; i++) {
                if (sim.species[lander.speciesIndex].elements[i] != lander)
                    distanceSum += sim.deltaSpecies(lander, sim.species[lander.speciesIndex].elements[i]);
            }

            if (distanceSum == 0)
                distanceSum = 1;

            lander.adjustedFitness = lander.fitness / distanceSum;
        });

        // Computes species score
        this.species.forEach(sp => {
            sp.adjustedFitness = sp.elements.reduce((it, el) => it + el.adjustedFitness, 0) / sp.elements.length;
        });
    }

    killLowPerforming() {
        this.landers.sort((a, b) => a.adjustedFitness - b.adjustedFitness).reverse();

        let killCount = this.landers.length * (1 - this.survivorRate);
        for (let i = 0; i < killCount; i++)
            this.landers.pop();
    }

    killEstinctSpecies() {
        // Species with 0 members in them are killed
        let survivorSpecies = [];
        this.species.forEach(sp => {
            if (sp.elements.length != 0)
                survivorSpecies.push(sp);
        });
        this.species = survivorSpecies;
    }

    reproduce() {
        let newLanders = [];

        // Species children count
        let totalFitness = 0;
        for (let i = 0; i < this.species.length; i++)
            totalFitness += this.species[i].adjustedFitness;

        this.species.forEach(sp => {
            sp.childrenCount = Math.round(sp.adjustedFitness / totalFitness * sim.landersTotal);
        });
        console.log(totalFitness);

        newLanders = this.landers;
        // while (newLanders.length - 1 < this.landersTotal) {
        //
        // }

        this.landers = newLanders;
    }

    mutate() {
        //
    }




    deltaSpecies(lander1, lander2) {
        let c1 = 1;
        let c2 = 1;
        let c3 = 0.4;
        let n  = Math.max(
            lander1.controler.maxLocalGenesInnovationNumber(),
            lander2.controler.maxLocalGenesInnovationNumber()
        );
        if (n == 0)
            n = 1;

        let genesDatas = lander1.controler.genesDatas(lander2.controler, n);

        return c1 * genesDatas.excess   / n
             + c2 * genesDatas.disjoint / n
             + c3 * genesDatas.avgWeightsDiff;
    }




    draw(drawer) {
        if (!this.shouldDrawState)
            return;

        if (this.displayType.type == 'lander') {
            this.terrain.draw(drawer);
            this.landers.forEach((el, i) => el.draw(drawer, i == sim.displayType.id));
        }
        else if (this.displayType.type == 'controler') {
            this.landers.forEach((el, i) => i == this.displayType.id ? el.controler.draw(drawer) : '' );
        }
    }



    /**
    * Changes the display mode
    * @param type Type of the display ('vessel' or 'controler' or 'fitness')
    * @param id If type is 'controler', the id of the controler to be shown
    */
    displays(type, id = 0) {
        this.displayType = { type : type, id : id };
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

    /** Resets the GUI */
    resetGUI() {
        this.gui.reset();
        this.gui.addLabel('\\text{Generation}', this.neuralNetworkGeneration + '');
        this.gui.addLabel('\\text{Update FPS}', Math.round(1/_pSimulationInstance.dtMoy) + '');
        this.simSpeedLab = this.gui.addInput('\\text{Sim speed}', simulationSpeed, 1, 20);
        this.gui.addList(
            '\\text{Mode}',
            { 'Lander' : 0, 'Network' : 1 },
            0, this.gui.datas.configuration,
            (val) => sim.displays(val ? 'network' : 'lander', 0)
        );
        this.gui.addInput(
            '\\text{Selected ID}', this.displayType.id, 0, this.landers.length - 1,
            this.gui.datas.configuration,
            (val) => {
                sim.displayType.id = val;
                sim.displays(this.displayType.type, Math.round(val));
            }
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
}
