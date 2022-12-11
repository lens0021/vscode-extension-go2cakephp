import { FileGetter } from '../file-getter';
import { uriToPath } from '../protocol-translation';
import { FileParser } from './file-parser';
import { getTargetAtPosition } from './word-getter';
import { Range, TextDocument } from 'vscode-languageserver-textdocument';
import {
	TextDocuments,
	Definition,
	TextDocumentPositionParams,
	_Connection,
	Location,
} from 'vscode-languageserver/node';

export class CakephpParser {
	public constructor(
		private connection: _Connection,
		private documents: TextDocuments<TextDocument>
	) {}

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
		const filePath = uriToPath(params.textDocument.uri);
		if (!filePath) {
			console.log(`The file for uri ${params.textDocument.uri} is not found`);
			return undefined;
		}
		const activeDoc = this.documents.get(params.textDocument.uri);
		if (activeDoc === undefined) {
			console.log(`Cannot find the active document ${activeDoc}`);
			return undefined;
		}

		const activeDocParser = new FileParser(activeDoc.getText());
		const target = getTargetAtPosition(params.position, activeDoc);

		if (target.class === null) {
			console.log(`Cannot find the class`);
			return undefined;
		}

		const fileGetter = new FileGetter(filePath);
		let defFileUri: string | null = null;
		if (activeDocParser.uses.includes(target.class)) {
			defFileUri = fileGetter.getModelUri(target.class);
		} else if (activeDocParser.components.includes(target.class)) {
			defFileUri = fileGetter.getComponentUri(target.class);
		} else {
			const comps = await fileGetter.findComponents();
			if (comps.includes(target.class)) {
				defFileUri = fileGetter.getCakeComponentUri(target.class);
			}
		}

		if (defFileUri === null) {
			console.log('defFileUri === null');
			return undefined;
		}

		const definition: Location = {
			uri: defFileUri,
			range: {
				start: { line: 0, character: 0 },
				end: { line: 0, character: 0 },
			},
		};

		const globPattern = FileGetter.uriToGlob(defFileUri);
		const range: Range = await this.connection.sendRequest('getDefinitionOnFile', {
			target,
			globPattern,
		});

		definition.range = range;

		return definition;
	}
}
