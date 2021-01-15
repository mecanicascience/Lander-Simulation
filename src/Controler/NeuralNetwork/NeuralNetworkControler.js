class NeuralNetworkControler extends Controler {
    /**
    * Creates a new Neural Network Controler
    * @param hidden_nodes The number of hidden nodes of the NeuralNetwork
    */
    constructor(simulator, hidden_nodes) {
        super(simulator);

        // Using ReLU activation function f(x) = max(0, x)
        let reLU_activationFunction    = x => x > 0 ? x : 0;
        let sigmoid_activationFunction = x => 2 / (1 + Math.exp(-4.9*x)) - 1;
        this.activationFunction = sigmoid_activationFunction;

        this.gaussianDistribution = {
            mean : 0,
            standard_deviation : 0.05
        };

        this.input_nodes  = 7 + simulator.terrain.describe().length;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = 4;

        this.nodes_datas = [
            { max : 0, min : 0 }, // input_nodes supposed max and min values
            { max : 0, min : 0 },      // hidden_nodes supposed max and min values
            { max : 0, min : 0 }       // output_nodes supposed max and min values
        ];
        this.lander = null;

        this.nn = new NeuralNetwork(
            this.input_nodes,
            this.hidden_nodes,
            this.output_nodes,
            this.activationFunction,
            this.nodes_datas
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
        this.hidden_nodes = this.nn.hidden_nodes;
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
        /*
        * deltaTime * 100
        * position : x, y
        * velocity : x, y
        * engine : thrust, angle
        * terrain : every x, y points
        */
        let scale = _pSimulationInstance.getEngineConfig().plotter.scale;
        let inputs = [
            dt,
            this.lander.pos.x / scale.x,
            this.lander.pos.y / scale.y,
            this.lander.vel.x / 100,
            this.lander.vel.y / 100,
            this.lander.engine.thrustAmount / 1000,
            this.lander.engine.thrustAngle / Math.PI,
            ...this.simulator.terrain.describe()
        ];

        // Genotype
        let prediction = this.nn.predict(inputs);

        // Phenotype
        // [ rotationX, rotationY, thrustUp, thrustDown ]
        this.lander.engine.rotate( prediction.get(0, 0));
        this.lander.engine.rotate(-prediction.get(1, 0));
        this.lander.engine.thrust( prediction.get(2, 0));
        this.lander.engine.thrust(-prediction.get(3, 0));
    }


    /**
    * @return the fitness value of this NeuralNetwork
    */
    estimateFitness() {
        if (this.lander.points == 0)
            this.lander.points = 1;
        return this.lander.points;
    }


    /**
    * Mutate the NeuralNetwork
    */
    mutate() {
        this.nn.mutate(mutationRate, this.gaussianDistribution);
    }

    /**
    * Crossover two parents
    * @param parent1 First parent controler
    * @param parent2 Second parent controler
    * @param mode Type of the crossover ('random-parent')
    * @return a crossover between the two parents
    */
    crossover(parent1, parent2, mode) {
        this.nn = NeuralNetwork.crossover(parent1.nn, parent2.nn, mode);
        this.hidden_nodes = this.nn.hidden_nodes;
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
