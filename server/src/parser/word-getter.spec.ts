import {
	getWordAt,
	getClassAndFunctionAtFunctionPosition,
	getClassFromLineAndPosition,
} from './word-getter';

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

describe('getClassAndFunctionAtFunctionPosition', () => {
	it.each`
		line                               | cls      | func     | pos
		${'$this->Foo->bar();'}            | ${'Foo'} | ${'bar'} | ${'$this->Foo->ba'.length}
		${'$this->Foo->bar();'}            | ${'Foo'} | ${null}  | ${'$this->Fo'.length}
		${'$this->A->a(); $this->B->b();'} | ${'A'}   | ${'a'}   | ${'$this->A->'.length}
		${'$this->A->a(); $this->B->b();'} | ${'A'}   | ${null}  | ${'$this->'.length}
		${'$this->A->a(); $this->B->b();'} | ${'B'}   | ${'b'}   | ${'$this->A->a(); $this->B->'.length}
		${'$this->A->a(); $this->B->b();'} | ${'B'}   | ${null}  | ${'$this->A->a(); $this->'.length}
	`('$line', ({ line, cls, func, pos }) => {
		expect(getClassAndFunctionAtFunctionPosition(line, pos)).toStrictEqual({
			class: cls,
			function: func,
		});
	});
});

describe('getClassFromLineAndPosition', () => {
	it.each`
		line                                 | cls      | pos
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->F'.length}
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->Fo'.length}
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->Foo'.length}
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->Foo-'.length}
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->Foo->'.length}
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->Foo->b'.length}
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->Foo->ba'.length}
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->Foo->bar'.length}
		${'$this->Foo->bar();'}              | ${'Foo'} | ${'$this->Fo'.length}
		${'$this->Aa->a(); $this->Bb->b();'} | ${'Aa'}  | ${'$this->Aa->a'.length}
		${'$this->Aa->a(); $this->Bb->b();'} | ${'Aa'}  | ${'$this->A'.length}
		${'$this->Aa->a(); $this->Bb->b();'} | ${'Bb'}  | ${'$this->Aa->a(); $this->Bb->b'.length}
		${'$this->Aa->a(); $this->Bb->b();'} | ${'Bb'}  | ${'$this->Aa->a(); $this->B'.length}
	`('$line', ({ line, cls, pos }) => {
		expect(getClassFromLineAndPosition(line, pos)).toEqual(cls);
	});
});
