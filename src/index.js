import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
	return (
		<button className="square" onClick={props.onClick}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		return (
			<Square
				key={i}
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
			/>
		);
	}

	render() {
		let rowNumber = 3,
			colNumber = 3;

		let squares = [];
		for (let i = 0; i < rowNumber; i++) {
			let row = [];
			for (let j = 0; j < colNumber; j++) {
				row[j] = this.renderSquare(i * colNumber + j);
			}
			squares.push(
				<div key={i} className="board-row">
					{row}
				</div>
			);
		}

		return <div>{squares}</div>;
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [
				{
					squares: Array(9).fill(null),
					position: { row: 0, col: 0 },
				},
			],
			stepNumber: 0,
			xIsNext: true,
			movesAsc: true,
		};
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();

		if (calculateWinner(squares) || squares[i]) {
			return;
		}

		const movesAsc = this.state.movesAsc;
		squares[i] = this.state.xIsNext ? "X" : "O";
		this.setState({
			history: history.concat([
				{
					squares: squares,
					position: {
						row: (i % 3) + 1,
						col: Math.floor(i / 3) + 1,
					},
				},
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
			movesAsc: movesAsc,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: !(step % 2),
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);

		let moves = history.map((step, move) => {
			const pos = move ? `(${step.position.col}, ${step.position.row})` : "";
			const desc = (move ? `Go to move # ${move} ` : "Go to game start ") + pos;

			const result = this.state.stepNumber === move ? "is-active" : "";

			return (
				<li key={move}>
					<button className={result} onClick={() => this.jumpTo(move)}>
						{desc}
					</button>
				</li>
			);
		});

		if (!this.state.movesAsc) moves = moves.reverse();

		let status;
		if (winner) {
			status = `Winner: ${winner}`;
		} else {
			status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
		}

		const revertMoves = (
			<button
				className="button"
				onClick={() => (this.state.movesAsc = !this.state.movesAsc)}
			>
				{this.state.movesAsc ? "Sort moves desc" : "Sort moves asc"}
			</button>
		);

		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<div>{revertMoves}</div>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
}

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];

	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}

	return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
