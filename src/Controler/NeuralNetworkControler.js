class NeuralNetworkControler extends Controler {
    /**
    * Creates a new Neural Network Controler
    * @param hidden_nodes The number of hidden nodes of the NeuralNetwork
    */
    constructor(hidden_nodes) {
        super();

        // Using ReLU activation function f(x) = max(0, x)
        let reLU_activationFunction    = x => x > 0 ? x : 0;
        let sigmoid_activationFunction = x => 1/(1 + Math.exp(-x));
        let activationFunction = sigmoid_activationFunction;

        this.lander = null;

        this.input_nodes  = 2;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = 2;

        this.nn = new NeuralNetwork(
            this.input_nodes,
            this.hidden_nodes,
            this.output_nodes,
            activationFunction,
            [
                { max : -100, min : -100 }, // input_nodes  supposed max and min values
                { max : 0, min :  0 }, // hidden_nodes supposed max and min values
                { max : 0, min :  0 }  // output_nodes supposed max and min values
            ]
        );
    }

    /**
    * Initialize the Neural Network Controler
    * @param lander The attached lander
    * @param neuralNetworkMode The neuralNetworkMode for initialization mode
    * @param neuralNetworkArgs Optional arguments for the Neural Network to recover data from
    */
    initialize(lander, neuralNetworkMode = 'random', ...neuralNetworkArgs) {
        this.lander = lander;
        this.nn.initialize(neuralNetworkMode, ...neuralNetworkArgs);
    }

    /**
    * Initialize the Neural Network Controler from JSON datas
    * @param lander The attached lander to the Controler
    * @param data Data of the Neural Network of the last corresponding lander
    */
    initializeFromJSON(lander, data) {
        this.initialize(lander, 'json', data.neural_network);
    }


    /**
    * Updates the Neural Network Controler
    * @param dt The delta time (in seconds)
    */
    update(dt) {
        let inputs = [ this.lander.pos.x, 1000*noise(Date.now() / 300)-1 ]; // TODO

        // Genotype
        let prediction = this.nn.predict(inputs);

        // Phenotype
        this.lander.engine.rotate(prediction.get(0, 0));
        this.lander.engine.thrust(prediction.get(1, 0));
    }


    /**
    * @return the fitness value of this NeuralNetwork
    */
    estimateFitness() {
        return random(0, 50);
    }


    /**
    * Draws the Neural Network to the screen
    * @param drawer The drawing instance object
    */
    draw(drawer) {
        this.nn.draw(drawer);
    }


    /** @return an object representation of this object */
    stringify() {
        return {
            input_nodes    : this.input_nodes,
            hidden_nodes   : this.hidden_nodes,
            output_nodes   : this.output_nodes,
            neural_network : this.nn.stringify()
        };
    }
}
