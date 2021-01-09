class Perceptron {
    /**
    * Creates a new Perceptron
    * @param inputsArraySize The size of the inputs, and so of the weights
    */
    constructor(inputsArraySize, learningRate, weightExtremas) {
        this.learningRate = learningRate;
        this.weights = [];

        for (let i = 0; i < inputsArraySize; i++)
            this.weights[i] = random(weightExtremas[0], weightExtremas[1]);
    }

    /**
    * Estimates the output of the inputs
    * @param inputs Inputs provided
    */
    estimate(inputs) {
        let sum = 0;
        for (let i = 0; i < this.weights.length; i++)
            sum += inputs[i] * this.weights[i];

        return this.activate(sum);
    }

    /**
    * Activate function
    * @param data Data to be passed to activate function
    */
    activate(data) {
        if (data > 0)
            return 1;

        return 0;
    }

    /**
    * Train the Neural Network
    * @param inputs  The inputs array
    * @param desired The expected output
    */
    train(inputs, desired) {
        let guess = this.estimate(inputs);
        let error = desired - guess;

        for (let i = 0; i < this.weights.length; i++) {
            let dw = this.learningRate * error * inputs[i];
            this.weights[i] += dw;
        }
    }
}
