<script lang="ts">
  import Button from "./components/Button.svelte"
	
	export let value: string
	let valueKeys: string[]
	$: valueKeys = value.split('+')
	
	const mods = ['Control', 'Command', 'Option', 'Shift', 'Alt', 'AltGr', 'Super', 'Meta']

	let keyup: (e: KeyboardEvent) => void
	let keydown: (e: KeyboardEvent) => void
	let recording = false
	function record() {
		pressedKeys = []

		keyup = (e: KeyboardEvent) => {
			e.stopPropagation()
			e.preventDefault()
			keys = keys.filter(v=>v!==e.key.toLocaleLowerCase())
			
			if (keys.length === 0) {
				done(pressedKeys)
			}
		}
		window.addEventListener('keyup', keyup)
		
		keydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				done([])
				return
			}
			e.stopPropagation()
			e.preventDefault()
			if (pressedKeys.find(v=>v===e.key||v===e.key.toLocaleLowerCase()||v===e.key.toLocaleUpperCase())) return
			keys = [...keys, e.key.toLocaleLowerCase()]
			pressedKeys = [...pressedKeys, e.key].sort((a,b) => {
				let isModA = mods.includes(a)
				let isModB = mods.includes(b)
				if (isModA && !isModB) {
					return -1
				} else if (!isModA && isModB) {
					return 1
				}
				return 0
			})
		}

		window.addEventListener('keydown', keydown)

		recording = true
	}
	function done(pressedKeys: string[]) {
		window.removeEventListener('keyup', keyup)
		window.removeEventListener('keydown', keydown)

		recording = false
		if (pressedKeys.length > 0) {
			value = pressedKeys.map(v=>mods.includes(v)?v:v.toLocaleUpperCase()).join('+')
		}
	}
	function clear() {
		recording = false
		value = ''
	}
	
	let keys: string[] = []
	let pressedKeys: string[] = []

</script>

<main>
	<input disabled value={recording?pressedKeys.join('+'):valueKeys.join('+')}/>
	<Button on:click={record}>Record</Button>
	<Button on:click={clear}>Clear</Button>
</main>
{#if recording}
	<aside>
		{pressedKeys.join('+')}
	</aside>
{/if}

<style>
	aside {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.7);
		font-size: 200%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}
</style>