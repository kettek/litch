
export function getVideoId(url: string) {
	let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	let match = url.match(regExp);
	if (match && match[2].length == 11) {
		return match[2]
	}
	return ''
}

export interface Settings {
	url: string
	autoplay: boolean
}