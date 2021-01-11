let sim = null;


function launchSimulation() {
	let populationSize  = 100;
	let hiddenNeurons   = 10;
	let controlers      = Array(populationSize).fill(NeuralNetworkControler);
	let controlersDatas = Array(populationSize).fill([ hiddenNeurons ]);

	// Last controler is an Human
	// controlers.push(HumanControler);
	// controlersDatas.push([ ]);

	sim.newPopulation(populationSize, controlers, controlersDatas);
	// sim.loadPopulation(_string_);


	sim.displays('vessel');
	// sim.displays('controler', 0);
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
		.addObjects(Simulator);

	// Global var for the NeuralNetworkHandler
	sim = _pSimulationInstance.plotter.objectsL[0];

	launchSimulation();
}
