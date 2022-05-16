class NeuralNetwork {
    /**
    * Creates a new Neural Network
    * @param input_nodes  Input nodes count
    * @param hidden_nodes Hidden neurons count
    * @param output_nodes Ouput neurons count
    * @param activationFunction The activation function of the NeuralNetwork
    */
    constructor(input_nodes, hidden_nodes, output_nodes, activationFunction, nodes_datas) {
        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;

        this.ih_weights = new Matrix(this.hidden_nodes, this.input_nodes);
        this.ho_weights = new Matrix(this.output_nodes, this.hidden_nodes);

        this.ih_bias = new Matrix(this.hidden_nodes, 1);
        this.ho_bias = new Matrix(this.output_nodes, 1);

        this.weights_datas = { max: 0, min: 0 };
        this.nodes_datas = nodes_datas;
        if (nodes_datas == undefined)
            this.nodes_datas = [
                { max: 0, min: 0 }, // input_nodes
                { max: 0, min: 0 }, // hidden_nodes
                { max: 0, min: 0 } // output_nodes
            ];

        this.activationFunction = activationFunction;
    }


    /**
    * @param mode The mode of initialization ('random' / 'datas' / 'copy' / 'json')
    * @param args The arguments corresponding to the initialization
    *   If random mode, arg0 and arg1 are the min and max values of the coefficients
    *   If datas mode, arg0 = ih_weights, arg1 = ho_weights, arg2 = ih_bias, arg3 = ho_bias
    *   If copy mode, arg0 = the Neural Network to copy
    *   If json mode, arg0 = the JSON datas
    */
    initialize(mode, ...args) {
        if (mode == 'random') {
            let min = (args[0] == undefined ? -1 : args[0]);
            let max = (args[1] == undefined ? 1 : args[1]);

            this.ih_weights.randomize(min, max);
            this.ho_weights.randomize(min, max);

            this.ih_bias.randomize(min, max);
            this.ho_bias.randomize(min, max);

            this.updateWeightDatas();
        }
        else if (mode == 'datas') {
            for (let i = 0; i < 3; i++) {
                if (!(args[i] instanceof Matrix))
                    throw new Error(`The datas provided for the Neural Network are not matrices.`);
            }

            this.ih_weights = args[0];
            this.ho_weights = args[1];

            this.ih_bias = args[2];
            this.ho_bias = args[3];

            this.updateWeightDatas();
        }
        else if (mode == 'copy') { // please use nn.copy() function directly
            this.ih_weights = args[0].ih_weights.copy();
            this.ho_weights = args[0].ho_weights.copy();

            this.ih_bias = args[0].ih_bias.copy();
            this.ho_bias = args[0].ho_bias.copy();

            this.weights_datas = args[0].weights_datas;
        }
        else if (mode == 'json') {
            this.ih_weights = new Matrix(JSON.parse(args[0].ih_weights));
            this.ho_weights = new Matrix(JSON.parse(args[0].ho_weights));

            this.ih_bias = new Matrix(JSON.parse(args[0].ih_bias));
            this.ho_bias = new Matrix(JSON.parse(args[0].ho_bias));

            this.weights_datas = args[0].weights_datas;
        }
    }


    /**
    * Make a guess
    * @param inputs The input array (must be the same length as this.input_nodes)
    * @return The ouput array predicted
    */
    predict(input_arr) {
        this.a_0 = Matrix.fromArray(input_arr);

        let z_matrix_1 = Matrix.mult(this.ih_weights, this.a_0).add(this.ih_bias);
        this.a_1 = this.activate(z_matrix_1);

        let z_matrix_2 = Matrix.mult(this.ho_weights, this.a_1).add(this.ho_bias);
        this.a_2 = this.activate(z_matrix_2);

        this.updateNodesDatas();

        return this.a_2;
    }

    /**
    * Runs the activate function on each coefficient of the matrix
    * @param m The matrix
    * @return The modified matrix
    */
    activate(m) {
        return m.copy().map((el, i, j) => this.activationFunction(el));
    }


    /**
    * Crossover two parents
    * @param parent1 First parent
    * @param parent2 Second parent
    * @param mode Type of the crossover ('random-parent')
    * @return a crossover between the two parents
    */
    static crossover(parent1, parent2, mode) {
        // Nodes datas : max and min of each parent
        let nodes_datas = [];
        for (let i = 0; i < parent1.nodes_datas.length; i++) {
            nodes_datas.push({
                max: Math.max(parent1.nodes_datas[i].max, parent2.nodes_datas[i].max),
                min: Math.min(parent1.nodes_datas[i].min, parent2.nodes_datas[i].min)
            });
        }

        // Activation function : 1/2 chance of parent1, 1/2 of parent2
        let activation_function = (random() > 0.5 ? parent1 : parent2)['activationFunction'];

        // Hidden nodes : same as parent1
        let hidden_nodes = parent1.hidden_nodes;

        // Create the NeuralNetworks
        let nn = new NeuralNetwork(
            parent1.input_nodes, hidden_nodes, parent1.output_nodes,
            activation_function, nodes_datas
        );


        // Crossover weights and biases
        let crossoverFun;
        if (mode == 'random-parent') {
            crossoverFun = (el, i, j, p1Weight, p2Weight) => random(0, 1) > 0.5
                ? p1Weight.get(i, j)
                : p2Weight.get(i, j);
        }

        nn.ih_weights.map(crossoverFun, parent1.ih_weights, parent2.ih_weights);
        nn.ho_weights.map(crossoverFun, parent1.ho_weights, parent2.ho_weights);

        nn.ih_bias.map(crossoverFun, parent1.ih_bias, parent2.ih_bias);
        nn.ho_bias.map(crossoverFun, parent1.ho_bias, parent2.ho_bias);

        nn.updateWeightDatas();

        return nn;
    }

    /**
    * Mutate the NeuralNetwork
    * @param mutationRate The probability between 0 and 1 of a mutation
    */
    mutate(mutationRate, gaussianDistribution) {
        let mutationFun = (el, i, j, mutationRate) => random() < mutationRate
            ? el + randomGaussian(gaussianDistribution.mean, gaussianDistribution.standard_deviation)
            : el;

        this.ih_weights.map(mutationFun, mutationRate);
        this.ho_weights.map(mutationFun, mutationRate);

        this.ih_bias.map(mutationFun, mutationRate);
        this.ho_bias.map(mutationFun, mutationRate);
    }



    /**
    * Draw the Neural Network to the screen
    * @param drawer The pSEngine drawer
    */
    draw(drawer) {
        let s = _pSimulationInstance.config.engine.plotter.scale;
        let o = _pSimulationInstance.config.engine.plotter.offset;
        let maxNodes = Math.max(this.input_nodes, this.hidden_nodes, this.output_nodes);
        let deltaSpace = new Vector(0.3 * s.x, 0.8 * s.y);

        for (let i = 0; i < 3; i++) { // column
            let x = -(s.x - deltaSpace.x) + i * (s.x - deltaSpace.x) + o.x;
            let m = (i == 1 ? this.hidden_nodes : (i == 2 ? this.output_nodes : this.input_nodes));

            for (let j = 0; j < m; j++) { // row
                let y = (m - j - 1) * (s.y - deltaSpace.y / 2) / (m - 1) + o.y - deltaSpace.y / 3;

                // Cell
                let cellCol = (i == 1 ? this.a_1 : (i == 2 ? this.a_2 : this.a_0));
                if (!(cellCol instanceof Matrix))
                    return;

                drawer
                    .fill(this.getCellColor(
                        cellCol.get(j, 0),
                        this.nodes_datas[i].min,
                        this.nodes_datas[i].max,
                    ))
                    .stroke(255)
                    .strokeWeight(13 * 1 / maxNodes)
                    .circle(x, y, 500 / maxNodes, true);

                // Connexion with next level
                drawer
                    .noFill()
                    .strokeWeight(10 * 1 / maxNodes);

                if (i == 0) {
                    // ih weights
                    for (let k = 0; k < this.hidden_nodes; k++) {
                        let mVal = this.getWeightColor(this.ih_weights.get(k, j));
                        let nm = this.hidden_nodes;

                        let nx = -(s.x - deltaSpace.x) + 1 * (s.x - deltaSpace.x) + o.x;
                        let ny = k * (s.y - deltaSpace.y / 2) / (nm - 1) + o.y - deltaSpace.y / 3;

                        drawer
                            .stroke(mVal)
                            .line(x, y, nx, ny);
                    }
                }
                else if (i == 1) {
                    // ho weights
                    for (let k = 0; k < this.output_nodes; k++) {
                        let mVal = this.getWeightColor(this.ho_weights.get(k, j));
                        let nm = this.output_nodes;

                        let nx = -(s.x - deltaSpace.x) + 2 * (s.x - deltaSpace.x) + o.x;
                        let ny = k * (s.y - deltaSpace.y / 2) / (nm - 1) + o.y - deltaSpace.y / 3;

                        drawer
                            .stroke(mVal)
                            .line(x, y, nx, ny);
                    }
                }
            }
        }
    }


    /**
    * Get a weight color based on max and min values of the NeuralNetworks coefficients
    * @param w The weight
    * @return The color of the weight as an rgba color
    */
    getWeightColor(w) {
        let normalizedWeight =
            (w - this.weights_datas.min)
            / (this.weights_datas.max - this.weights_datas.min);

        if (normalizedWeight > 0.5)
            return `rgba(0, ${Math.round(2 * (normalizedWeight - 0.5) * 255)}, 0, 1)`;
        return `rgba(${Math.round(2 * normalizedWeight * 255)}, 0, 0, 1)`;
    }

    /**
    * Get a cell color based on max and min values of the NeuralNetworks last cells
    * @param c The cell
    * @param min The min cell value
    * @param max The max cell value
    * @return The color of the cell as an rgba color
    */
    getCellColor(c, min, max) {
        let color = Math.round((c - min) / (max - min) * 255);
        return `rgba(${color}, ${color}, ${color}, 1)`;
    }




    /**
    * @return a copy of this NeuralNetwork
    */
    copy() {
        let nn = new NeuralNetwork(this.input_nodes, this.hidden_nodes, this.output_nodes);
        nn.initialize('copy', this);
        return nn;
    }

    /**
    * Update the min and max values of every weights
    */
    updateWeightDatas() {
        this.weights_datas = {
            max: Math.max(
                this.ih_weights.max(), this.ho_weights.max(),
                this.ih_bias.max(), this.ho_bias.max()
            ),
            min: Math.min(
                this.ih_weights.min(), this.ho_weights.min(),
                this.ih_bias.min(), this.ho_bias.min()
            )
        };
    }

    /**
    * Update the min and max values of every last nodes values for drawing
    */
    updateNodesDatas() {
        let n0 = {
            max: [this.nodes_datas[0].max, this.a_0.max()],
            min: [this.nodes_datas[0].min, this.a_0.min()]
        };
        let n1 = {
            max: [this.nodes_datas[1].max, this.a_1.max()],
            min: [this.nodes_datas[1].min, this.a_1.min()]
        };
        let n2 = {
            max: [this.nodes_datas[2].max, this.a_2.max()],
            min: [this.nodes_datas[2].min, this.a_2.min()]
        };

        this.nodes_datas = [
            { max: Math.max(...n0.max), min: Math.min(...n0.min) }, // input_nodes
            { max: Math.max(...n1.max), min: Math.min(...n1.min) }, // hidden_nodes
            { max: Math.max(...n2.max), min: Math.min(...n2.min) }  // output_nodes
        ];
    }

    /**
    * @return a JSON copy of the object
    */
    stringify() {
        return {
            ih_weights: this.ih_weights.stringify(),
            ho_weights: this.ho_weights.stringify(),
            ih_bias: this.ih_bias.stringify(),
            ho_bias: this.ho_bias.stringify(),
            weights_datas: this.weights_datas,
            input_nodes: this.input_nodes,
            hidden_nodes: this.hidden_nodes,
            output_nodes: this.output_nodes
        };
    }
}
