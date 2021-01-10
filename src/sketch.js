let sim = null;


function launchSimulation() {
	let populationSize = 1;
	sim.newPopulation(
		populationSize,
		Array(populationSize).fill({
			input_nodes  : 20,
			hidden_nodes : 20,
			output_nodes : 20
		})
	);
	// sim.loadPopulation(_str_);


	sim.displays('vessel');
	sim.displays('brain', 0);
	sim.start();


	// Save population to console to a String
	// let pop = sim.savePopulation();
	// sim.loadPopulation(pop);
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
