<?php

class RecipeController {
	public $uses = ['Ingredient', 'Sugar'];
	public $components = ['Recipe'];

	private function sampleFunction() {
		$this->Recipe;
		$this->Recipe->duplicate();
	}
}
