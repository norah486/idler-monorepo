import { Elysia, t } from "elysia";
import { app } from ".";
import { db } from "./lib/db";
import { User } from "@prisma/client";
import { deleteSessionTokenCookie, validateSessionToken } from "./lib/utils";

export const admin = new Elysia().post(
	"/admin",
	async ({ body, cookie: { session } }) => {
		if (!session.value) {
			return "Blocked";
		}
		const auth = await validateSessionToken(session.value);
		if (
			auth.session === null ||
			auth.user === null ||
			auth.user.discordId !== "284514065907318784"
		) {
			return "Blocked";
		}

		if (body?.name && body.cost) {
			await db.gameItems.create({
				data: {
					name: body.name,
					order: 55,
					descrition: body.description,
					idle_adder: body.idle_adder,
					idle_timer: body.idle_timer,
					multiplier: body.multiplier,
					cost: body.cost,
				},
			});
		}
		return "Hello";
	},
	{
		body: t.Optional(
			t.Object({
				name: t.String(),
				description: t.Optional(t.String()),
				idle_adder: t.Optional(t.Numeric()),
				idle_timer: t.Optional(t.Numeric()),
				multiplier: t.Numeric(),
				cost: t.Numeric(),
			})
		),
		cookie: t.Object({
			session: t.Optional(t.String()),
		}),
	}
);
