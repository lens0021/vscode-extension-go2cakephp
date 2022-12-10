import { getWordAt, getClassAndFunctionAtFunctionPosition } from './word-getter';

describe('getWordAt', () => {
	it.each`
		line                                    | pos
		${'$this->Foo;'}                        | ${'$this->F'.length}
		${'$this->Foo'}                         | ${'$this->Foo'.length}
		${'$this->Foo->someCustomFunction();'}  | ${'$this->Fo'.length}
		${"public $uses = ['Foo'];"}            | ${"public $uses = ['Fo".length}
		${"public $components = array('Foo');"} | ${"public $components = array('F".length}
	`('$line', ({ line, pos }) => {
		expect(getWordAt(line, pos).word).toBe('Foo');
	});
});

describe('getClassAtFunctionPosition', () => {
	it.each`
		line                    | cls      | func     | pos
		${'$this->Foo->bar();'} | ${'Foo'} | ${'bar'} | ${'$this->Foo->ba'.length}
	`('$line', ({ line, cls, func, pos }) => {
		expect(getClassAndFunctionAtFunctionPosition(line, pos)).toStrictEqual({
			class: cls,
			function: func,
		});
	});
});
