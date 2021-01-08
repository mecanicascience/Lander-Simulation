# Lander Simulation
Auto-lands an object to a specific point on the surface.

## Description
This project aims to let an AI land a vessel on a simulated 2D terrain with a simulated atmosphere, with wind and atmospheric disturbances, while targeting a specific point and minimizing vessel's fuel.

## References
 - G-Fold algorithm : how to land with a precision < 100 m on an other planet. G-Fold auto-computes the shortest way in terms of fuel to land on a specific target, based on the current position and velocity of the vessel (witch are unknown due to wind, and atmospheric instabilities) "[G-FOLD: A Real-Time Implementable Fuel Optimal Large Divert Guidance Algorithm for Planetary PinpointLanding](https://www.lpi.usra.edu/meetings/marsconcepts2012/pdf/4193.pdf)"
 - Landing fuel optimization for engines : "[Meditch, J. (1964). On the problem of optimal thrust programming for a lunar soft landing. IEEE Transactions on Automatic Control, 9(4), 477–484. doi:10.1109/tac.1964.1105758](https://ieeexplore.ieee.org/document/1105758)"
 - Convex programming algorithm for the numerical solution of the minimum fuel powered descent guidance problem associated with Mars pinpoint landing : "[Convex Programming Approach to Powered Descent Guidance for Mars Landing](https://arc.aiaa.org/doi/10.2514/1.27553)"
 - Landing cone optimisation : "[Lossless Convexification of Nonconvex ControlBound and Pointing Constraints of the SoftLanding Optimal Control Problem](http://www.larsblackmore.com/iee_tcst13.pdf)"
 - Rocket landing game and Deep-Learning algorithm in HTML5 "[openai/gym/gym/envs/box2d/lunar_lander.py](https://github.com/openai/gym/blob/2c50315aabab8e5d25a59bb12b430a18e152f01f/gym/envs/box2d/lunar_lander.py#L430)"
 - G-Fold algorithm python implementation "[jonnyhyman /
G-FOLD-Python](https://github.com/jonnyhyman/G-FOLD-Python)"

## Videos ideas
 1. Main physics Simulation
 1. Terrain Generation
 1. Atmosphere simulation
 1. Drag forces simulation
 1. Auto-lander (2 methods : G-Fold and Deep Reinforcement Learning)
