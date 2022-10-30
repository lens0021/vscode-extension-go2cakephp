import { integer } from 'vscode-languageserver/node';
import { Position } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

export function getWordRangeAtPosition(position: Position, document: TextDocument): string {
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

	return getWordAt(line, position.character);
}

/**
 * CC BY-SA 3.0 https://stackoverflow.com/a/5174867/10916512
 * @param str
 * @param pos
 * @returns
 */
export function getWordAt(str: string, pos: integer): string {
	const left = str.slice(0, pos + 1).search(/[^\s()'">;-]+$/),
		right = str.slice(pos).search(/[\s()'">;-]/);

	if (right < 0) {
		return str.slice(left);
	}

	return str.slice(left, right + pos);
}
