export class FileParser {
	private _uses: string[] | undefined;
	private _components: string[] | undefined;

	public constructor(private fileText: string) {}

	private findDynamicClasses(property: 'uses' | 'components') {
		const regex = new RegExp(`\\$${property}.+=.+(?:array\\(|\\[)(.+)[)\\]].*;`, 'm');
		const m = this.fileText.match(regex);
		if (!m || !m[1]) {
			return [];
		}
		const cls = m[1].split(',').map((use: string) => {
			const m = use.match(/\s*['"](.+)['"]\s*/);
			return m ? m[1] : use;
		});
		return cls;
	}

	public get uses() {
		if (this._uses === undefined) {
			this._uses = this.findDynamicClasses('uses');
		}
		return this._uses;
	}

	public get components() {
		if (this._components === undefined) {
			this._components = this.findDynamicClasses('components');
			// TODO: find lib/Cake/Controller/Component/([A-z]+)Component.php`
		}
		return this._components;
	}
}
