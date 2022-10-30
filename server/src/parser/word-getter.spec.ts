import { getWordAt } from './word-getter';

describe('', () => {
	const word = 'Foo';
	it.each([
		['echo $this->Foo;', 'echo $this->F'.length],
		['$this->Foo->someCustomFunction();', '$this->F'.length],
		["public $uses = ['Foo'];", "public $uses = ['Fo".length],
		["public $components = array('Foo');", "public $components = array('F".length],
	])('%s', (line, pos) => {
		expect(getWordAt(line, pos)).toBe(word);
	});
});
