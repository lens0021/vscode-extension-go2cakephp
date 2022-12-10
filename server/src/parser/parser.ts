import { FileGetter } from '../file-getter';
import { uriToPath } from '../protocol-translation';
import { FileParser } from './file-parser';
import { getTargetAtPosition, getClassAndFunctionAtFunctionPosition } from './word-getter';
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
		const target = getTargetAtPosition(params.position, document);

		const fileGetter = new FileGetter(file);
		let targetUri: string;
		if (target.class === null ) {
			return undefined;
		}

		if (fileParser.uses.includes(target.class)) {
			targetUri = fileGetter.getModelUri(target.class);
		} else if (fileParser.components.includes(target.class)) {
			targetUri = fileGetter.getComponentUri(target.class);
		} else if ((await fileGetter.findComponents()).includes(target.class)) {
			targetUri = fileGetter.getCakeComponentUri(target.class);
		} else {
			return undefined;
		}

		const definition = {
			targetUri: targetUri,
			targetRange: {
				start: { line: 0, character: 0 },
				end: { line: 0, character: 0 },
			},
			targetSelectionRange: {
				start: { line: 0, character: 0 },
				end: { line: 0, character: 0 },
			},
		};
		if (target.type === 'function') {
			definition.targetRange = {
				start: { line: 0, character: 0 },
				end: { line: 0, character: 0 },
			};
			definition.targetSelectionRange = {
				start: { line: 0, character: 0 },
				end: { line: 0, character: 0 },
			};
		}

		return [definition];
	}
}
