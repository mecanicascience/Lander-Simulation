class PerceptronTest {
    constructor() {
        this.perceptron = new Perceptron(3, 0.01, [-1, 1]);

        this.dots = [];
        for (let i = 0; i < 2000; i++) {
            let x = random(-70, 70);
            let y = random(-70, 70);

            this.dots.push(new Dot(x, y, y < this.f(x) ? -1 : 1));
        }

        this.count = 0;
    }

    update(dt) { }

    draw(drawer) {
        // === Done in for loop for animations purposes, should be done in update(dt)
        for (let i = 0; i < this.count; i++) {
            this.perceptron.train(
                this.dots[i].inputs,
                this.dots[i].answer
            );
        }
        this.count = (this.count + 1) % this.dots.length;
        // ===

        for (let i = 0; i < this.count; i++) {
            let color = 'rgba(0, 0, 0, 0)';
            let guess = this.perceptron.estimate(this.dots[i].inputs);
            if (guess > 0)
                color = 'rgba(70, 200, 70, 0.8)';
            else
                color = 'rgba(200, 70, 70, 0.8)';

            this.dots[i].draw(drawer, color);
        }

        // Draws f(x)
        drawer.noFill().stroke(255);
        for (let i = -100; i < 100; i++) {
            drawer.line(i, this.f(i), i+1, this.f(i+1));
        }
    }


    f(x) {
        return 0.2 * x + 0;
    }
}

class Dot {
    constructor(x, y, answer) {
        this.pos    = new Vector(x, y);
        this.inputs = [x, y, 1];
        this.answer = answer;
    }

    draw(drawer, color) {
        drawer
            .stroke(255, 255, 255, 0.8)
            .fill(color)
            .ellipse(this.pos.x, this.pos.y, 10, 10, true);
    }
}
