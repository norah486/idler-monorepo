import { Elysia, error } from "elysia";
import { auth } from "./lib/auth";
import { db } from "./lib/db";
import { game } from "./game";
import { gamecron } from "./gamecron";
import { admin } from "./admin";

export const app = new Elysia()
	.use(auth)
	.get("/", ({ redirect }) => {
		return redirect("http://localhost:5173");
	})
	.get("/user-list", async () => {
		return await db.user.findMany();
	})
	.get("/init", async () => {
		await db.gameRoot.create({
			data: {
				id: 0,
			},
		});
	})
	.get("finished", async () => {
		const g = await db.gameRoot.findFirst();
		return JSON.stringify({
			isFinished: g!.finished,
			message: g!.message,
		});
	})
	.use(game)
	.use(gamecron)
	.use(admin)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
