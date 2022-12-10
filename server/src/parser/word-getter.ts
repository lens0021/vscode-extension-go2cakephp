import { TextDocument } from 'vscode-languageserver-textdocument';
import { integer } from 'vscode-languageserver/node';
import { Position } from 'vscode-languageserver/node';

export function getTargetAtPosition(position: Position, document: TextDocument) {
	const line = document.getText({
		start: {
			line: position.line,
			character: 0,
		},
		end: {
			line: position.line + 1,
			character: 0,
		},
	});

	return getClassAndFunctionAtFunctionPosition(line, position.character);

	// if (_class === null) {
	// 	return {
	// 		class: null,
	// 		function: func,
	// 	};
	// }
	// const { left, right, word } = getWordAt(line, position.character);
	// if (line.slice(left - 2, left) == '->' && line.at(right) == '(') {
	// 	return {
	// 		class: getWordAt(line, left - 3).word,
	// 		function: word,
	// 	};
	// }
	// const _class = word;
	// return {
	// 	class: _class,
	// 	function: '',
	// };
}

export function getClassAndFunctionAtFunctionPosition(str: string, pos: integer) {
	const left = str.slice(0, pos + 1);
	const found = left.match(/\$this->([A-Z][^-]+)->/);

	// TODO: Cover static functions
	return {
		class: found && found[1] ? found[1] : null,
		function: getWordAt(str, pos).word,
	};
}

/**
 * CC BY-SA 3.0 https://stackoverflow.com/a/5174867/10916512
 * @param str
 * @param pos
 * @returns
 */
export function getWordAt(str: string, pos: integer) {
	const left = str.slice(0, pos + 1).search(/[^\s()'">;-]+$/),
		right = str.slice(pos).search(/[\s()'">;-]/);

	if (right < 0) {
		return {
			left,
			right: -1,
			word: str.slice(left),
		};
	}

	return {
		left,
		right,
		word: str.slice(left, right + pos),
	};
}
