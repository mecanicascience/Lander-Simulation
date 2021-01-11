let sim = null;
let initialConditions = [
	new Vector(-70, 70), // initial position
	new Vector(20, 20),  // initial velocitity
	-Math.PI * 0.2,      // initial engine angle
	20                   // initial thrust amount
];


function launchSimulation() {
	let populationSize  = 10;
	let hiddenNeurons   = 10;
	let controlers      = Array(populationSize-1).fill(NeuralNetworkControler);
	let controlersDatas = Array(populationSize-1).fill([ hiddenNeurons ]);

	// Last controler is an Human
	controlers.push(HumanControler);
	controlersDatas.push([ ]);

	sim.newPopulation(populationSize, controlers, controlersDatas);
	// sim.loadPopulation(_string_);


	sim.displays('vessel');
	sim.displays('controler', 0);
	sim.start();

	// Save population to console to a String
	// let sim = sim.savePopulation();
}



function runSimulator(simulator) {
	simulator
		.setEngineConfig((engineConf) => {
			engineConf.plotter.squareByX = true;
			engineConf.plotter.displayGrid = false;
			engineConf.plotter.scale = {
				x : 100,
				y : 100
			};
			engineConf.plotter.scale.y = height / _pSimulationInstance.plotter.computeForXYZ(1, 1, 0, false).x;
			engineConf.plotter.offset = {
				x : 0,
				y : 0.85 * engineConf.plotter.scale.y / 2
			};
		})
		.addObjects(Simulator, 1, initialConditions);

	// Global var for the NeuralNetworkHandler
	sim = _pSimulationInstance.plotter.objectsL[0];

	launchSimulation();
}
