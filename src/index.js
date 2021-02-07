import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
	const className = props.winner ? "square winner" : "square";

	return (
		<button className={className} onClick={props.onClick}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i, winner) {
		return (
			<Square
				key={i}
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
				winner={winner}
			/>
		);
	}

	render() {
		const winnerPositions = this.props.winnerPositions;

		let squares = [];
		for (let i = 0; i < 3; i++) {
			let row = [];
			for (let j = 0; j < 3; j++) {
				let win = winnerPositions && winnerPositions.includes(i * 3 + j);

				row[j] = this.renderSquare(i * 3 + j, win);
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
			movesAscendent: true,
		};
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();

		if (calculateWinner(squares) || squares[i]) {
			return;
		}

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
			movesAscendent: this.state.movesAscendent,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: !(step % 2),
		});
	}

	revertMoves() {
		this.setState({
			movesAscendent: !this.state.movesAscendent,
		});
	}

	restartGame() {
		this.setState({
			history: [
				{
					squares: Array(9).fill(null),
					position: { row: 0, col: 0 },
				},
			],
			stepNumber: 0,
			xIsNext: true,
			movesAscendent: true,
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winnerPositions = calculateWinner(current.squares);

		const winner = winnerPositions ? current.squares[winnerPositions[0]] : null;

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

		let status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
		if (winner) {
			status = `Winner: ${winner}`;
		} else if (this.state.stepNumber === 9 && moves.length === 10) {
			status = "It's a draw 💪🏽";
		}

		const revertLabel = (
			<button className="button" onClick={() => this.revertMoves()}>
				{this.state.movesAscendent ? "Sort moves desc" : "Sort moves asc"}
			</button>
		);

		const restartButton = (
			<button
				className="button restart-button"
				onClick={() => this.restartGame()}
			>
				Restart game
			</button>
		);

		if (!this.state.movesAscendent) {
			moves = moves.reverse();
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
						winnerPositions={winnerPositions}
					/>
				</div>
				<div className="game-info">
					<div className="status-label">{status}</div>
					<div>{restartButton}</div>
					<div>{revertLabel}</div>
				</div>
				<div className="game-moves">
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
			return lines[i];
		}
	}

	return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
