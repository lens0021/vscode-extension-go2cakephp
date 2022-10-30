function findDynamicClasses(fileText: string, property: 'uses' | 'components') {
	const regex = new RegExp(`\\$${property}.+=.+(?:array\\(|\\[)(.+)[)\\]].*;`, 'm');
	const m = fileText.match(regex);
	if (!m || !m[1]) {
		return [];
	}
	const cls = m[1].split(',').map((use: string) => {
		const m = use.match(/\s*['"](.+)['"]\s*/);
		return m ? m[1] : use;
	});
	return cls;
}

export function findAllDynamicClasses(fileText: string) {
	return {
		uses: findDynamicClasses(fileText, 'uses'),
		components: findDynamicClasses(fileText, 'components'),
	};
}
