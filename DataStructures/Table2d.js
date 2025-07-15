module.exports = class Table2d {
	constructor(rows, columns) {
		this.rows = rows;
		this.columns = columns;
		this.data = Array.from({ length: rows }, () => Array(columns).fill(null));
	}

	set(row, column, value) {
		if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
			throw new Error('Index out of bounds');
		}
		this.data[row][column] = value;
	}

	get(row, column) {
		if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
			throw new Error('Index out of bounds');
		}
		return this.data[row][column];
	}

	fill(value) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.columns; j++) {
				this.data[i][j] = value;
			}
		}
		return this;
	}

	drawBox(x1, x2, y1, y2, value, fill = true) {
		const minX = Math.max(0, Math.min(x1, x2));
		const maxX = Math.min(this.columns - 1, Math.max(x1, x2));
		const minY = Math.max(0, Math.min(y1, y2));
		const maxY = Math.min(this.rows - 1, Math.max(y1, y2));
		for (let i = minY; i <= maxY; i++) {
			for (let j = minX; j <= maxX; j++) {
				if (
					fill ||
					i === minY || i === maxY ||
					j === minX || j === maxX
				) {
					this.set(i, j, value);
				}
			}
		}
	}

	toArray() {
		return this.data;
	}
}
