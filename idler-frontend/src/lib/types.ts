interface Game {
	id: number;
	multiplier: number;
	permanent_multiplier: number;
	ascension: number;
	GameItems: GameItem[];
	finished: boolean;
	message?: string;
}

export interface GameItem {
	id: number;
	name: string;
	descrition?: string;
	order: number;
	amount: number;
	adder: number;
	idle_adder: number;
	idle_timer: number;
	multiplier: number;
	cost: number;
	createdAt: Date;
	gameRootId: number;
}

export interface User {
	id: string;
	discordId: string;
	username: string;
	name: string;
	avatar: string;
	points: number;
	UserItems: UserItem[];
}

interface UserItem {
	id: number;
	name: string;
	order: number;
	amount: number;
	createdAt: Date;
	purchasable: boolean;
	userId: string;
}

export interface Root {
	game: Game;
	users: User[];
	unauthorized?: boolean;
	gameShop: GameItem[];
}
