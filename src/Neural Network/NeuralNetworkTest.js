class NeuralNetworkTest {
    constructor() {
        this.nn = new NeuralNetwork(30, 20, 30);
        this.nn.initialize('random');
    }

    update(dt) { }

    draw(drawer) {
        this.nn.draw(drawer);
    }

}
