class Matrix {
    /**
    * Creates a new Matrix stored as datas[row][col]
    * @param rows Rows number
    * @param cols Columns number
    */
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;

        this.datas = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    /**
    * @return the element at Matrix[i][j]
    */
    get(i, j) {
        if (this.datas[i] == undefined) {
            console.error(`The matrix element at (${i}, ${j}) is undefined.`);
            return null;
        }
        return this.datas[i][j];
    }

    /**
    * Randomize each coefficient of the Matrix
    * @param min Minimum random number (default 0)
    * @param max Maximum random number (default 1)
    * @return this, as the modified Matrix
    */
    randomize(min = 0, max = 1) {
        return this.map((el, i, j, min, max) => random(min, max), min, max);
    }

    /**
    * Executes a function on each terme of the matrix.
    * The function should return the new value of the corresponding element.
    * @param fun The function ran as fun(element, element_row_index, element_column_index, args)
    * @param args Arguments passed to the function as `map(your_function, arg0, arg1, ...)`
    * @return this, as the modified Matrix
    */
    map(fun, ...args) {
        return this.datas = this.datas.map((row, j) => row.map((el, i) => fun(el, i, j, ...args)));
    }

    /**
    * @return the maximum value of every coefficients in the Matrix
    */
    max() {
        let max = -Infinity;
        this.datas.forEach(el => max = Math.max(...el) > max ? Math.max(...el) : max);
        return max;
    }

    /**
    * @return the minimum value of every coefficients in the Matrix
    */
    min() {
        let min = +Infinity;
        this.datas.forEach(el => min = Math.min(...el) < min ? Math.min(...el) : min);
        return min;
    }



    /**
    * Logs the matrix to the developer console
    * @return this
    */
    log() {
        console.table(this.datas);
        return this;
    }
}
