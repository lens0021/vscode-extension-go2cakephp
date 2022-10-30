<?php

class RecipeController {
	public $uses = ['Ingredient', 'Sugar'];

	private function sampleFunction() {
		echo $this->Ingredient;
		$this->Ingredient->someCustomFunction();
		$this->Sugar->someCustomFunction();
	}
}
