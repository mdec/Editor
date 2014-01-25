

$(document).ready( function() {

	$("#text").keydown( function(e) {
		if (e.keyCode == 13 || e.keyCode == 9) {
			var cursorPosition = $("#text").prop("selectionStart");
			var text = $("#text").val(); 

			if (e.keyCode == 9) {
				e.preventDefault();
				$("#text").val(text.substring(0, cursorPosition) + "    " + text.substring(cursorPosition + 1));
			} else {

				var splitIndex = text.substring(0, cursorPosition).lastIndexOf(";");	
				var scanText = text.substring(splitIndex + 1, cursorPosition);

				if (scanText.trim() != "") {
					var replaceText = text.replace(scanText, sasEditor.replaceText(scanText) + ";");
					$("#text").val(replaceText);			
					var newCursorPosition = cursorPosition + replaceText.length - text.length;
					document.getElementById("text").setSelectionRange(newCursorPosition, newCursorPosition);
				}
			}		
		} 	
			
	});

	var sasEditor = {
		// properties		
		
		dictionary: {
			".ct" : "PROC CONTENTS data =",
			".d"  : "DATA",
			".e"  : "endsas",
			".fq" : "PROC FREQ data =",
			".mc" : "%macro",
			".md" : "%mend",
			".mg" : "merge",
			".mn" : "PROC MEANS data =",
			".op" : "output out =",
			".pr" : "PROC PRINT data =",
			".r"  : "RUN",
			".sr" : "PROC SORT data =",
			".t"  : "TITLE"
			},

		// methods
		initialize: function() {
				$.each(this.dictionary, function(key, value) {
					$("#words").append("<div class='word'>" + key + ": " + value + "</div>");
				});
			},

		replaceText: function(str) {
				var s = str;
				var dictKeys = Object.keys(this.dictionary);
				var sArray = s.split(" ");
				$.each(sArray, function(index, value) {
					if (dictKeys.indexOf(value) > -1) {
						s = s.replace(value, sasEditor.dictionary[value]);
					}
				});

				//$.each(this.dictionary, function(key, value) {
				//	s = s.replace(key, value);
				//});
				return s;		
			}

	};

	$("#scan").click( function() {
		
	});


	sasEditor.initialize();


});