import * as fs from 'fs';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { _, _RemoteWorkspace } from 'vscode-languageserver/node';

export class FileGetter {
	public constructor(private openFilePath: string) {}

	public static uriToGlob(glob: string) {
		return glob
			.replace(/.+\/(app\/.+)/, '**/$1')
			.replace(/.+\/(lib\/Cake\/Controller\/Component\/.+)/, `**/$1`);
	}

	public getModelUri(name: string): string {
		return this.openFilePath.replace(/(.+\/app)\/.+/, `$1/Model/${name}.php`);
	}

	public getComponentUri(name: string): string {
		return this.openFilePath.replace(
			/(.+\/app)\/.+/,
			`$1/Controller/Component/${name}Component.php`
		);
	}

	public getCakeComponentUri(name: string): string {
		return this.openFilePath.replace(
			/(.+)\/app\/.+/,
			`$1/lib/Cake/Controller/Component/${name}Component.php`
		);
	}

	public async findComponents(): Promise<string[]> {
		const pathToCakeComponents = this.openFilePath.replace(
			/(.+)\/app\/.+/,
			`$1/lib/Cake/Controller/Component/`
		);
		try {
			const dirs = await fs.promises.readdir(pathToCakeComponents);
			return dirs.map((dir) => dir.replace('Component.php', ''));
		} catch (e) {
			return [];
		}
	}

	public findDefinition(
		target: { class: string | null; function: string | null },
		doc: TextDocument
	) {
		if (target.class === null) {
			return null;
		}
		const definition = {
			range: {
				start: { line: 0, character: 0 },
				end: { line: 0, character: 0 },
			},
		};
		const classDef = RegExp(`/(?:class|interface|trait) ${target.class}/`).exec(
			this.openFilePath
		);
		console.log(classDef);
		if (!classDef?.index) {
			return null;
		}
		const start = doc.positionAt(classDef.index);
		definition.range = {
			start,
			end: start,
		};
	}
}
