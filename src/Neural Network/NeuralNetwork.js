class NeuralNetwork {
    /**
    * Creates a new Neural Network
    * @param input_nodes  Input nodes count
    * @param hidden_nodes Hidden neurons count
    * @param output_nodes Ouput neurons count
    */
    constructor(input_nodes, hidden_nodes, output_nodes) {
        this.input_nodes  = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;

        this.ih_weights = new Matrix(this.input_nodes , this.hidden_nodes);
        this.ho_weights = new Matrix(this.hidden_nodes, this.output_nodes);

        this.ih_bias = new Matrix(this.hidden_nodes, 1);
        this.ho_bias = new Matrix(this.output_nodes, 1);

        this.weights_datas = { max : 0, min : 0 };
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
            let max = (args[1] == undefined ?  1 : args[1]);

            this.ih_weights.randomize(min, max);
            this.ho_weights.randomize(min, max);

            this.ih_bias.randomize(min, max);
            this.ho_bias.randomize(min, max);

            this.weights_datas = { max : max, min : min };
        }
        else if (mode == 'datas') {
            for (let i = 0; i < 3; i++) {
                if (!(args[i] instanceof Matrix)) {
                    console.error(`The datas provided for the Neural Network are not matrices.`);
                    return;
                }
            }

            this.ih_weights = args[0];
            this.ho_weights = args[1];

            this.ih_bias = args[2];
            this.ho_bias = args[3];

            this.weights_datas = {
                max : Math.max(this.ih_weights.max(), this.ho_weights.max(), this.ih_bias.max(), this.ho_bias.max()),
                min : Math.min(this.ih_weights.min(), this.ho_weights.min(), this.ih_bias.min(), this.ho_bias.min())
            };
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
    * Draw the Neural Network to the screen
    * @param drawer The pSEngine drawer
    */
    draw(drawer) {
        let s = _pSimulationInstance.config.engine.plotter.scale;
        let o = _pSimulationInstance.config.engine.plotter.offset;
        let maxNodes   = Math.max(this.input_nodes, this.hidden_nodes, this.output_nodes);
        let deltaSpace = new Vector(0.3 * s.x, 0.8 * s.y);

        for (let i = 0; i < 3; i++) { // column
            let x = -(s.x - deltaSpace.x) + i * (s.x - deltaSpace.x) + o.x;
            let m = (i == 1 ? this.hidden_nodes : (i == 2 ? this.output_nodes : this.input_nodes));

            for (let j = 0; j < m; j++) { // row
                let y = j * (s.y - deltaSpace.y/2)/(m-1) + o.y - deltaSpace.y/3;

                // Connexion with next level
                drawer
                    .noFill()
                    .strokeWeight(10 * 1 / maxNodes);

                // Cell
                drawer
                    .fill(70, 70, 70)
                    .stroke(255, 255, 255)
                    .circle(x, y, 500 / maxNodes, true);

                if (i == 0) {
                    for (let k = 0; k < this.hidden_nodes; k++) {
                        let mVal = this.getWeightColor(this.ih_weights.get(j, k));
                        let nm = this.hidden_nodes;

                        let nx = -(s.x - deltaSpace.x) + 1 * (s.x - deltaSpace.x) + o.x;
                        let ny = k * (s.y - deltaSpace.y/2)/(nm-1) + o.y - deltaSpace.y/3;

                        drawer
                            .stroke(mVal)
                            .line(x, y, nx, ny);
                    }
                }
                else if (i == 1) {
                    for (let k = 0; k < this.output_nodes; k++) {
                        let mVal = this.getWeightColor(this.ho_weights.get(j, k));
                        let nm = this.output_nodes;

                        let nx = -(s.x - deltaSpace.x) + 2 * (s.x - deltaSpace.x) + o.x;
                        let ny = k * (s.y - deltaSpace.y/2)/(nm-1) + o.y - deltaSpace.y/3;

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
            return `rgba(0, ${Math.round(2*(normalizedWeight - 0.5)*255)}, 0, 1)`;
        return `rgba(${Math.round(2*normalizedWeight*255)}, 0, 0, 1)`;
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
    * @return a JSON copy of the object
    */
    stringify() {
        return {
            ih_weights : this.ih_weights.stringify(),
            ho_weights : this.ho_weights.stringify(),
            ih_bias    : this.ih_bias.stringify(),
            ho_bias    : this.ho_bias.stringify(),
            weights_datas : this.weights_datas,
            input_nodes   : this.input_nodes,
            hidden_nodes  : this.hidden_nodes,
            output_nodes  : this.output_nodes
        };
    }
}
