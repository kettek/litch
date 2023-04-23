type Word = {
	start: number
	end: number
	fullEnd: number
	style: string
	color: string
	children: Word[]
}

function getLastWordPosition(word: Word): number {
	if (word.children.length > 0) {
		return getLastWordPosition(word.children[word.children.length-1])
	}
	return word.end
}

const notPartOfStyle = [' ', '{', '}', '!', ',', '#']
const notPartOfColor = [' ', '{', '}', '!', ',', '.']
function buildWord(str: string, start: number): Word {
	let word: Word = {
	start: start+1,
		end: start,
		fullEnd: start,
		style: '',
		color: '',
		children: [],
	}
	let j = start+1
	for (; j < str.length; j++) {
		let ch = str[j]
		if (ch === '{') {
			word.children.push(buildWord(str, j))
			j = getLastWordPosition(word.children[word.children.length-1])
		} else if (ch === '}') {
			word.end = j
			word.fullEnd = j
			if (j+1 !== str.length && str[j+1] === '.') {
				let k = j+1
				for (; k < str.length && !notPartOfStyle.includes(str[k]); k++);
				word.style = str.substring(j+2, k)
				word.fullEnd = k-1
				j = k-1
				if (k < str.length && str[k] === '#') {
					for (; k < str.length && !notPartOfColor.includes(str[k]); k++);
					word.color = str.substring(j+2, k)
					word.fullEnd = k-1
				}
				break
			} else if (j+1 !== str.length && str[j+1] === '#') {
				let k = j+1
				for (; k < str.length && !notPartOfColor.includes(str[k]); k++);
				word.color = str.substring(j+2, k)
				word.fullEnd = k-1
				j = k-1
				if (k < str.length && str[k] === '.') {
					for (; k < str.length && !notPartOfStyle.includes(str[k]); k++);
					word.style = str.substring(j+2, k)
					word.fullEnd = k-1
				}
				break
			}
		}
	}
	return word
}

function getColor(c: string): string {
	return (c.split('').filter(v=>['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'].includes(v)).length === c.length) ? '#'+c : c
}
		
function wordToHTML(source: string, word: Word): string {
	let html = '<strong' + (word.color?` style='color: ${getColor(word.color)}'`:'') + (word.style?" class='"+word.style.split('.').map(v=>'alerts-'+v).join(' ')+"'":'') + '>'
	if (word.children.length === 0) {
		html += source.substring(word.start, word.end).split('').map(v=>'<span>'+(v===' '?'&nbsp;':v)+'</span>').join('')
	} else {
		let pos = word.start
		for (let child of word.children) {
			html += source.substring(pos, child.start-1).split('').map(v=>'<span>'+(v===' '?'&nbsp;':v)+'</span>').join('')
			pos = child.fullEnd
			let chtml = wordToHTML(source, child)
			html += chtml
		}
	}
	html += '</strong>'
	return html
}
		
export function parseToHTML(source: string): string {
	let out: string = ''
	for (let i = 0; i < source.length; i++) {
		let ch = source[i]
		if (ch === '{') {
			let word = buildWord(source, i)
			i = word.fullEnd
			out += wordToHTML(source, word)
		} else {
			out += ch
		}
	}
	return out
}
