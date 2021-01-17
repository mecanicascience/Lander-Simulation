class NEATNode {
    constructor(pos, id, type) {
        this.pos  = pos;
        this.id   = id;
        this.type = type; // input / output / cell

        this.prediction = null;

        this.connections = [];
    }

    predict(activationFunction) {
        // Prediction already calculated
        if (this.prediction != null)
            return this.prediction;

        // Calculate prediction
        this.prediction = 0;
        for (let i = 0; i < this.connections.length; i++) {
            let c = this.connections[i];
            if (c.nodeTo == this)
                this.prediction += c.weight * c.nodeFrom.predict(activationFunction);
        }

        this.prediction = activationFunction(this.prediction);
        return this.prediction;
    }


    clearPrediction() {
        this.prediction = null;
    }

    hasConnectionWith(node) {
        for (let i = 0; i < this.connections.length; i++) {
            if (
                   this.connections[i].nodeFrom == node
                || this.connections[i].nodeTo   == node
            ) return true;
        }
        return false;
    }


    draw(drawer, confScale) {
        this.drawn = true;

        // Draw this node
        let size = 10;
        let fade = Math.round(map(Math.abs(this.prediction) * 255, 0, 255, 70, 255));
        let colOut = this.prediction > 0 ? [0, fade, 0] : [fade, 0, 0];
        let colIn = [colOut[0]*0.6, colOut[1]*0.6, colOut[2]*0.6];

        drawer
            .fill(colIn)
            .stroke(colOut)
            .strokeWeight(1)
            .circle(
                this.pos.x * confScale.x,
                this.pos.y * confScale.y,
                size, true
            );

        // Draw each connection
        this.connections.forEach((el, i) => el.drawn ? '' : el.draw(drawer, confScale));
    }
}
