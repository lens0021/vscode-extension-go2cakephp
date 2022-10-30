/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as cakephpParser from './cakephp-parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	createConnection,
	CompletionItem,
	CompletionItemKind,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	Definition,
	DefinitionLink,
	TextDocumentPositionParams,
	InitializeResult,
	Position,
	integer,
} from 'vscode-languageserver/node';
import * as vscodeUri from 'vscode-uri';

const COMPLETION_SUPPORT = false;

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
	const result: InitializeResult = {
		capabilities: {
			completionProvider: {
				resolveProvider: COMPLETION_SUPPORT,
			},
			definitionProvider: true,
		},
	};
	return result;
});

// connection.onInitialized(() => {});

// connection.onDidChangeWatchedFiles((_change) => {
// 	// Monitored files have change in VSCode
// 	connection.console.log('We received an file change event');
// });

connection.onDefinition(
	async (
		params: TextDocumentPositionParams
	): Promise<Definition | DefinitionLink[] | undefined> => {
		const file = uriToPath(params.textDocument.uri);
		if (!file) {
			return undefined;
		}
		const document = documents.get(params.textDocument.uri);
		if (document === undefined) {
			return undefined;
		}
		const text = document.getText();
		const uses = findDynamicClasses(text, 'uses');
		const components = findDynamicClasses(text, 'components');

		const target = getWordRangeAtPosition(params.position, document);

		let targetUri: string;
		if (uses.includes(target)) {
			targetUri = file.replace(/(.+\/app)\/.+/, `$1/Model/${target}.php`);
		} else if (components.includes(target)) {
			targetUri = file.replace(
				/(.+\/app)\/.+/,
				`$1/Controller/Component/${target}Component.php`
			);
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
);

function uriToPath(stringUri: string): string | undefined {
	const uri = vscodeUri.URI.parse(stringUri);
	if (uri.scheme !== 'file') {
		return undefined;
	}
	return normalizeFsPath(uri.fsPath);
}

const RE_PATHSEP_WINDOWS = /\\/g;

function normalizeFsPath(fsPath: string): string {
	return fsPath.replace(RE_PATHSEP_WINDOWS, '/');
}

function findDynamicClasses(text: string, property: string) {
	const regex = new RegExp(`\\$${property}.+=.+(?:array\\(|\\[)(.+)[)\\]].*;`, 'm');
	const m = text.match(regex);
	if (!m || !m[1]) {
		return [];
	}
	const cls = m[1].split(',').map((use: string) => {
		const m = use.match(/\s*['"](.+)['"]\s*/);
		return m ? m[1] : use;
	});
	return cls;
}

function getWordRangeAtPosition(position: Position, document: TextDocument): string {
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
function getWordAt(str: string, pos: integer): string {
	const left = str.slice(0, pos + 1).search(/[^\s()'">-]+$/),
		right = str.slice(pos).search(/[\s()'">-]/);

	if (right < 0) {
		return str.slice(left);
	}

	return str.slice(left, right + pos);
}

if (COMPLETION_SUPPORT) {
	// This handler provides the initial list of the completion items.
	connection.onCompletion(
		(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
			// The pass parameter contains the position of the text document in
			// which code complete got requested. For the example we ignore this
			// info and always provide the same completion items.
			return [
				{
					label: 'TypeScript',
					kind: CompletionItemKind.Text,
					data: 1,
				},
				{
					label: 'JavaScript',
					kind: CompletionItemKind.Text,
					data: 2,
				},
			];
		}
	);

	// This handler resolves additional information for the item selected in
	// the completion list.
	connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	});
}
documents.listen(connection);

connection.listen();
