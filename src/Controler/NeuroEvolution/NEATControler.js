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
            this.newGene(-1, (inputsSize - i - 1) * 2 / (inputsSize - 1) - 1, 'input');

        for (let i = 0; i < outputsSize; i++)
            this.newGene(1, (outputsSize - i - 1) * 2 / (outputsSize - 1) - 1, 'output');

        if (random() > 0.5)
            this.newConnection(this.getNode(0), this.getNode(10));
        if (random() > 0.5)
            this.newConnection(this.getNode(2), this.getNode(9));
        if (random() > 0.5)
            this.newConnection(this.getNode(5), this.getNode(7));
        if (random() > 0.5)
            this.newGene(random(-1, 1), random(-1, 1));
        if (random() > 0.5)
            this.newGene(random(-1, 1), random(-1, 1));
        if (random() > 0.5)
            this.newGene(random(-1, 1), random(-1, 1));
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
        this.lander.engine.rotate( prediction[0] * dt * Math.PI);
        this.lander.engine.rotate(-prediction[1] * dt * Math.PI);
        this.lander.engine.thrust( prediction[2] * dt * 1000);
        this.lander.engine.thrust(-prediction[3] * dt * 1000);
    }




    newGene(x, y, type = 'cell') {
        let node = new NEATNode(new Vector(x, y), this.genome.genes.length, type);
        this.genome.genes.push(node);
        return node;
    }

    newConnection(nodeFrom, nodeTo, weight = random(-1, 1), enabled = true) {
        // Computes innovationNumber
        let innovationNumber = null;
        for (let i = 0; i < this.simulator.innovationsList.length; i++) {
            if (
                   this.simulator.innovationsList[i].from.x == nodeFrom.pos.x
                && this.simulator.innovationsList[i].from.y == nodeFrom.pos.y
                && this.simulator.innovationsList[i].to.x == nodeTo.pos.x
                && this.simulator.innovationsList[i].to.y == nodeTo.pos.y
            ) innovationNumber = this.simulator.innovationsList[i].innovationNumber;
        }
        if (innovationNumber == null) {
            this.simulator.globalInnovationNumber++;
            innovationNumber = this.simulator.globalInnovationNumber;

            this.simulator.innovationsList.push({
                from : { x : nodeFrom.pos.x, y : nodeFrom.pos.y },
                to   : { x : nodeTo  .pos.x, y : nodeTo  .pos.y },
                innovationNumber : innovationNumber
            });
        }


        // Connection
        let conn = new NEATConnection(nodeFrom, nodeTo, weight, enabled, innovationNumber);
        this.genome.connections.push(conn);

        // Connect to nodes
        nodeFrom.connections.push(conn);
        nodeTo  .connections.push(conn);
    }




    genesDatas(otherCont, maxLocalGenesNb, minLocalGenesNb) {
        let disjointCount = 0;
        let excessCount   = 0;
        let weightDiff    = 0;
        let weightCommun  = 0;

        for (let i = 0; i < maxLocalGenesNb+1; i++) {
            let otherGene = otherCont.getGeneInnovationID(i);
            let thisGene  = this.getGeneInnovationID(i);

            if (otherGene != null && thisGene != null) {
                weightDiff += Math.abs(otherGene.weight - thisGene.weight);
                weightCommun++;
            }
            else if ((otherGene == null || thisGene == null) && !(otherGene == null && thisGene == null)) { // XOR
                if (i > minLocalGenesNb)
                    excessCount += 1;
                else
                    disjointCount += 1;
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
        child.inputsSize  = this.inputsSize;
        child.outputsSize = this.outputsSize;

        let maxGeneP1 = this.maxLocalGenesInnovationNumber();
        let maxGeneP2 = otherParent.maxLocalGenesInnovationNumber();

        let maxGene = Math.max(maxGeneP1, maxGeneP2);
        let minGene = Math.min(maxGeneP1, maxGeneP2);

        // Create connections child array
        let connections = [];
        for (let i = 0; i < maxGene+1; i++) {
            let otherGene = otherParent.getGeneInnovationID(i);
            let thisGene  = this.getGeneInnovationID(i);

            if (otherGene != null && thisGene != null) { // Connection in commun
                let r = random(); // same genes -> get from random parent
                let conn = r > 0.5 ? thisGene : otherGene;
                if (!thisGene.enabled && !otherGene.enabled) {
                    // If genes disabled in both connection, reactivated in 25% cases
                    if (random() < 0.25)
                        conn.enabled = true;
                }
                connections.push(conn);
            }
            else if ((otherGene == null || thisGene == null) && !(otherGene == null && thisGene == null)) { // XOR
                // Excess or disjoint
                if (otherGene != null)
                    connections.push(otherGene);
                else
                    connections.push(thisGene);
            }
        }

        // Create an array for the child with no duplicate genes
        let genesToCheck = this.genome.genes.concat(otherParent.genome.genes);
        let genes = [];
        for (let i = 0; i < genesToCheck.length; i++) {
            let found = false;
            for (let j = 0; j < genes.length; j++) {
                if (   genes[j].pos.x == genesToCheck[i].pos.x
                    && genes[j].pos.y == genesToCheck[i].pos.y
                ) found = true;
            }
            if (!found)
                genes.push(genesToCheck[i]);
        }
        child.genome = { connections, genes };

        return child;
    }

    mutate(mutationRate) {
        // Add node
        let nodeR = random();
        let conn = this.getEnabledConnections();
        if (nodeR < mutationRate.nodes && conn.length > 0) {
            let r = Math.round(random(0, conn.length - 1));
            let x = (conn[r].nodeFrom.x + conn[r].nodeTo.x) / 2;
            let y = (conn[r].nodeFrom.y + conn[r].nodeTo.y) / 2;

            let newNode = this.newGene(x, y);

            this.newConnection(conn[r].nodeFrom, newNode, 1);
            this.newConnection(newNode, conn[r].nodeTo, conn[r].weight);

            conn[r].enabled = false;
        }

        // Add connection
        let connectionR = random();
        if (connectionR < mutationRate.connections) {
            let unconnectedParts = [];
            for (let i = 0; i < this.genome.genes.length; i++) {
                for (let j = 0; j < this.genome.genes.length; j++) {
                    if (!this.genome.genes[i].hasConnectionWith(this.genome.genes[j]))
                        unconnectedParts.push([i, j]);
                }
            }

            if (unconnectedParts.length != 0) {
                let r = Math.round(random(0, unconnectedParts.length - 1));
                let fromNode = this.genome.genes[unconnectedParts[r][0]];
                let toNode   = this.genome.genes[unconnectedParts[r][1]];
                if (toNode.pos.x < fromNode.pos.x) {
                    fromNode = this.genome.genes[unconnectedParts[r][1]];
                    toNode   = this.genome.genes[unconnectedParts[r][0]];
                }

                if (!(   (fromNode.type == 'input'  && toNode.type == 'input')
                      || (fromNode.type == 'output' && toNode.type == 'output'))
                ) this.newConnection(fromNode, toNode);
            }
        }

        // Weights mutation
        for (let i = 0; i < this.genome.connections.length; i++) {
            let weightR = random();
            if (weightR < mutationRate.weights.global) {
                let weightR2 = random();
                if (weightR2 < mutationRate.weights.uniform)
                    this.genome.connections[i].weight += randomGaussian(0, mutationRate.weights.uniformStandartVar);
                else
                    this.genome.connections[i].weight = random(-1, 1);
            }
        }
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

    getEnabledConnections() {
        let enabledConnection = [];
        for (let i = 0; i < this.genome.connections.length; i++) {
            if (this.genome.connections[i].enabled)
                enabledConnection.push(this.genome.connections[i]);
        }
        return enabledConnection;
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

        let max = 0;
        for (let i = 0; i < this.genome.connections.length; i++) {
            if (this.genome.connections[i].innovationNumber > max)
                max = this.genome.connections[i].innovationNumber;
        }
        return max;
    }




    copy() {
        let controler = new NEATControler(this.simulator);
        controler.speciesIndex = this.speciesIndex;
        controler.inputsSize   = this.inputsSize;
        controler.outputsSize  = this.outputsSize;

        controler.genome = {
            connections : this.genome.connections.slice(),
            genes       : this.genome.genes      .slice()
        };

        return controler;
    }
}
