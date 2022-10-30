import { FileGetter } from '../file-getter';
import { uriToPath } from '../protocol-translation';
import { FileParser } from './file-parser';
import { getWordRangeAtPosition } from './word-getter';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	TextDocuments,
	Definition,
	TextDocumentPositionParams,
} from 'vscode-languageserver/node';

export class CakephpParser {
	public constructor(private documents: TextDocuments<TextDocument>) {}

	public async onDefinition(
		params: TextDocumentPositionParams
	): Promise<
		| Definition
		| import('vscode-languageserver-types').LocationLink[]
		| PromiseLike<
				Definition | import('vscode-languageserver-types').LocationLink[] | undefined
		  >
		| undefined
	> {
		const file = uriToPath(params.textDocument.uri);
		if (!file) {
			return undefined;
		}
		const document = this.documents.get(params.textDocument.uri);
		if (document === undefined) {
			return undefined;
		}

		const fileParser = new FileParser(document.getText());
		const target = getWordRangeAtPosition(params.position, document);

		const fileGetter = new FileGetter(file);
		let targetUri: string;
		if (fileParser.uses.includes(target)) {
			targetUri = fileGetter.getModelUri(target);
		} else if (fileParser.components.includes(target)) {
			targetUri = fileGetter.getComponentUri(target);
		} else if ((await fileGetter.findComponents()).includes(target)) {
			targetUri = fileGetter.getCakeComponentUri(target);
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
