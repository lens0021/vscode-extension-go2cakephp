export class FileGetter {
	public constructor(private file: string) {}

	public getModel(name: string): string {
		return this.file.replace(/(.+\/app)\/.+/, `$1/Model/${name}.php`);
	}

	public getComponent(name: string): string {
		return this.file.replace(
			/(.+\/app)\/.+/,
			`$1/Controller/Component/${name}Component.php`
		);
	}
}
