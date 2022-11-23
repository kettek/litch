export function cursorHover(node: Node, which: string): void {
	const mouseover = () => {
		document.body.classList.add('cursor-'+which)
	}
	const mouseout = () => {
		document.body.classList.remove('cursor-'+which)
	}

	node.addEventListener('mouseover', mouseover)
	node.addEventListener('mouseout', mouseout)

	return {
		update(newWhich: string) {
			document.body.classList.remove('cursor-'+which)
			document.body.classList.add('cursor-'+newWhich)
			which = newWhich
		},
		destroy() {
			node.removeEventListener('mouseover', mouseover)
			node.removeEventListener('mouseout', mouseout)
		}
	}
}

export function cursorHold(node: Node, which: string): void {
	const mousedown = () => {
		document.body.classList.add('cursor-'+which)

		const mouseup = () => {
			document.body.classList.remove('cursor-'+which)
			window.removeEventListener('mouseup', mouseup)
		}
		window.addEventListener('mouseup', mouseup)
	}

	node.addEventListener('mousedown', mousedown)

	return {
		destroy() {
			node.removeEventListener('mousedown', mousedown)
		}
	}
}