let sim = null;
let initialConditions = [
	new Vector(-70, '40% height'), // initial position
	new Vector(20, 20),  // initial velocitity
	-Math.PI * 0.2,      // initial engine angle
	0                    // initial thrust amount
];
let terrainPrecision = 5;

function launchSimulation() {
	let populationSize  = 50;
	let hiddenNeurons   = 50;
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
