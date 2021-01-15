class NEATControler {
    constructor(simulator) {
        this.simulator = simulator;
        this.lander    = null;

        // nodes genes are labbeled input1, input2, ..., inputn, outputn+1, ..., outputk, nodek+1, ...
        this.genome = {
            genes : [],
            connections : []
        };
        this.speciesIndex = null;

        this.activationFunction = val => 2 / (1 + Math.exp(-4.9 * val)) - 1;
    }

    initialize(lander, inputsSize, outputsSize) {
        this.lander = lander;

        this.inputsSize  = inputsSize;
        this.outputsSize = outputsSize;

        for (let i = 0; i < inputsSize; i++)
            this.newGene(-1, i * 2 / (inputsSize - 1) - 1, 'input');

        for (let i = 0; i < outputsSize; i++)
            this.newGene(1, i * 2 / (outputsSize - 1) - 1, 'output');

        this.newConnection(this.genome.genes[0], this.genome.genes[9]);
    }


    predict(inputs) {
        // Clear gene last prediction
        for (let i = 0; i < this.genome.genes; i++)
            this.genome.genes[i].clearPrediction();

        // Set input value
        for (let i = 0; i < this.inputsSize; i++)
            this.genome.genes[i].prediction = inputs[i];

        // Computes output value
        let outputs = [];
        for (let i = 0; i < this.outputsSize; i++)
            outputs.push(this.genome.genes[this.inputsSize + i].predict(this.activationFunction));

        return outputs;
    }



    update(dt) {
        /*
        * position : x, y
        * velocity : x, y
        * engine   : thrust, angle
        * terrain  : every x, y points
        */
        let scale = _pSimulationInstance.getEngineConfig().plotter.scale;
        let inputs = [
            this.lander.pos.x / scale.x,
            this.lander.pos.y / scale.y,
            this.lander.vel.x / 100,
            this.lander.vel.y / 100,
            this.lander.engine.thrustAmount / 1000,
            this.lander.engine.thrustAngle / Math.PI,
            ...this.simulator.terrain.describe()
        ];

        // Genotype
        let prediction = this.predict(inputs);

        // Phenotype
        // [ rotationX, rotationY, thrustUp, thrustDown ]
        this.lander.engine.rotate( prediction[0] * dt);
        this.lander.engine.rotate(-prediction[1] * dt);
        this.lander.engine.thrust( prediction[2] * dt);
        this.lander.engine.thrust(-prediction[3] * dt);
    }



    newGene(x, y, type = 'cell') {
        this.genome.genes.push(
            new NEATNode(new Vector(x, y), this.genome.genes.length, type)
        );
    }

    newConnection(nodeFrom, nodeTo, weight = random(-1, 1), enabled = true) {
        // Computes innovationNumber
        /** @TODO */
        let innovationNumber = 0;

        // Connection
        let conn = new NEATConnection(nodeFrom, nodeTo, weight, enabled, innovationNumber);
        this.genome.connections.push(conn);

        // Connect to nodes
        nodeFrom.connections.push(conn);
        nodeTo  .connections.push(conn);
    }



    getNode(nodeID) {
        for (let i = 0; i < this.genome.genes.length; i++) {
            if (this.genome.genes[i].id == nodeID)
                return this.genome.genes[i];
        }
        return null;
    }



    maxLocalGenesInnovationNumber() {
        if (this.genome.connections.length == 0)
            return 0;
        return this.genome.connections[this.genome.connections.length - 1].innovationNumber;
    }


    genesDatas(otherCont, maxLocalGenesNb) {
        let disjointCount = 0;
        let excessCount   = 0;
        let weightDiff    = 0;
        let weightCommun  = 0;

        for (let i = 0; i < this.genome.connections.length; i++) {
            let w = otherCont.getGeneInnovationID(this.genome.connections[i].innovationNumber);
            if (w != null) {
                weightDiff += Math.abs(w.weight - this.genome.connections[i].weight);
                weightCommun++;
            }
            else {
                if (i <= maxLocalGenesNb)
                    disjointCount++;
                else
                    excessCount++;
            }
        }

        if (weightCommun == 0)
            weightCommun = 1; // avoid dividing by 0

        return {
            disjoint : disjointCount,
            excess   : excessCount,
            avgWeightsDiff : weightDiff / weightCommun
        };
    }


    makeChildWith(otherParent) {
        let child = new NEATControler(this.simulator);
        child.lander       = this.lander;
        child.inputsSize   = this.inputsSize;
        child.outputsSize  = this.outputsSize;

        let connections = [];
        let genes = [];

        for (let i = 0; i < Math.max(this.genome.connections.length, otherParent.genome.connections.length); i++) {
            if (this.genome.connections[i] != undefined && otherParent.genome.connections[i] != undefined) {
                let r = random(); // same genes -> get from random parent
                let c = r > 0.5 ? this.genome.connections[i] : otherParent.genome.connections[i];
                if (!this.genome.connections[i].enabled && !otherParent.genome.connections[i].enabled) {
                    // If genes disabled in both connection, reactivated in 25% cases
                    let r2 = random();
                    if (r2 < 0.25)
                        c.enabled = true;
                }
                connections.push(c);
            }
            else if (this.genome.connections[i] != undefined)
                connections.push(this.genome.connections[i]);
            else
                connections.push(otherParent.genome.connections[i]);
        }

        for (let i = 0; i < Math.max(this.genome.genes.length, otherParent.genome.genes.length); i++) {
            if (this.genome.genes[i])
                genes.push(this.genome.genes[i]);
            else
                otherParent.push(this.genome.genes[i]);
        }

        child.genome = { connections, genes };

        return child;
    }

    mutate(mutationRate) {
        
    }


    draw(drawer) {
        // Resets drawing
        this.genome.connections.forEach((el, i) => el.drawn = false);
        this.genome.genes      .forEach((el, i) => el.drawn = false);

        // Dimensions
        let deltaScale = 0.8;
        let conf = _pSimulationInstance.config.engine.plotter;
        let confScale = new Vector(conf.scale.x * deltaScale, conf.scale.y * deltaScale / 2);

        drawer
            .push()
            .translate(conf.offset.x, conf.offset.y);

            // Start with Outputs
            for (let i = 0; i < this.outputsSize; i++)
                this.genome.genes[this.inputsSize + i].draw(drawer, confScale);

            // Then the every other genes not connected
            this.genome.genes.forEach((el, i) => el.drawn ? '' : el.draw(drawer, confScale));

        drawer.pop();
    }


    getGeneInnovationID(id) {
        for (let i = 0; i < this.genome.connections.length; i++)
            if (this.genome.connections[i].innovationNumber == id)
                return this.genome.connections[i];

        return null;
    }


    copy() {
        let controler = new NEATControler(this.simulator);
        controler.speciesIndex = this.speciesIndex;
        controler.lander       = this.lander;
        controler.inputsSize   = this.inputsSize;
        controler.outputsSize  = this.outputsSize;

        controler.genome = {
            connections : this.genome.connections.slice(),
            genes       : this.genome.genes      .slice()
        };

        return controler;
    }
}
