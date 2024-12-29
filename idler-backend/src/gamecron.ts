import { Elysia, t } from "elysia";
import { app } from ".";
import { db } from "./lib/db";
import { cron, Patterns } from "@elysiajs/cron";
import { User } from "@prisma/client";

export const gamecron = new Elysia()
	.use(
		cron({
			name: "Send Stuff",
			pattern: "* * * * * *",
			async run() {
				await db.$transaction(async (tx) => {
					const gameroot = await tx.gameRoot.findFirst({
						include: {
							GameItems: true,
						},
					});
					const userroot = await tx.user.findMany({
						orderBy: {
							createdAt: "desc",
						},
					});
					const gameitems = await tx.gameItems.findMany();

					let actual_mult = gameroot!.multiplier;
					const gameitemsfiltered = gameitems.filter(
						(v) => !v.idle_timer && v.amount > 0
					);
					gameitemsfiltered.forEach((item) => {
						actual_mult += item.multiplier * item.amount;
					});
					gameroot!.multiplier = actual_mult;

					if (gameroot!.finished) {
						app.server?.publish(
							"idle",
							JSON.stringify({
								isFinished: gameroot!.finished,
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
			},
		})
	)
	.use(
		cron({
			name: "Idle every 5s",
			pattern: Patterns.everySenconds(5),
			async run() {
				await db.$transaction(async (tx) => {
					const gameroot = await tx.gameRoot.findFirst({
						include: {
							GameItems: true,
						},
					});
					const gameitems = await tx.gameItems.findMany({
						where: {
							idle_timer: 5,
							amount: {
								gt: 0,
							},
						},
					});

					gameitems.forEach(async (item) => {
						let actual_mult = gameroot!.multiplier;
						gameitems.forEach((item) => {
							actual_mult += item.multiplier * item.amount;
						});
						gameroot!.multiplier = actual_mult;

						const user_adder =
							gameroot!.permanent_multiplier *
							(gameroot!.multiplier * item.idle_adder!);

						const users: User[] =
							await db.$queryRaw`SELECT * FROM User ORDER BY RANDOM() LIMIT 1;`;
						const user = users.at(0)!;

						await db.user.update({
							where: {
								id: user.id,
							},
							data: {
								points: {
									increment: user_adder,
								},
							},
						});
					});
				});
			},
		})
	)
	.use(
		cron({
			name: "Idle every 1min",
			pattern: Patterns.everyMinute(),
			async run() {
				await db.$transaction(async (tx) => {
					const gameroot = await tx.gameRoot.findFirst({
						include: {
							GameItems: true,
						},
					});
					const gameitems = await tx.gameItems.findMany({
						where: {
							idle_timer: 60,
						},
					});

					gameitems.forEach(async (item) => {
						const user_adder =
							gameroot!.permanent_multiplier *
							(gameroot!.multiplier * item.idle_adder!);

						const users: User[] =
							await db.$queryRaw`SELECT * FROM User ORDER BY RANDOM() LIMIT 1;`;
						const user = users.at(0)!;

						await db.user.update({
							where: {
								id: user.id,
							},
							data: {
								points: {
									increment: user_adder,
								},
							},
						});
					});
				});
			},
		})
	)
	.use(
		cron({
			name: "Idle every 10mins",
			pattern: Patterns.EVERY_10_MINUTES,
			async run() {
				await db.$transaction(async (tx) => {
					const gameroot = await tx.gameRoot.findFirst({
						include: {
							GameItems: true,
						},
					});
					const gameitems = await tx.gameItems.findMany({
						where: {
							idle_timer: 100,
						},
					});

					gameitems.forEach(async (item) => {
						const user_adder =
							gameroot!.permanent_multiplier *
							(gameroot!.multiplier * item.idle_adder!);

						const users: User[] =
							await db.$queryRaw`SELECT * FROM User ORDER BY RANDOM() LIMIT 1;`;
						const user = users.at(0)!;

						await db.user.update({
							where: {
								id: user.id,
							},
							data: {
								points: {
									increment: user_adder,
								},
							},
						});
					});
				});
			},
		})
	);
