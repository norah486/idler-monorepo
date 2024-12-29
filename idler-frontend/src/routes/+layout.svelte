<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="h-screen text-slate-200 pt-12">
	{@render children()}
</div>

<style lang="postcss">
	:global(body) {
		background-color: #1e293b;
	}
</style>
