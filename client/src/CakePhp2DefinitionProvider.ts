import * as path from 'path';
import * as vscode from 'vscode';

export class CakePhp2DefinitionProvider implements vscode.DefinitionProvider {
	public provideDefinition(
			document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken):
			Thenable<vscode.Location> {
				console.log('Congratulations, your extension "provideDefinition" is now active!');
				return null;
	}
}
