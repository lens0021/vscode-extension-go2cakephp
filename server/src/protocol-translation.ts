import * as vscodeUri from 'vscode-uri';

const RE_PATHSEP_WINDOWS = /\\/g;

export function uriToPath(stringUri: string): string | undefined {
	const uri = vscodeUri.URI.parse(stringUri);
	if (uri.scheme !== 'file') {
		return undefined;
	}
	return normalizeFsPath(uri.fsPath);
}

function normalizeFsPath(fsPath: string): string {
	return fsPath.replace(RE_PATHSEP_WINDOWS, '/');
}
