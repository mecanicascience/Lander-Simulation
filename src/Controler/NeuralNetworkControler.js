class NeuralNetworkControler extends Controler {
    /**
    * Creates a new Neural Network Controler
    * @param hidden_nodes The number of hidden nodes of the NeuralNetwork
    */
    constructor(hidden_nodes) {
        super();
        this.lander = null;

        this.input_nodes  = 3;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = 5;

        this.nn = new NeuralNetwork(
            input_nodes,
            hidden_nodes,
            output_nodes
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
        this.nn.initialize(lander, 'json', data.neural_network);
    }


    /**
    * Updates the Neural Network Controler
    * @param dt The delta time (in seconds)
    */
    update(dt) {
        // Do the computations here2021
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
