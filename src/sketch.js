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
			// engineConf.plotter.offset = {
			// 	x : 0,
			// 	y : 0.85 * engineConf.plotter.scale.y / 2
			// };
		})
		// .addObjects(Simulator)
		// .addObjects(PerceptronTest)
		.addObjects(NeuralNetworkTest)
	;
}
