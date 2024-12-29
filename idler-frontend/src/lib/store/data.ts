import { writable } from 'svelte/store';

const dataStore = writable<string | null>();
const socketClosed = writable<boolean>(false);

const socket = new WebSocket('ws://localhost:3000/game');

// Connection opened
socket.addEventListener('open', function (event) {
	console.log("It's open");

	setInterval(() => {
		socket.send(
			JSON.stringify({
				ping: true,
			})
		);
	}, 5000);
});

// Listen for messages
socket.addEventListener('message', function (event) {
	dataStore.set(event.data);
});

socket.onclose = () => {
	socketClosed.set(true);
};

const sendIncrement = () => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'increment',
			})
		);
	}
};

const sendTransfer = (to: string) => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'transfer',
				to: to,
			})
		);
	}
};

const sendTransfer10 = (to: string) => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'transfer10',
				to: to,
			})
		);
	}
};

const sendTransfer100 = (to: string) => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'transfer100',
				to: to,
			})
		);
	}
};

const ascend1 = () => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'ascend1',
			})
		);
	}
};

const ascend2 = () => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'ascend2',
			})
		);
	}
};

const endItAll = () => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'endItALl',
			})
		);
	}
};

const buy = (item_id: number) => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'buy',
				item_id: item_id,
			})
		);
	}
};

const gamble = () => {
	if (socket.readyState <= 1) {
		socket.send(
			JSON.stringify({
				operation: 'gamble',
			})
		);
	}
};

export default {
	subscribe: dataStore.subscribe,
	closed: socketClosed.subscribe,
	sendIncrement,
	sendTransfer,
	sendTransfer10,
	sendTransfer100,
	ascend1,
	ascend2,
	endItAll,
	buy,
	gamble,
};
