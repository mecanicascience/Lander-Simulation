let sim = null;
let initialConditions = [
	new Vector(-70, '40% height'), // initial position
	new Vector(20, 10),  // initial velocitity
	0,   // initial engine angle
	0    // initial thrust amount
];
let terrainPrecision = 50;
let mutationRate = 0.1;

function launchSimulation() {
	let populationSize  = 100;
	let hiddenNeurons   = 100;
	let controlers      = Array(populationSize).fill(NeuralNetworkControler);
	let controlersDatas = Array(populationSize).fill([ hiddenNeurons ]);

	// Last controler is an Human
	// controlers.push(HumanControler);
	// controlersDatas.push([ ]);
	// populationSize += 1;

	sim.newPopulation(populationSize, controlers, controlersDatas);
	sim.displays('vessel');
	sim.play();

	// Save and load population to console to a String
	// let str_sim = sim.savePopulation();
	// sim.loadPopulation(str_sim);
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

			initialConditions[0].y = 0.7 * engineConf.plotter.scale.y / 2;
		})
		.addObjects(Simulator, 1, initialConditions, terrainPrecision);

	// Global var for the NeuralNetworkHandler
	sim = _pSimulationInstance.plotter.objectsL[0];

	launchSimulation();
}
