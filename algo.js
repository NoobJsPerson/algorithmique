const readline = require('node:readline')

class Algo {
	static hasError = false;
	static error(line, message) {
		Algo.hasError = true;
		require('./error.js')(line, message);
	}
	run(str) {
		const scanner = new Scanner(str);
		const tokens = scanner.scanTokens();
		for (let token of tokens) {
			console.log(token);
		}
	}
	runPrompt() {
		const { stdin: input, stdout: output } = require('node:process');
		const rl = readline.createInterface({ input, output });
		rl.setPrompt('> ');
		rl.prompt();
		rl.on('line', input => {
			this.run(input);
			Algo.hasError = false;
			rl.prompt();
		})
	}
}

function makeEnum(elements) {
	const obj = Object.create(null);
	for (let i = 0; i < elements.length; i++) {
		obj[elements[i]] = i;
	}
	return Object.freeze(obj);
}

const TokenType = makeEnum([
	"LEFT_PAREN", "RIGHT_PAREN", "LEFT_BRACE", "RIGHT_BRACE",
	"COMMA", "DOT", "MINUS", "PLUS", "SEMICOLON", "SLASH", "STAR", "CARET",

	// One or two character tokens.
	"BANG", "BANG_EQUAL",
	"EQUAL", "EQUAL_EQUAL",
	"GREATER", "GREATER_EQUAL",
	"LESS", "LESS_EQUAL",
	// ""Literals".
	"IDENTIFIER", "STRING", "NUMBER",

	// Keywords.
	"IF", "ELSE", "ELIF",
	"ALGO", "START", "END",
	"FUN", "RETURN",
	"FOR", "WHILE", "DO", "UNTIL",
	"ENDIF", "ENDFOR", "ENDWHILE",

	// Types
	"INT", "REAL", "CHAR", "STRING", "STRUCT", "ARRAY",

	"EOF"]);

class Token {
	type;
	lexeme;
	literal;
	line;

	constructor(type, lexeme, literal, line) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.line = line;
	}

	toString() {
		return `${Object.entries(TokenType)[this.type]} ${this.lexeme} ${this.literal}`;
	}
}

class Scanner {
	source;
	tokens = [];
	start = 0;
	current = 0;
	line = 1;
	static keywords = {
		'si': TokenType.IF,
		'sinon': TokenType.ELSE,
		'sinonsi': TokenType.ELIF,
		'pour': TokenType.FOR,
		'tantque': TokenType.WHILE,
		'retourne': TokenType.RETURN,
		'faire': TokenType.DO,
		'jusqua': TokenType.UNTIL,
		'fonction': TokenType.FUN,
		'entier': TokenType.INT,
		'reel': TokenType.REAL,
		'charactere': TokenType.CHAR,
		'chaine': TokenType.STRING,
		'tableau': TokenType.ARRAY
	}

	constructor(source) {
		this.source = source
	}

	isAtEnd = () => {
		return this.current >= this.source.length;
	}

	scanTokens = () => {
		while (!this.isAtEnd()) {
			this.start = this.current;
			this.scanToken();
		}
		this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
		return this.tokens;
	}

	scanToken = () => {
		const { advance, addToken, match, isAtEnd, peek,
			isDigit, isAlpha,
			string, number, identfier } = this;
		const c = advance();
		switch (c) {
			case '(': addToken(TokenType.LEFT_PAREN); break;
			case ')': addToken(TokenType.RIGHT_PAREN); break;
			case '{': addToken(TokenType.LEFT_BRACE); break;
			case '}': addToken(TokenType.RIGHT_BRACE); break;
			case ',': addToken(TokenType.COMMA); break;
			case '.': addToken(TokenType.DOT); break;
			case '-': addToken(TokenType.MINUS); break;
			case '+': addToken(TokenType.PLUS); break;
			case ';': addToken(TokenType.SEMICOLON); break;
			case '*': addToken(TokenType.STAR); break;
			case '"': string(); break;
			case '!':
				addToken(match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
				break;
			case '=':
				addToken(match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
				break;
			case '<':
				addToken(match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
				break;
			case '>':
				addToken(match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
				break;
			case ' ':
			case '\r':
			case '\t':
				// Ignore whitespace.
				break;

			case '\n':
				this.line++;
				break;
			case '/':
				if (match('/')) {
					// A comment goes until the end of the this.line.
					while (peek() != '\n' && !isAtEnd()) advance();
				} else {
					addToken(TokenType.SLASH);
				}
				break;
			default:
				if (isDigit(c)) {
					number();
				} else if (isAlpha(c)) {
					identfier()
				} else {
					Algo.error(this.line, "Unexpected character.");
					break;
				}
		}
	}

	advance = () => {
		return this.source.charAt(this.current++);
	}

	isDigit = (char) => {
		const c = char.charCodeAt(0);
		return c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0);
	}


	isAlpha = (char) => {
		const c = char.charCodeAt(0);
		return (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) || (c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0))
			|| char === '_';
	}

	isAlphaNumeric = (char) => {
		const { isDigit, isAlpha } = this;
		return isDigit(char) || isAlpha(char);
	}

	match = (expected) => {
		if (this.isAtEnd()) return false;
		if (this.source.charAt(this.current) != expected) return false;

		this.current++;
		return true;
	}

	peek = () => {
		if (this.isAtEnd()) return '\0';
		return this.source.charAt(this.current);
	}

	peekNext = () => {
		if (this.current + 1 >= this.source.length) return '\0';
		return this.source.charAt(this.current + 1);
	}

	addToken = (type, literal = null) => {
		const text = this.source.substring(this.start, this.current);
		this.tokens.push(new Token(type, text, literal, this.line));
	}

	string = () => {
		while (this.peek() != '"' && !this.isAtEnd()) {
			if (this.peek() == '\n') this.line++;
			this.advance();
		}

		if (this.isAtEnd()) {
			Algo.error(line, "Unterminated string.");
			return;
		}

		// The closing ".
		this.advance();

		// Trim the surrounding quotes.
		const value = this.source.substring(this.start + 1, this.current - 1);
		this.addToken(TokenType.STRING, value);
	}

	number = () => {
		while (this.isDigit(this.peek())) this.advance();

		// Look for a fractional part.
		if (this.peek() == '.' && this.isDigit(this.peekNext())) {
			// Consume the "."
			this.advance();

			while (this.isDigit(this.peek())) this.advance();
		}

		this.addToken(TokenType.NUMBER,
			parseFloat(this.source.substring(this.start, this.current)));
	}

	identfier = () => {
		const { isAlphaNumeric, peek, advance, addToken,
			source, start, current } = this;
		while (isAlphaNumeric(peek())) advance();
		const text = source.substring(start, current);
		let type = Scanner.keywords[text];
		if (!type) type = TokenType.IDENTIFIER;
		addToken(type);
	}


}
new Algo().runPrompt()
