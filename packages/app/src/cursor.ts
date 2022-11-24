type CursorRequester {
	id: number
	priority: number
	cursor: string
}

let requesters: CursorRequester[] = []
let currentCursor: string = ''

function addRequester(o: CursorRequester) {
	if (requesters.find(v=>v.id === o.id)) return
	requesters.push(o)
	refresh()
}

function removeRequester(o: CursorRequester) {
	requesters = requesters.filter(v=>v.id!==o.id)
	refresh()
}

function refresh() {
	if (requesters.length === 0) {
		document.body.classList.remove('cursor-' + currentCursor)
		currentCursor = ''
		return
	}
	requesters.sort((a,b) => {
		if (a.priority > b.priority) {
			return -1
		}
		if (a.priority < b.priority) {
			return 1
		}
		return 0
	})
	document.body.classList.remove('cursor-' + currentCursor)
	document.body.classList.add('cursor-' + requesters[0].cursor)
	currentCursor = requesters[0].cursor
}

export function cursorHover(node: Node, which: string): void {
	let req: CursorRequester = {
		id: Math.random(),
		priority: 1,
		cursor: which,
	}

	const mouseover = () => {
		addRequester(req)
		document.body.classList.add('cursor-'+which)
	}
	const mouseout = () => {
		removeRequester(req)
		document.body.classList.remove('cursor-'+which)
	}

	node.addEventListener('mouseover', mouseover)
	node.addEventListener('mouseout', mouseout)

	return {
		destroy() {
			removeRequester(req)
			node.removeEventListener('mouseover', mouseover)
			node.removeEventListener('mouseout', mouseout)
		}
	}
}

export function cursorHold(node: Node, which: string): void {
	let req: CursorRequester = {
		id: Math.random(),
		priority: 2,
		cursor: which,
	}

	const mousedown = () => {
		addRequester(req)

		window.addEventListener('mouseup', mouseup)
	}

	const mouseup = () => {
		removeRequester(req)
		window.removeEventListener('mouseup', mouseup)
	}

	node.addEventListener('mousedown', mousedown)

	return {
		destroy() {
			removeRequester(req)
			node.removeEventListener('mousedown', mousedown)
			window.removeEventListener('mouseup', mouseup)
		}
	}
}