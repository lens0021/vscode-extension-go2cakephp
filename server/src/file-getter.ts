import * as fs from 'fs';
import { _, _RemoteWorkspace } from 'vscode-languageserver/node';

export class FileGetter {
	public constructor(private openFile: string) {}

	public getModelUri(name: string): string {
		return this.openFile.replace(/(.+\/app)\/.+/, `$1/Model/${name}.php`);
	}

	public getComponentUri(name: string): string {
		return this.openFile.replace(
			/(.+\/app)\/.+/,
			`$1/Controller/Component/${name}Component.php`
		);
	}

	public getCakeComponentUri(name: string): string {
		return this.openFile.replace(
			/(.+)\/app\/.+/,
			`$1/lib/Cake/Controller/Component/${name}Component.php`
		);
	}

	public async findComponents(): Promise<string[]> {
		const pathToCakeComponents = this.openFile.replace(
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
}
