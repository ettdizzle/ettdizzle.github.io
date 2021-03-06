inputModule.factory('schoolsInfo', function() {
    var programDetails = {
        "Georgetown": {
            notes: "Personal costs include all living expenses.",
            costs: {
                personal: 20296,
                transportation: 1320              
            },
            programs: {
                "Graduate Arts & Sciences or Biomedical Sciences": {
                    years: 2,
                    costs: {
                        books: 1300,
                        tuition: 47754                        
                    }
                }
            }
        },
        "Harvard": {
            notes: "Costs are for 9 month academic year. Personal costs include food.",
            costs: {
                housing: 11770,
                insurance: 1042 + 2390,
                personal: 14318                
            },
            programs: {
                "MBA": {
                    notes: "Costs are for 9 month academic year. Fees include books. Personal costs include food.", 
                    years: 2,
                    costs: {
                        fees: 7655,
                        tuition: 61225                        
                    }
                }
            }
        },
        "Johns Hopkins": {
            costs: {                
                housing: 13970,
                food: 4500,
                insurance: 1800,
                books: 1500,
                personal: 3000,
                transportation: 1000
            },
            programs: {
                "MA, SAIS (in DC both years)": {
                    years: 2,
                    costs: {
                        fees: 450,
                        tuition: 42992                        
                    }
                }
            }
        },
        "Tufts": {
            notes: "Housing and food are for on-campus during the academic year.",
            costs: {                
                housing: 5900,
                food: 3562,
                insurance: 2451,
                fees: 756,
                personal: 2250
            },
            programs: {
                "MALD, Fletcher": {
                    years: 2,
                    costs: {
                        books: 1000,
                        tuition: 42234                        
                    }
                }
            }
        },
        "UC Berkeley": {
            costs: {
                housing: 12618,
                food: 7138,
                insurance: 3754,
                books: 796,
                personal: 1548,
                transportation: 3020
            }, 
            programs: {
                "MS, Non-professional": {
                    years: 2,
                    costs: {
                        tuition: (13432 + 15102),
                        fees: 0
                    }
                },
                "MS, Non-professional (in state)": {
                    years: 2,
                    costs: {
                        tuition: 13432,
                        fees: 0
                    }
                }
            }           
        },
        "University of Pennsylvania": {
            costs: {
                housing: 14400,
                food: 6000,
                personal: 3600,
                transportation: 240,
                insurance: 3300
            }, 
            programs: {
                "MD": {
                    notes: "Based on second year costs. Does not include USMLE expenses.",
                    years: 4,
                    costs: {
                        tuition: 52210,
                        fees: 2686 + 1326 + 514 + 48,
                        books: 550,
                        transportation: 240 + 200,                      
                    }
                }
            }
        },
        "Widener": {
            costs: {
                fees: 248 + 50,
                housing: 8190,
                food: 1328 * 2,
                books: 1200,
                personal: 1188,
                transportation: 2700
            }, 
            programs: {
                "PSY D": {
                    years: 5,
                    costs: {
                        tuition: 29468                        
                    }
                }
            }
        }
    };

    var schoolsInfoObject = {
        allSchools: function() {
            return Object.keys(programDetails);
        },
        schoolCosts: function(schoolName) {
            return programDetails[schoolName]['costs'];
        },
        schoolNotes: function(schoolName) {
            return programDetails[schoolName]['notes'];
        },
        allPrograms: function(schoolName) {
            return Object.keys(programDetails[schoolName]['programs']);
        },
        programInfo: function(schoolName, programName) {
            return programDetails[schoolName]['programs'][programName];
        }
    };

    return schoolsInfoObject;
});

inputModule.filter('toCurrency', function($filter) {
    return function(num) {
	return $filter('currency')(num, "$", 0);
    };
});

inputModule.filter('toPercent', function($filter) {
    return function(num) {
	return $filter('number')(num * 100, 2) + "%";
    };
});

// http://stackoverflow.com/a/19862014
// http://stackoverflow.com/a/33106794
inputModule.directive('format', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(ctrl.$modelValue);
            });

            ctrl.$parsers.unshift(function (viewValue) {
                var cursorPointer = elem[0].selectionStart;
                var elemLength = elem[0].value.length;
                var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter('number')(plainNumber));
                
                // Retain cursor position if not already at end
                if (cursorPointer != elemLength) {
                	elem[0].setSelectionRange(cursorPointer, cursorPointer);
                }

                return plainNumber;
            });
        }
    };
}]);