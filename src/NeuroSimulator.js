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

        this.speciesThreshold = 3; // 3
        this.survivorRate     = 0.8;
        this.mutationRate     = {
            weights : {
                global : 0.8,
                newValue : 0.1,
                uniform  : 0.9,
                uniformStandartVar : 0.05
            },
            connections : 0.3,
            nodes : 0.03
        };

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
            this.initialConditions = [
                new Vector(-70, 70), // r0
                new Vector( 20, 10), // v0
                0, // thrustAmount
                0  // thrustAngle
            ];

            // Evolve
            // Generate new species
            this.generateSpecies();
            // Kill the nth low performing landers
            this.killLowPerforming();
            // Kill the species with no lander in them
            this.killEstinctSpecies();
            // Reproduce landers
            this.reproduce();
            // Kill species with no children
            this.killUnfertileSpecies();
            // Mutations
            this.mutate();

            // New generation
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
        // Species children count
        let totalFitness = 0;
        for (let i = 0; i < this.species.length; i++)
            totalFitness += this.species[i].adjustedFitness;

        let totalChildren  = 0;
        this.species.forEach(sp => {
            let c = Math.round(sp.adjustedFitness / totalFitness * sim.landersTotal);
            sp.childrenCount = c;
            totalChildren += c;
        });

        // If total children count doesn't add up, remove or add random children to random species
        if (totalChildren != this.landersTotal) {
            let delta = this.landersTotal - totalChildren;

            for (let i = 0; i < Math.abs(delta); i++) {
                this.species.sort(() => Math.random() - 0.5);
                this.species[i].childrenCount += delta;
            }
        }

        // Reproduce in each species
        let newLanders = [];
        this.species.forEach((sp, spIndex) => {
            if (sp.childrenCount == 0)
                return;

            let newMembers = [];
            sp.elements.sort((l1, l2) => l1.adjustedFitness - l2.adjustedFitness).reverse();
            if (sp.elements[0].controler.genome.connections.length > 5) // keep best member unchanged
                newMembers.push(this.copyLander(members.pop()));

            // Normalize adjustedFitness
            let totalLanderFitness = sp.elements.reduce((it, el) => it + el.adjustedFitness, 0);
            let normAdjustedFitnessID = [];
            sp.elements.forEach(lander => normAdjustedFitnessID.push(lander.adjustedFitness / totalLanderFitness));
            for (let i = 1; i < normAdjustedFitnessID.length; i++)
                normAdjustedFitnessID[i] += normAdjustedFitnessID[i - 1];

            // Generate other children
            let maxIt = sp.childrenCount - newMembers.length;
            for (let jIt = 0; jIt < maxIt; jIt++) {
                // If no vessel in the specie
                if (sp.elements.length == 0) {
                    if (newMembers.length == 0)
                        return;
                    else
                        newMembers.push(this.copyLander(newMembers[0]));
                    continue;
                }
                // If only one lander in the specie
                if (sp.elements.length == 1) {
                    newMembers.push(this.copyLander(sp.elements[0]));
                    continue;
                }

                // Pick parent1
                let r = random();
                let id = 0;
                while (r > normAdjustedFitnessID[id])
                    id++;
                let parent1 = this.copyLander(sp.elements[id]);

                // Pick parent2
                let parent2 = null;
                let i2 = 0; // Security
                while (parent2 == null || (parent2 == parent1 && i2 < 10000)) {
                    let r2 = random();
                    let id2 = 0;
                    while (r2 > normAdjustedFitnessID[id2])
                        id2++;
                    parent2 = this.copyLander(sp.elements[id2]);

                    i2++;
                }

                if (i2 > 10000 - 5)
                    console.error("The for loop choosing parent2 was breaked by force");

                // Reproduce parent1 and parent2
                newMembers.push(this.makeChild(parent1, parent2));
            }

            // Add newMembers to the list
            for (let i = 0; i < newMembers.length; i++)
                newMembers.speciesIndex = spIndex;
            newMembers.forEach(m => newLanders.push(m));
        });

        this.landers = newLanders;
    }

    killUnfertileSpecies() {
        // Species with 0 children are killed
        let survivorSpecies = [];
        this.species.forEach(sp => {
            if (sp.elements.childrenCount != 0)
                survivorSpecies.push(sp);
        });
        this.species = survivorSpecies;
    }

    mutate() {
        // Mutate every landers based on mutationRate
        this.landers.forEach(lander => lander.controler.mutate(this.mutationRate));
    }



    copyLander(lander) {
        let newLander = new Lander(this, this.terrain, lander.controler.copy());

        newLander.id = Math.round(random(100, 100000)); // used for debug
        newLander.initialize(...this.initialConditions);

        return newLander;
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

        let genesDatas1 = lander1.controler.genesDatas(lander2.controler, n);
        let genesDatas2 = lander2.controler.genesDatas(lander1.controler, n);

        return c1 * Math.max(genesDatas1.excess, genesDatas2.excess) / n
             + c2 * Math.max(genesDatas1.disjoint, genesDatas2.disjoint) / n
             + c3 * Math.max(genesDatas1.avgWeightsDiff, genesDatas2.avgWeightsDiff);
    }

    makeChild(parent1, parent2) {
        let newLander = new Lander(
            this, this.terrain,
            parent1.controler.makeChildWith(parent2.controler)
        );

        newLander.id = Math.round(random(100, 100000)); // used for debug
        newLander.initialize(...this.initialConditions);

        return newLander;
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
