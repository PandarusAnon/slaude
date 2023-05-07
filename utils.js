
function splitMessageInTwo(text, maximumSplit, miminumSplit = 500) {
	// Split text in two, find the latest paragraph, or a newline, or just a sentence break, in this priority, to break it, worst case, use a space.
	// Important: be VERY carefull not to break markdown formatting
	// for example, you might find a \n\n, but you can't split there if it's inside "```" quotations
	let textToSearch = text;
	function splitIfFound(searchFunction, allowMarkdownInlineBreak = true, allowDelimiter = false) {
		let textToSearch = text;
		while (true) {
			let i = searchFunction(textToSearch);
			if (i !== -1 && !isInsideCodeBlock(textToSearch, i) &&
				(allowMarkdownInlineBreak || !isInsideMarkdownInline(textToSearch, i)) &&
				(allowDelimiter || !isInsideDelimiters(textToSearch, i)) &&
				textToSearch.slice(0, i).length <= maximumSplit && textToSearch.slice(0, i).length > miminumSplit) {
				return [text.slice(0, i), text.slice(i + 1)];
			}
			if (i === -1) break;
			textToSearch = textToSearch.slice(0, i);
		}
	}
	let result = null

	function increasingList(X, Y) {
		return Array.from({ length: Y - X + 1 }, (_, i) => X + i);
	}
	function decreasingList(Y, X) {
		return Array.from({ length: Y - X + 1 }, (_, i) => Y - i);
	}
	function repeatCharacter(char, times) {
		return char.repeat(times);
	}
	function markdownTitle(depth, allowMarkdownInlineBreak = true, allowDelimiter = false) {
		result = splitIfFound(text => text.lastIndexOf('\n' + repeatCharacter('#', depth) + ' '), allowMarkdownInlineBreak, allowDelimiter);
		if (result) return result;
	}

	for (let allowDelimiter of [true, false]) {
		for (let depth of increasingList(1, 6)) {
			// Markdown title break 
			result = markdownTitle(depth, true, allowDelimiter);
			if (result) return result;
		}
		// Check for paragraph break
		result = splitIfFound(text => text.lastIndexOf('\n\n'), true, allowDelimiter);
		if (result) return result;
		// Newline break 
		result = splitIfFound(text => text.lastIndexOf('\n'), true, allowDelimiter);
		if (result) return result;
		// Sentence break
		result = splitIfFound(findLastSentenceBreak, false, allowDelimiter);
		// Space break
		result = splitIfFound(text => text.lastIndexOf(' '), false, allowDelimiter);
		if (result) return result;
	}
	// Everything failed, split at maximum
	return [text.slice(0, maximumSplit), text.slice(maximumSplit + 1)];
}

function isInsideDelimiters(text, index) {
	const openDelimiters = /[\(\[\{<>]/g;
	const closeDelimiters = /[\)\]\}<>]/g;
	let openMatches = [];
	let closeMatches = [];
	let match;

	// Find opening delimiters
	while ((match = openDelimiters.exec(text)) !== null) {
		openMatches.push(match);
	}

	// Find closing delimiters
	while ((match = closeDelimiters.exec(text)) !== null) {
		closeMatches.push(match);
	}

	// Check if index is between an opening and closing delimiter
	for (let i = 0; i < openMatches.length; i++) {
		for (let j = closeMatches.length - 1; j >= 0; j--) {
			if (openMatches[i].index < index &&
				index < closeMatches[j].index &&
				(openMatches[i][0] === '(' && closeMatches[j][0] === ')') ||
				(openMatches[i][0] === '[' && closeMatches[j][0] === ']') ||
				(openMatches[i][0] === '{' && closeMatches[j][0] === '}')) {
				return true;
			}
		}
	}
	return false;
}

function isInsideMarkdownInline(text, index) {
	// Find pairs of formatting characters and capture the text in between them
	const format = /(\*|_|~){1,2}([\s\S]*?)\1{1,2}/gm;
	let matches = [];
	let match;
	while ((match = format.exec(text)) !== null) {
		matches.push(match);
	}
	// Check if index is between a pair of formatting characters
	for (let i = 0; i < matches.length; i++) {
		if (index > matches[i].index && index < matches[i].index + matches[i][0].length) {
			return true;
		}
	}
	return false;
}

function isInsideCodeBlock(text, index) {
	let textUpToIndex = text.slice(0, index);
	let matches = textUpToIndex.match(/```/gm);
	if (matches) {
		let numDelimiters = matches.length;
		return numDelimiters % 2 === 1;
	}
	return false;
}

function findLastSentenceBreak(text) {
	let sentenceBreaks = /[.!?]$/gm;
	let matches = text.match(sentenceBreaks);
	if (matches) {
		let lastIndex = 0;
		for (let i = 0; i < matches.length; i++) {
			lastIndex = text.lastIndexOf(matches[i]);
		}
		return lastIndex;
	}
	return -1;
}

export default	splitMessageInTwo
