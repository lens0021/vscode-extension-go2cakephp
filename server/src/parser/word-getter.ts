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
}

export function getClassAndFunctionAtFunctionPosition(line: string, pos: integer) {
	const word = getWordAt(line, pos).word;

	const cls = getClassFromLineAndPosition(line, pos);
	// TODO: Cover static functions
	const func = word == cls ? null : word;

	return {
		class: cls,
		function: func,
	};
}

export function getClassFromLineAndPosition(line: string, pos: integer) {
	const reg = RegExp(/\$this->([A-Z][^-]*)->[^(]+/, 'g');
	let found;
	while ((found = reg.exec(line)) !== null) {
		if (found && found[1] && found.index < pos && pos <= reg.lastIndex) {
			return found[1];
		}
	}

	return null;
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
