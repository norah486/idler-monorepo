<script lang="ts">
	import { goto } from '$app/navigation';
	import data from '$lib/store/data';
	import type { Root, User } from '$lib/types';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let root: Root | undefined = $state();
	let authenticated = $state(false);
	let rootUserId: string | undefined = $state();
	let rootUser: User | undefined = $derived(
		root?.users.filter((v) => v.id === rootUserId).at(0),
	);
	let socketState: boolean = $state(true);
	let finished = $state(false);
	let final_message = $state('');

	$effect(() => {
		if (root) {
			if (root!.game.finished) {
				finished = true;
				final_message = root!.game.message || '';
			}
		}
	});

	onMount(async () => {
		const isFinished = await (
			await fetch('http://localhost:3000/finished')
		).json();
		if (isFinished.isFinished) {
			loading = false;
			finished = true;
			final_message = isFinished.message;
		} else {
			data.subscribe((dataStore) => {
				if (dataStore) {
					root = JSON.parse(dataStore);
				}
			});

			data.closed((state) => {
				socketState = state;
			});

			const uservalidation = await fetch(
				'http://localhost:3000/validate',
				{
					credentials: 'include',
				},
			);
			const authvalidation = await uservalidation.json();

			console.log(authvalidation.unauthorized);
			if (authvalidation.unauthorized) {
				authenticated = false;
			} else {
				authenticated = true;
			}

			rootUserId = document.cookie
				.split('; ')
				.find((row) => row.startsWith('user_id='))
				?.split('=')[1];

			loading = false;
		}
	});

	$effect(() => {
		if (root?.unauthorized === true) {
			authenticated = false;
		}
	});

	function increment() {
		data.sendIncrement();
	}

	function transfer(to: string) {
		data.sendTransfer(to);
	}

	function transfer10(to: string) {
		data.sendTransfer10(to);
	}

	function transfer100(to: string) {
		data.sendTransfer100(to);
	}

	function ascend1() {
		data.ascend1();
	}

	function ascend2() {
		data.ascend2();
	}

	function endItAll() {
		data.endItAll();
		window.location.href = window.location.origin;
	}

	function buy(item_id: number) {
		data.buy(item_id);
	}

	function gamble() {
		data.gamble();
	}
</script>

<svelte:head>
	<title>Collaborate</title>
</svelte:head>

{#if loading}
	<div class="flex flex-1 justify-center h-full items-center">
		<div role="status">
			<svg
				aria-hidden="true"
				class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
				viewBox="0 0 100 101"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
					fill="currentColor"
				/>
				<path
					d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
					fill="currentFill"
				/>
			</svg>
			<span class="sr-only">Loading...</span>
		</div>
	</div>
{:else}
	<div class="flex flex-1 flex-col px-12">
		<h1 class="text-3xl font-bold text-center">Collaborate</h1>
		{#if finished}
			<div
				class="flex flex-1 justify-center text-center items-center text-3xl font-bold flex-col pt-12"
			>
				<div class="font-bold text-3xl">This game has concluded.</div>
				<div class="text-2xl font-semibold">{final_message}</div>
				<a
					href="https://ko-fi.com/norah486"
					class="flex underline text-purple-500 hover:text-purple-400"
					>https://ko-fi.com/norah486</a
				>
				<a
					href="https://github.com/norah486/"
					class="flex underline text-purple-500 hover:text-purple-400"
					>https://github.com/norah486/</a
				>
				<div class="font-normal text-lg pt-2">Discord: norah._</div>
			</div>
		{:else}
			{#if socketState}
				<div class="text-center text-red-500 text-sm">
					You are disconnected
				</div>
			{/if}
			<div class="text-center text-slate-400 text-lg">
				Permanent Multiplier: x{root?.game.permanent_multiplier}
			</div>
			<div class="text-center">Multiplier: x{root?.game.multiplier}</div>

			<div class="text-center">Ascension: {root?.game.ascension}/2</div>
			<div class="flex justify-center pt-5">
				{#if authenticated}
					<div class="flex flex-col gap-y-1">
						<button
							class="p-2 bg-orange-600 rounded-xl font-bold hover:bg-orange-600/70 transition-all"
							onclick={increment}
						>
							Increment
						</button>

						<button
							class="p-2 bg-teal-700 rounded-xl font-bold hover:bg-teal-600 transition-all"
							onclick={gamble}
						>
							Gamble
						</button>

						{#if root!.users.filter((v) => v.points > 700000).length > 0 && root!.game.ascension === 0}
							<button
								class={root!.users.filter(
									(v) => v.points >= 10000000,
								).length > 0
									? 'p-2 bg-yellow-500 rounded-xl font-bold hover:bg-yellow-400/90 transition-all mt-2'
									: 'p-2 bg-red-400/30 rounded-xl font-bold disabled cursor-not-allowed mt-2'}
								onclick={ascend1}
							>
								Ascend (10,000,000)
							</button>
						{/if}

						{#if root!.users.filter((v) => v.points > 20000000).length > 0 && root!.game.ascension === 1}
							<button
								class={root!.users.filter(
									(v) => v.points >= 50000000,
								).length > 0
									? 'p-2 bg-yellow-500 rounded-xl font-bold hover:bg-yellow-400/90 transition-all mt-2'
									: 'p-2 bg-red-400/30 rounded-xl font-bold disabled cursor-not-allowed mt-2'}
								onclick={ascend2}
							>
								Ascend (50,000,000)
							</button>
						{/if}

						{#if root!.users.filter((v) => v.points > 50000000).length > 0 && root!.game.ascension === 2}
							<button
								class={root!.users.filter(
									(v) => v.points >= 100000000,
								).length > 0
									? 'p-2 bg-yellow-500 rounded-xl font-bold hover:bg-yellow-400/90 transition-all mt-2'
									: 'p-2 bg-red-400/30 rounded-xl font-bold disabled cursor-not-allowed mt-2'}
								onclick={endItAll}
							>
								End the game (100,000,000)
							</button>
						{/if}
					</div>
				{:else}
					<a
						class="p-2 bg-[#5865F2] rounded-xl font-bold hover:bg-[#4751c0] transition-all flex gap-x-2 items-center"
						href="http://localhost:3000/login"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 127.14 96.36"
							class="w-6 h-6"
							><path
								fill="#fff"
								d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
							/></svg
						>
						Log in with Discord
					</a>
				{/if}
			</div>

			<div
				class="flex flex-1 pt-2 gap-x-2 justify-center flex-wrap gap-y-6"
			>
				<div
					class="p-1 px-4 border-4 rounded-md border-purple-400 bg-black justify-center flex flex-col"
				>
					<b class="font-bold text-center">Shop</b>
					<b class="text-center text-xs text-gray-400 pb-2">
						(Click to buy)
					</b>
					<div class="flex gap-x-2 flex-wrap">
						<!-- Item -->
						{#if root}
							{#each root.gameShop as shopItem}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<div
									class={root.users.filter(
										(v) => v.points >= shopItem.cost,
									).length > 0
										? `flex flex-1 bg-slate-700 border-4 rounded-sm px-2 py-1 mb-1 min-w-56 opacity-85 hover:opacity-100 transition-all select-none
									${rootUser && rootUser.points >= shopItem.cost ? 'hover:bg-green-900 hover:scale-105 hover:cursor-pointer border-green-400' : 'border-green-800/50'}
									`
										: 'flex flex-1 bg-slate-700 border-red-400/60 border-4 rounded-sm px-2 py-1 mb-1 min-w-56 opacity-85 hover:opacity-100 transition-all hover:cursor-not-allowed select-none hover:bg-red-900/50'}
									onclick={() => buy(shopItem.id)}
								>
									<div class="flex flex-col">
										<div class="flex flex-1 font-bold">
											{shopItem.name}
										</div>
										{#if shopItem.descrition}
											<div class="flex flex-1 text-sm">
												{shopItem.descrition}
											</div>
										{:else}
											<div class="flex flex-1 text-sm">
												Adds x
												<text class="font-bold">
													{shopItem.multiplier}&nbsp;
												</text>
												to the multiplier
											</div>
										{/if}
										<div class="flex flex-1">
											Cost:&nbsp;
											<text
												class="text-emerald-500 font-semibold"
												>${shopItem.cost}</text
											>
										</div>
										<div
											class="flex flex-1 text-slate-400 text-sm"
										>
											Amount: {shopItem.amount}
										</div>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>

			<div
				class="flex flex-1 pt-2 gap-x-2 justify-center flex-wrap gap-y-6 pb-12"
			>
				{#if root}
					{#each { length: 1 } as l}
						{#each root.users as user}
							<div class="flex flex-col">
								<div class="flex flex-1 justify-center">
									<img
										src="https://cdn.discordapp.com/avatars/{user.discordId}/{user.avatar}"
										class="rounded-full w-32 h-32"
										alt="{user.name}'s picture"
									/>
								</div>
								<div
									class="flex flex-1 flex-col justify-center pb-2"
								>
									<div class="h-full">
										<b
											class="font-bold text-center flex flex-1 justify-center"
										>
											{user.name}
										</b>
										<div
											class="flex flex-1 justify-center text-xs text-slate-400"
										>
											({user.username})
										</div>
										<div class="flex flex-1 justify-center">
											Points: {Math.floor(user.points)}
										</div>
									</div>
								</div>
								{#if rootUser && rootUser.id !== user.id && authenticated}
									<button
										class="{Math.floor(rootUser.points) ===
										0
											? 'bg-red-800'
											: 'bg-green-600 hover:bg-green-800'} p-1 rounded-md transition-all"
										disabled={Math.floor(
											rootUser.points,
										) === 0}
										onclick={() => transfer(user.id)}
										>Send 1 point</button
									>

									<button
										class="{Math.floor(rootUser.points) < 10
											? 'bg-red-800'
											: 'bg-green-600 hover:bg-green-800'} p-1 rounded-md transition-all mt-2"
										disabled={Math.floor(rootUser.points) <
											10}
										onclick={() => transfer10(user.id)}
										>Send 10 points</button
									>

									<button
										class="{Math.floor(rootUser.points) <
										100
											? 'bg-red-800'
											: 'bg-green-600 hover:bg-green-800'} p-1 rounded-md transition-all mt-2"
										disabled={Math.floor(rootUser.points) <
											100}
										onclick={() => transfer100(user.id)}
										>Send 100 points</button
									>
								{/if}
							</div>
						{/each}
					{/each}
				{/if}
			</div>
		{/if}
	</div>
{/if}
