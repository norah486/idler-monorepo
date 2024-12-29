import { Elysia, t } from "elysia";
import { app } from ".";
import { db } from "./lib/db";
import { User } from "@prisma/client";
import { deleteSessionTokenCookie, validateSessionToken } from "./lib/utils";

export const game = new Elysia().ws("/game", {
	async open(ws) {
		ws.subscribe("idle");

		try {
			await db.$transaction(async (tx) => {
				const gameroot = await tx.gameRoot.findFirst({
					include: {
						GameItems: true,
					},
				});
				const userroot = await tx.user.findMany();

				const gameitems = await tx.gameItems.findMany();

				let actual_mult = gameroot!.multiplier;
				const gameitemsfiltered = gameitems.filter(
					(v) => !v.idle_timer
				);
				gameitemsfiltered.forEach((item) => {
					actual_mult += item.multiplier * item.amount;
				});
				gameroot!.multiplier = actual_mult;

				ws.send(
					JSON.stringify({
						game: gameroot,
						users: userroot,
						gameShop: gameitems,
					})
				);
			});
		} catch (err) {
			ws.send({
				error: true,
				data: false,
			});
		}
	},
	async message(ws, message) {
		if (!ws.data.cookie.session.value) {
			try {
				await db.$transaction(async (tx) => {
					const gameroot = await tx.gameRoot.findFirst({
						include: {
							GameItems: true,
						},
					});
					const userroot = await tx.user.findMany();

					const gameitems = await tx.gameItems.findMany();

					let actual_mult = gameroot!.multiplier;
					gameitems.forEach((item) => {
						actual_mult += item.multiplier * item.amount;
					});
					gameroot!.multiplier = actual_mult;

					ws.send({
						game: gameroot,
						users: userroot,
						gameShop: gameitems,
						unauthorized: true,
					});
				});
			} catch (err) {
				ws.send({
					error: true,
					data: false,
				});
			}
			return;
		}
		const auth = await validateSessionToken(ws.data.cookie.session.value);
		if (auth.session === null || auth.user === null) {
			deleteSessionTokenCookie(ws.data.cookie.session);

			try {
				await db.$transaction(async (tx) => {
					const gameroot = await tx.gameRoot.findFirst({
						include: {
							GameItems: true,
						},
					});
					const userroot = await tx.user.findMany();

					const gameitems = await tx.gameItems.findMany();

					let actual_mult = gameroot!.multiplier;
					gameitems.forEach((item) => {
						actual_mult += item.multiplier * item.amount;
					});
					gameroot!.multiplier = actual_mult;

					ws.send({
						game: gameroot,
						users: userroot,
						gameShop: gameitems,
						unauthorized: true,
					});
				});
			} catch (err) {
				ws.send({
					error: true,
					data: false,
				});
			}

			return;
		}

		switch (message.operation) {
			case "increment":
				try {
					const users: User[] =
						await db.$queryRaw`SELECT * FROM User ORDER BY RANDOM() LIMIT 1;`;
					const user = users.at(0)!;

					await db.$transaction(async (tx) => {
						const game = await tx.gameRoot.findFirst();

						const gameitems = await tx.gameItems.findMany();
						let actual_mult = game!.multiplier;
						const gameitemsfiltered = gameitems.filter(
							(v) => !v.idle_timer
						);
						gameitemsfiltered.forEach((item) => {
							actual_mult += item.multiplier * item.amount;
						});
						game!.multiplier = actual_mult;

						await tx.user.update({
							data: {
								points: {
									increment:
										game!.permanent_multiplier *
										(game!.multiplier * 1),
								},
							},
							where: {
								id: user.id,
							},
						});
					});
				} catch (err) {
					throw new Error("UNKNOWN");
				}
				break;
			case "transfer":
				try {
					await db.$transaction(async (tx) => {
						const sender = await tx.user.update({
							data: {
								points: {
									decrement: 1,
								},
							},
							where: {
								id: auth.user.id,
							},
						});

						if (sender.points < 0) {
							throw new Error("NO_BALANCE");
						}

						await tx.user.update({
							data: {
								points: {
									increment: 1,
								},
							},
							where: {
								id: message.to,
							},
						});
					});
				} catch (err) {
					return;
				}
				break;

			case "transfer10":
				try {
					await db.$transaction(async (tx) => {
						const sender = await tx.user.update({
							data: {
								points: {
									decrement: 10,
								},
							},
							where: {
								id: auth.user.id,
							},
						});

						if (sender.points < 0) {
							throw new Error("NO_BALANCE");
						}

						await tx.user.update({
							data: {
								points: {
									increment: 10,
								},
							},
							where: {
								id: message.to,
							},
						});
					});
				} catch (err) {
					return;
				}
				break;

			case "transfer100":
				try {
					await db.$transaction(async (tx) => {
						const sender = await tx.user.update({
							data: {
								points: {
									decrement: 100,
								},
							},
							where: {
								id: auth.user.id,
							},
						});

						if (sender.points < 0) {
							throw new Error("NO_BALANCE");
						}

						await tx.user.update({
							data: {
								points: {
									increment: 100,
								},
							},
							where: {
								id: message.to,
							},
						});
					});
				} catch (err) {
					return;
				}
				break;

			case "buy":
				try {
					await db.$transaction(async (tx) => {
						const item = await tx.gameItems.findUniqueOrThrow({
							where: {
								id: message.item_id,
							},
						});
						if (!item) throw new Error("What are you doing");

						const buyer = await tx.user.update({
							data: {
								points: {
									decrement: item.cost,
								},
							},
							where: {
								id: auth.user.id,
							},
						});

						if (buyer.points < 0) {
							throw new Error("NO_BALANCE");
						}

						const playerCount = await tx.user.count();
						const newCost =
							(item.adder + item.cost) * (1 + playerCount / 10);

						await tx.gameItems.update({
							data: {
								gameRootId: 0,
								cost: newCost,
								amount: {
									increment: 1,
								},
							},
							where: {
								id: message.item_id,
							},
						});
					});
				} catch (err) {
					return;
				}
				break;

			case "ascend1":
				try {
					await db.$transaction(async (tx) => {
						const game = await tx.gameRoot.findFirst();
						if (game!.ascension !== 0) throw new Error("bruh");
						const ascender = await tx.user.update({
							data: {
								points: {
									decrement: 10000000,
								},
							},
							where: {
								id: auth.user.id,
							},
						});

						if (ascender.points < 0) {
							throw new Error("NO_BALANCE");
						}

						await tx.gameRoot.updateMany({
							data: {
								multiplier: 1,
								permanent_multiplier: 4,
								ascension: 1,
							},
						});

						await tx.user.updateMany({
							data: {
								points: 0,
							},
						});
						await tx.gameItems.deleteMany();
					});
				} catch (err) {
					return;
				}
				break;

			case "ascend2":
				try {
					await db.$transaction(async (tx) => {
						const game = await tx.gameRoot.findFirst();
						if (game!.ascension !== 1) throw new Error("bruh");
						const ascender = await tx.user.update({
							data: {
								points: {
									decrement: 50000000,
								},
							},
							where: {
								id: auth.user.id,
							},
						});

						if (ascender.points < 0) {
							throw new Error("NO_BALANCE");
						}

						await tx.gameRoot.updateMany({
							data: {
								multiplier: 1,
								permanent_multiplier: 8,
								ascension: 2,
							},
						});

						await tx.user.updateMany({
							data: {
								points: 0,
							},
						});
						await tx.gameItems.deleteMany();
					});
				} catch (err) {
					return;
				}
				break;
			case "endItALl":
				try {
					await db.$transaction(async (tx) => {
						const game = await tx.gameRoot.findFirst();
						if (game!.ascension !== 1) throw new Error("bruh");
						const ascender = await tx.user.update({
							data: {
								points: {
									decrement: 100000000,
								},
							},
							where: {
								id: auth.user.id,
							},
						});

						if (ascender.points < 0) {
							throw new Error("NO_BALANCE");
						}

						await db.gameRoot.updateMany({
							data: {
								finished: true,
								message: "Thank you for playing.",
							},
						});

						await tx.user.updateMany({
							data: {
								points: 0,
							},
						});
						await tx.gameItems.deleteMany();

						app.server?.publish(
							"idle",
							JSON.stringify({
								finished: true,
								message: "Thanks for playing",
							})
						);
					});
				} catch (err) {
					return;
				}
				break;
			case "gamble":
				try {
					await db.$transaction(async (tx) => {
						const game = await tx.gameRoot.findFirst();
						const gambler = await tx.user.findUniqueOrThrow({
							where: {
								id: auth.user.id,
							},
						});

						let rng;
						if (gambler.points >= 30000000) {
							rng = Math.floor(Math.random() * 7);
						} else {
							rng = Math.floor(Math.random() * 11);
						}

						if (rng < 6) {
							await tx.user.update({
								where: {
									id: gambler?.id,
								},
								data: {
									points: 0,
								},
							});
						} else {
							await tx.user.update({
								where: {
									id: gambler.id,
								},
								data: {
									points: gambler.points * 2,
								},
							});
						}
					});
				} catch (err) {
					return;
				}

				break;
			default:
		}

		try {
			await db.$transaction(async (tx) => {
				const gameroot = await tx.gameRoot.findFirst({
					include: {
						GameItems: true,
					},
				});
				const userroot = await tx.user.findMany();
				const gameitems = await tx.gameItems.findMany();

				let actual_mult = gameroot!.multiplier;

				const gameitemsfiltered = gameitems.filter(
					(v) => !v.idle_timer
				);
				gameitemsfiltered.forEach((item) => {
					actual_mult += item.multiplier * item.amount;
				});
				gameroot!.multiplier = actual_mult;

				if (gameroot!.finished) {
					app.server?.publish(
						"idle",
						JSON.stringify({
							finished: gameroot!.finished,
							message: gameroot?.message,
						})
					);
				} else {
					app.server?.publish(
						"idle",
						JSON.stringify({
							game: gameroot,
							users: userroot,
							gameShop: gameitems,
						})
					);
				}
			});
		} catch (err) {
			ws.send({
				error: true,
				data: false,
			});
		}
	},
	close(ws, code, message) {
		ws.unsubscribe("idle");
	},
	body: t.Object({
		operation: t.Optional(t.String()),
		to: t.Optional(t.String()),
		item_id: t.Optional(t.Numeric()),
	}),
	cookie: t.Object({
		session: t.Optional(t.String()),
	}),
	idleTimeout: 50000,
});
