import { CakephpParser } from './parser/parser';
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
} from 'vscode-languageserver/node';
// import { WorkspaceFolders } from 'vscode-languageserver/lib/common/workspaceFolders';

const COMPLETION_SUPPORT = false;

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
	const result: InitializeResult = {
		capabilities: {
			definitionProvider: true,
		},
	};

	if (COMPLETION_SUPPORT) {
		result.capabilities.completionProvider = {
			resolveProvider: true,
		};
	}
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
		const parser = new CakephpParser(connection, documents);

		return await parser.onDefinition(params);
	}
);

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
