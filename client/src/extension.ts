/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as path from 'path';
import { workspace, ExtensionContext, Uri, TextDocument, Position } from 'vscode';
import * as vscode from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
	// new (vscode.TextDocument()).getWordRangeAtPosition()

	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions,
		},
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'php' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
		},
	};

	// Create the language client and start the client.
	client = new LanguageClient('go2cakephp', 'Go 2 CakePHP', serverOptions, clientOptions);

	// Start the client. This will also launch the server
	client.start();

	client.onReady().then(() => {
		client.onRequest(
			'getDefinitionOnFile',
			async (params: {
				target: {
					class: string;
					function: string | null;
				};
				globPattern: string;
			}): Promise<{ start: Position; end: Position } | null> => {
				const { target, globPattern } = params;
				const files = await workspace.findFiles(globPattern, null, 1);
				if (!files || !files[0]) {
					return null;
				}
				const doc = await workspace.openTextDocument(files[0]);
				const text = doc.getText();
				// Caution: This assumes there is only one class in an each file.

				const defRef = RegExp(
					target.function
						? `(?:function) ${target.function}`
						: `(?:class|interface|trait) ${target.class}`
				);
				const def = defRef.exec(text);
				if (!def) {
					return null;
				}
				const start = doc.positionAt(def.index);
				return {
					start,
					end: start,
				};
			}
		);
	});
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
