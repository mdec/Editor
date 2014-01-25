
// TODO:
// auto-indent/unindent
// when function parenthesis opens, show argument list in status line

$(document).ready( function() {

	/*****
		Editor object has tracking properties and methods for updating them.
	*****/

	function Editor() {
		var self = this;

		// properties
		self.actionKeys = [8, 9, 33, 34, 35, 36, 37, 38, 39, 40, 46];  // keys that do something other than insert text
		self.cCol = ko.observable(0);			// cursor column number
                self.cLine = ko.observable(1);      		// cursor line number
		self.topLine = ko.observable(1);		// line number currently at top of viewer
		self.nLinesDisp = 30; 				// number of total lines to be displayed
		self.indentLevel = 0;				
		
		self.text = ko.observableArray([ko.observable(""), ko.observable("")]); // Each element is a line of text.

		self.nLines = ko.computed( function() { // Observable tracks the number of lines entered.
				return self.text().length - 1;
			});	

		self.bottomLine = ko.computed( function() {
				return (self.nLines() <= self.nLinesDisp) ? self.nLines() : self.topLine() + self.nLinesDisp - 1;
			});

		self.language = { // Language-specific properties for coloring, shorthand, indenting, etc.
			colorList : {
				regexs : [/(DATA|SET|KEEP|RENAME|DROP|WHERE|(RUN|ENDSAS)(?=\s*;))/ig, 	    // data, set, run, options, endsas,
					  /((\s+|^)PROC\s+(CONTENTS|EXPORT|FREQ|MEANS|PRINT|SORT))/ig,   	    // procs
					  /((\s+|^)(by|table|title|var))/ig,                                  // proc sub-statements
					  /(mean|n|nmiss|strip|sum|upcase)(?=\()/ig,				            // functions
					  /("[^"]*")/ig,						                                 // strings
					  /((\s+|^)(continue|do|else|end|if|leave|of|output|select|until|while))/ig,	// control flow
					  /((^|\s+)-?\d+(.?\d+)?)(?=(\D+|$|;))/g,			                    // numbers, notices decimals
					  /(\/\*.*\*\/|\*[^/]*;)/ig,					                        // comments
					],
				replace : ["$1", "$1", "$1", "$1", "$1", "$1", "$1", "$1"],
				colors : ["statement", "proc", "proc-sub", "function", "string", "control-flow", "number", "comment"]
				},

			dictionary : {
				pre : [".ct", ".d", ".e", ".fq", ".mn", ".pr", ".r", ".sr"],
				post : ["PROC CONTENTS data = ",
					"DATA ", 
					"endsas;",
					"PROC FREQ data = ", 
					"PROC MEANS data = ",
					"PROC PRINT data = ", 
					"RUN;",
					"PROC SORT data = "]
				},

			indent : ["DATA", "do", "PROC"],
			unindent : ["RUN", "end"]

		};

		self.autoIndent = function(x) { // Returns whether or not to auto-indent the next line.
			if (self.language.indent.indexOf(x) > -1) self.indentLevel += 4;
		}

		self.autoUnindent = function(x) {
			if (self.language.unindent.indexOf(x) > -1) self.indentLevel = Math.max(0, self.indentLevel - 4);
		}		

		self.translate = function(x) {
			$.each(x.split(" "), function(index, value) {
				var index = self.language.dictionary.pre.indexOf(value);
				if (index > -1) {
					var pre = self.language.dictionary.pre[index];
					var post = self.language.dictionary.post[index];
					x = x.replace(pre, post);
					self.cCol(self.cCol() + post.length - pre.length);
				}
			});	
			return x;	
		}

		self.colorCode = function(x) {
			$.each(self.language.colorList.regexs, function(index, regex) {
				x = x.replace(regex, "<span class='text-" + self.language.colorList.colors[index] + "'>$1</span>");			
			});
			return x;			
		}

		self.activeLineLength = ko.computed( function() { 
				return self.text()[self.cLine()]().length;
			}); 

		self.insertCursor = function(x) {
			var cCol = self.cCol();				
			var cursorSpanOpen = "<span class='cursor'>";
			var cursorSpanClose = "</span>";
				
			if (cCol == 0) var out = cursorSpanOpen + cursorSpanClose + x;
			else if (cCol == self.activeLineLength()) var out = x + cursorSpanOpen + cursorSpanClose;
			else {
				var cChar = self.text()[self.cLine()]()[self.cCol()];
				var textPre = x.substring(0, cCol);
				var textPost = (cCol == self.activeLineLength()) ? "" : x.substring(cCol + 1);
				var out = textPre + cursorSpanOpen + cChar + cursorSpanClose + textPost;
			}
			return out;
		}

		self.textView = ko.computed( function() {
				// Observable keeps the current nLinesDisp lines in view. Starts of with lines 1-nLinesDisp,
				// but if the text exceeds that length, will scroll down.
				var out = self.text().slice(self.topLine(), self.topLine() + self.nLinesDisp);
				var indexLine = self.cLine() - self.topLine();
				var text = out[indexLine]();
				out[indexLine] = self.insertCursor(text);
				
				out = out.map( function(x) {
					return (typeof(x) == 'function') ? self.colorCode(x()) : self.colorCode(x);
				});
				return out;				
			});						
		
		self.info = ko.computed( function() {
				return "Line: " + self.cLine() + "/" + self.nLines() + " Column: " + self.cCol() + "/" + self.activeLineLength();
			});				
			
		// methods
		self.getText = function(lineNum) { // Returns the text value of the line that the cursor is on.
			if (lineNum === undefined) lineNum = self.cLine();
			return self.text()[lineNum]();
		}

		self.setText = function(text, lineNum) { // Sets the text value of the line that the cursor is on.
			if (lineNum === undefined) var lineNum = self.cLine();
			self.text()[lineNum](text);
		}
		
		self.koAdd = function(prop, amount) {  // Increments a ko.observable()
			if (amount === undefined) var amount = 1;
			self[prop](self[prop]() + amount);
		}		

		/*****
			Key actions
		*****/

		self.keyArrowDown = function() {
			if (self.cLine() == self.bottomLine() && self.cLine() < self.nLines()) self.koAdd("topLine");
			self.koAdd("cLine");
			if (self.cCol() > self.activeLineLength()) self.cCol(self.activeLineLength());
		}
			
		self.keyArrowLeft = function() {
			if (self.cCol() > 0) self.koAdd("cCol", -1);
			else if (self.cLine() > 1) {
				self.koAdd("cLine", -1);
				self.cCol(self.activeLineLength());
			}
		}
	
		self.keyArrowRight = function() {
			if (self.cCol() < self.activeLineLength()) self.koAdd("cCol");
			else if (self.cLine() < self.nLines()) {
				self.cCol(0);
				self.koAdd("cLine");
			}
		}

		self.keyArrowUp = function() {
			if (self.cLine() == self.topLine() && self.cLine() > 1) self.koAdd("topLine", -1);
			self.koAdd("cLine", -1); 				
			if (self.cCol() > self.activeLineLength()) self.cCol(self.activeLineLength());					
		}

		self.keyBackspace = function() {
			var cCol = self.cCol();
			var text = self.getText();
				
			if (cCol == 0) {
				var cLine = self.cLine();			
				if (cLine == self.topLine()) self.koAdd("topLine", -1);
				self.koAdd("cLine", -1);
				self.cCol(self.activeLineLength());
				self.setText(self.getText() + text);
				self.text.splice(cLine, 1);				
			} else {
				text = (cCol == text.length) ? text.substring(0, text.length - 1) : text.substring(0, cCol - 1) + text.substring(cCol);
				self.koAdd("cCol", -1);
				self.setText(text);
			}
		}

		self.keyDelete = function() {
			var cCol = self.cCol();					
			var text = self.getText();
				
			if (cCol == self.activeLineLength()) { // if current line is empty past cursor column, move next line up
				var cLine = self.cLine();			
				self.setText(text + self.getText(cLine + 1));
				self.text.splice(cLine + 1, 1);
			} else {
				text = (cCol == 0) ? text.substring(1) : text.substring(0, cCol) + text.substring(cCol + 1);
				self.setText(text);
			}			
		}
	
		self.keyEnd = function() { self.cCol(self.activeLineLength()) };

		self.keyEnter = function() {
			var cCol = self.cCol();
			var cLine = self.cLine();
			var text = self.getText();

			var textThisLine = text.substring(0, cCol);
			var textNextLine = text.substring(cCol);
			//self.autoUnindent(textThisLine.trim().split(/\W+/)[0]);

			self.setText(textThisLine); // Set current line to substring up to current cursor column
			self.text.splice(cLine + 1, 0, ko.observable(textNextLine)); // Splice in remainder of line

			if (cLine + 1 > self.bottomLine()) self.koAdd("topLine"); // Shift topLine down, if necessary.				

			self.koAdd("cLine");		// Increment cursor line position.
			//self.autoIndent(textThisLine.trim().split(/\W+/)[0]);
			self.setText(self.getText());
			self.cCol(0);				
		}

		self.keyHome = function() { self.cCol(0) };

		self.keyPageUp = function() {			
			//self.topLine();	
			//self.cLine();		
		}
		
		self.keyPageDown = function() {
			//self.topLine(self.topLine() + self.nLinesDisp);
			//self.cLine(self.cLine() + self.nLinesDisp);
		}		

		self.keyText = function(key) {
			var char = String.fromCharCode(key);
			var cCol = self.cCol();
			var text = self.getText();
			var origLength = text.length;

			if (cCol == text.length) text += char;
			else text = text.substring(0, cCol) + char + text.substring(cCol);

			text = self.translate(text);			
			self.cCol(cCol + (text.length - origLength));				
			self.setText(text);			
		}		

		self.keyTab = function() { for (var i = 1; i <= 4; i++) self.keyText(32) };

		return self;		
	}

	/*****
		Non-text key listener.
	*****/

	$(document).keydown( function(e) {
		var key = e.which;
//console.log(key);
		if (editor.actionKeys.indexOf(key) > -1) {
			e.preventDefault();
	
			if (key == 8 && (editor.cLine() > 1 || editor.cCol() > 0)) editor.keyBackspace();	
			else if (key == 9) editor.keyTab();
			else if (key == 33) editor.keyPageUp();
			else if (key == 34) editor.keyPageDown();					
			else if (key == 35 && editor.cCol() < editor.activeLineLength()) editor.keyEnd();
			else if (key == 36 && editor.cCol() > 0) editor.keyHome();
			else if (key == 37) editor.keyArrowLeft();
			else if (key == 38 && editor.cLine() > 1) editor.keyArrowUp();
			else if (key == 39) editor.keyArrowRight();						
			else if (key == 40 && editor.cLine() < editor.nLines()) editor.keyArrowDown();
			else if (key == 46 && (editor.cLine() < editor.nLines() || editor.cCol() < editor.activeLineLength())) editor.keyDelete();	
		}		
	});

	/*****
		Enter, text key listener.
	*****/

	$(document).keypress( function(e) {
		e.preventDefault();
		var key = e.which;		

		if (key == 13) editor.keyEnter();
		else editor.keyText(key);
	});

	editor = new Editor();	
	ko.applyBindings(editor);
	
});