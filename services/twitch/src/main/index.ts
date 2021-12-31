export async function load() {
	console.log('load')
}

export async function enable() {
	console.log('enable')
}

export async function disable() {
	console.log('disable')
}

export async function receive(msg: any) {
	console.log('receive', msg)
}