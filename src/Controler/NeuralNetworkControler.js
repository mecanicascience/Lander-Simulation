class NeuralNetworkControler extends Controler {
    constructor(input_nodes, hidden_nodes, output_nodes) {
        super();
        this.lander = null;

        this.input_nodes  = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;

        this.nn = new NeuralNetwork(
            input_nodes,
            hidden_nodes,
            output_nodes
        );
    }

    initialize(lander, neuralNetworkMode = 'random', ...neuralNetworkArgs) {
        this.lander = lander;
        this.nn.initialize(neuralNetworkMode, ...neuralNetworkArgs);
    }

    initializeFromJSON(lander, data) {
        this.nn.initialize(lander, 'json', data.neural_network);
    }


    update(dt) {

    }

    draw(drawer) {
        this.nn.draw(drawer);
    }



    stringify() {
        return {
            input_nodes    : this.input_nodes,
            hidden_nodes   : this.hidden_nodes,
            output_nodes   : this.output_nodes,
            neural_network : this.nn.stringify()
        };
    }
}