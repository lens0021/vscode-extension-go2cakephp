import { FileGetter } from '../file-getter';
import { uriToPath } from '../protocol-translation';
import * as fileParser from './file-parser';
import { getWordRangeAtPosition } from './word-getter';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	TextDocuments,
	Definition,
	TextDocumentPositionParams,
} from 'vscode-languageserver/node';

export class CakephpParser {
	public constructor(private documents: TextDocuments<TextDocument>) {}

	public onDefinition(
		params: TextDocumentPositionParams
	):
		| Definition
		| import('vscode-languageserver-types').LocationLink[]
		| PromiseLike<
				Definition | import('vscode-languageserver-types').LocationLink[] | undefined
		  >
		| undefined {
		const file = uriToPath(params.textDocument.uri);
		if (!file) {
			return undefined;
		}
		const document = this.documents.get(params.textDocument.uri);
		if (document === undefined) {
			return undefined;
		}

		const fileText = document.getText();
		const { uses, components } = fileParser.findAllDynamicClasses(fileText);

		const target = getWordRangeAtPosition(params.position, document);

		const fileGetter = new FileGetter(file);
		let targetUri: string;
		if (uses.includes(target)) {
			targetUri = fileGetter.getModel(target);
		} else if (components.includes(target)) {
			targetUri = fileGetter.getComponent(target);
		} else {
			return undefined;
		}

		return [
			{
				targetUri: targetUri,
				targetRange: {
					start: { line: 0, character: 0 },
					end: { line: 0, character: 0 },
				},
				targetSelectionRange: {
					start: { line: 0, character: 0 },
					end: { line: 0, character: 0 },
				},
			},
		];
	}
}
