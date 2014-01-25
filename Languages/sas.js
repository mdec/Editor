var language = { // Language-specific properties for coloring, shorthand, indenting, etc.
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

    var test = 3;
