class Binary {
	left;
	operator;
	right;
	constructor(left, operator, right) {
		this.left = left;
		this.operator = operator;
		this.right = right;
	}
}

class Grouping {
	expression;
	constructor(expression) {
		this.expression = expression;
	}
}

class Literal {
	value;
	constructor(value) {
		this.value = value;
	}
}

class Unary {
	operator;
	right;
	constructor(operator, right) {
		this.operator = operator;
		this.right = right;
	}
}


