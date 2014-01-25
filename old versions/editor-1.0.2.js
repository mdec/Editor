
$(document).ready( function() {

	/*****
		Editor object has tracking properties and methods for updating them.
	*****/

	var editor = {
		// properties

		actionKeys : [8, 35, 36, 37, 38, 39, 40, 46],  // keys that do something other than insert text
		activeLineLength: 0, // length of current line
		cCol  : 0,	// cursor column number
                cLine : 1,      // cursor line number
		nLines : 1,	// number of total lines in memory
		
		cursorChar: "|",
		text: ["|", "|"],
		
		dictionary : {
			".fq" : "PROC FREQ data =",
			".pr" : "PROC PRINT data =",
			".r"  : "RUN;"		
		},

		
		// methods

		/*****
			Key actions:
			backspace (8) 	: kill the character in front of the cursor column and decrease the column position. 
			end (35)	: go to the end of the current line
			home (36) 	: set column position to 1
			<- arrow (37) 	: decrease the cursor column position by 1 (but not past 0).
			up arrow (38) 	: decrease the cursor line position by 1 (but not past 0).
			down arrow (40) : increase the cursor line position by 1 (but not past the total number of lines).
			delete (46)   	: remove the character to the right of the cursor position
		*****/

		keyArrowDown: function() {
			this.cLine++;
			this.setActiveLine();							
		},
			
		keyArrowLeft: function() {
			this.cCol--;
		},
	
		keyArrowRight: function() {
			this.cCol++;
		},

		keyArrowUp: function() {
			this.cLine--; 				
			this.setActiveLine();	
		},

		keyBackspace: function() {
			var cCol = this.cCol;
			var text = this.text[0];				
			if (cCol == text.length) {
				text = text.substring(0, text.length - 1);
			} else {
				text = text.substring(0, cCol - 1) + text.substring(cCol);
			}
			this.cCol--;	
			this.updateText(text);
		},

		keyDelete: function() {
			var cCol = this.cCol;		
			var text = this.text[0];		
			text = text.substring(0, cCol - 1) + text.substring(cCol + 2);
			this.activeLineLength--;			
			this.updateText(text);
			// TODO: when cCol == 0, remove the line and move lines below up.
		},
	
		keyEnd: function() {
			this.cCol = this.activeLineLength;
		},

		keyEnter: function() {
			this.longHand(); 	// Fill in any shortened words.

			// Insert divs for new line number and text.			
			$("#editor").append("<div class='line'><div class='line-num'></div><div class='line-text'></div></div>");

			this.text.splice(this.cLine + 1, 0, this.cursorChar); // Splice in a blank line.

			this.cLine++;	// Increment cursor line position.
			this.nLines++;	// Increment the number of lines in the file.	
			this.cCol = 0;	// Reset cursor column position to 1.

			$(".line-text").slice(editor.cLine - 1).each( function(index) {
				$(this).text(editor.text[index + editor.cLine]);
			});

			$(".line-num").slice(editor.cLine - 1).each( function(index) {
				$(this).text(index + editor.cLine);
			});			
			
			this.setActiveLine();	
		},

		keyHome: function() {
			this.cCol = 0;
		},

		keyText: function(key) {
			var char = String.fromCharCode(key);
			var cCol = this.cCol;
			var text = this.text[0];

			if (editor.cCol == text.length) {
				text += char;
			} else {
				text = text.substring(0, cCol) + char + text.substring(cCol);
			}
			
			this.updateText(text);
			this.cCol++;
			this.activeLineLength++;
	
			$("#cursor").css("left", "+=10px");
		},
		
		longHand: function() {
			var cLine = this.cLine;
			var dictKeys = Object.keys(this.dictionary);
			var text = this.text[0];			
			var textWords = text.split(" ");
			
			$.each(textWords, function(index, value) {
				if (dictKeys.indexOf(value) > -1) {
					text = text.replace(value, editor.dictionary[value]);						
				}
			});
			editor.updateText(text);		
		},

		setActiveLine: function() {
			// Toggle active class for the old line.
			$(".line-text-active").removeClass("line-text-active");
			// Set the new line class to active.
			$(".line-text").eq(this.cLine - 1).addClass("line-text-active");

			// Save the length of the new active line, and restrict cCol to no more than that value.	
			this.text[0] = this.text[this.cLine];
			this.activeLineLength = this.text[0].length;
			if (this.cCol > this.activeLineLength) this.cCol = this.activeLineLength;			
		},

		updateInfo: function() {
			$("#info").text("Line: " + this.cLine + "/" + this.nLines + " Column: " + this.cCol + "/" + this.activeLineLength);
		},

		updateText: function(text) {
			this.text[0] = text;
			this.text[this.cLine] = text;
			var cLineIndex = this.cLine - 1;
			$(".line-text").eq(cLineIndex).text(text);
			$(".line-num").eq(cLineIndex).text(this.cLine);
		}	
	};

	/*****
		Non-text key listener.
	*****/

	$(document).keydown( function(e) {
		var key = e.which;
//alert(key);
		if (editor.actionKeys.indexOf(key) > -1) {
			e.preventDefault();
	
			if (key == 8 && editor.cCol > 0) {
				editor.keyBackspace();			
			} else if (key == 35 && editor.cCol < editor.activeLineLength) {
				editor.keyEnd();
			} else if (key == 36) {
				editor.keyHome();
			} else if (key == 37 && editor.cCol > 0) {
				editor.keyArrowLeft();
			} else if (key == 38 && editor.cLine > 1) {
				editor.keyArrowUp();
			} else if (key == 39 && editor.cCol < editor.activeLineLength) {
				editor.keyArrowRight();						
			} else if (key == 40 && editor.cLine < editor.nLines) {
				editor.keyArrowDown();
			} else if (key == 46 && editor.cCol < editor.activeLineLength) {
				editor.keyDelete();	
			}
		}		
		editor.updateInfo();
	});

	/*****
		Enter, text key listener.
	*****/

	$(document).keypress( function(e) {
		e.preventDefault();
		var key = e.which;		

		if (key == 13) { // ENTER
			editor.keyEnter();
		} else {
			editor.keyText(key);
		}
		editor.updateInfo();
	});

	editor.updateInfo();
	
});