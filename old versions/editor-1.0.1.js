
$(document).ready( function() {

	/*****
		Initialize editor values
	*****/

	var editor = {
		// properties

		actionKeys : [8, 35, 36, 37, 38, 40, 46],  // keys that do something other than insert text
		activeLineLength: 1, // length of current line
		cLine : 1,      // cursor line number
		cCol  : 1,	// cursor column number
                nLines : 1,	// number of total lines in use

		dictionary : {
			".fq" : "PROC FREQ data =",
			".pr" : "PROC PRINT data ="		
		},
		
		// methods

		longHand: function() {
			var dictKeys = Object.keys(this.dictionary);
			var lineWords = $("#line-text" + this.cLine).text().split(" ");
			$.each(lineWords, function(index, value) {
				if (dictKeys.indexOf(value) > -1) {
					$("#line-text" + editor.cLine).text( function(index, text) {
						return text.replace(value, editor.dictionary[value]);	
					});
				}
			});		
		},

		setActiveLine: function(lineNum) {
			// Toggle active class for the old line.
			$(".line-text-active").removeClass("line-text-active");
			// Set the new line class to active.
			$("#line-text" + this.cLine).addClass("line-text-active");

			// Save the length of the new active line, and restrict cCol to no more than that value.	
			this.activeLineLength = $("#line-text" + editor.cLine).text().length;
			if (this.cCol > this.activeLineLength) this.cCol = this.activeLineLength;			
		},

		updateInfo: function() {
			$("#info").text("Line: " + this.cLine + "/" + this.nLines + " Column: " + this.cCol + "/" + this.activeLineLength);
		}
		
	};

	editor.updateInfo();

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

	$(document).keydown( function(e) {
		var key = e.which;
//alert(key);
		if (editor.actionKeys.indexOf(key) > -1) {
			e.preventDefault();
	
			if (key == 8 && editor.cCol > 1) {	
				$("#line-text" + editor.cLine).text( function(index, text) {
					if (editor.cCol == text.length) {
						var out = text.substring(0, text.length - 1);
					} else {
						var out = text.substring(0, editor.cCol - 1) + text.substring(editor.cCol);
					}
					editor.cCol--;
					editor.activeLineLength--;	
					return out;
				});
			} else if (key == 35 && editor.cCol < editor.activeLineLength) {
				editor.cCol = editor.activeLineLength;
			} else if (key == 36) {
				editor.cCol = 1;
			} else if (key == 37 && editor.cCol > 1) {
				editor.cCol--;
			} else if (key == 38 && editor.cLine > 1) {
				editor.cLine--; 				
				editor.setActiveLine();				
			} else if (key == 40 && editor.cLine < editor.nLines) {
				editor.cLine++;
				editor.setActiveLine();				
			} else if (key == 46 && editor.cCol < editor.activeLineLength) {
				editor.activeLineLength--;
				$("#line-text" + editor.cLine).text( function(index, text) {
					return text.substring(0, editor.cCol - 1) + text.substring(editor.cCol + 2);
				});
			}
		}
		
		editor.updateInfo();
	});

	/*****
		When a key is pressed, either insert the character on the current line, or do something else (see
		comments specific to each if-block inside the function. 
	*****/

	$(document).keypress( function(e) {
		e.preventDefault();
		var key = e.which;
		

		if (key == 13) { // ENTER

			editor.longHand(); 	// Fill in any shortened words.

			// Change the ID values of all lines below it, and increment each line number div.
			for (var lineNum = editor.nLines; lineNum > editor.cLine; lineNum--) {					
				var lineNumPlus = lineNum + 1;
				$("#line-num" + lineNum).text(lineNumPlus);
				$("#line-num" + lineNum).attr("id", "line-num" + lineNumPlus);
				$("#line-text" + lineNum).attr("id", "line-text" + lineNumPlus);		
			};	

			// Insert new line number and text.
			var cLinePlus = editor.cLine + 1;				
			$("#line" + editor.cLine).after("<div class='line' id='line" + cLinePlus + "'>" +
"<div class='line-num' id='line-num" + cLinePlus + "'>" + cLinePlus + "</div>" + 
"<div class='line-text' id='line-text" + cLinePlus + "'>></div>" +
"</div>");

			editor.cLine++;		// Increment cursor line position.
			editor.cCol = 1;	// Reset cursor column position to 1.
			editor.nLines++;	// Increment the number of lines in the file.	
			editor.setActiveLine();	
		} else {	
			$("#line-text" + editor.cLine).text( function(index, text) {	
				var char = String.fromCharCode(key);
				if (editor.cCol == text.length) {
					text += char;
				} else {
					text = text.substring(0, editor.cCol) + char + text.substring(editor.cCol);
				}
				editor.cCol++;
				editor.activeLineLength++;				
				return text;
			});
		}
		editor.updateInfo();
	});


});