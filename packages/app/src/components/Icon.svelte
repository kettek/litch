<script type='ts'>

	export let icon: string = ''

	let clazz: string = ''
	export { clazz as class}

	export let style: string = ''

	export let cursor: string = ''

	export let large: boolean = false

	const codes: Record<string, number> = {
		'burger': 0xe030,
		'settings': 0xe035,
		'assets': 0xe036,
		'service': 0xe037,
		'action': 0xe038,
		'stop': 0xe03a,
		'start': 0xe03b,
		'back': 0xe040,
		'forward': 0xe041,
		'up': 0xe042,
		'down': 0xe043,
		'checkmark': 0xe050,
		'add': 0xe051,
		'remove': 0xe052,
		'inactive': 0xe053,
		'active': 0xe054,
		'delete': 0xe055,
		'filter': 0xe056,
		'open': 0xe060,
		'resize': 0xe061,
		'dimensions': 0xe062,
		'position': 0xe063,
		'reload': 0xe064,
		'close': 0xe065,
		'open-folder': 0xe070,
		'duplicate': 0xe071,
		'link': 0xe072,
	}
	$: code = String.fromCharCode(codes[icon])
</script>

<div style={`${style||''}; ${large?'font-size:150%;':''} cursor: ${cursor}`} class={`${clazz||''}`} on:click>{code}</div>

<style>
	@font-face {
		font-family: 'litch-icons';
		src: url('../fonts/icons.ttf')
	}
	div {
		font-family: 'litch-icons';
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	div::before {
		display: block;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
</style>