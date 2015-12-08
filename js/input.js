'use strict';

var inputModule = angular.module('myApp.input', ['ngRoute']);

inputModule.controller('InputController', ['$scope', '$filter', 'schoolsInfo', function($scope, $filter, schoolsInfo) {

	$scope.hideCosts = true;
	$scope.hidePayments = true;
	$scope.hideLoans = true;
	$scope.hideDebt = true;
	$scope.hideDisclaimer = true;
	$scope.hideAbout = true;
	$scope.hideContact = true;

	var em1 = "ett.dev";
	var em2 = "eloper@g";
	var em3 = "mail.com";
	$scope.em = em1 + em2 + em3;
	
	$scope.schools = schoolsInfo.allSchools();
	
    var defaultCosts = {
    };

    $scope.costs = angular.copy(defaultCosts);

    $scope.payments = {
		scholarships: 0,
		assistanceships: 0,
		jobs: 0,
		savings: 0
    };

    $scope.data = {
		years: 2,
    };

	$scope.updateSchool = function() {
		// Reset cost notes
		$scope.costNotes = null;

		if ($scope.school) {
			// List programs
			$scope.programs = schoolsInfo.allPrograms($scope.school);
			// Fill in generic costs for the school
			if (schoolsInfo.schoolCosts($scope.school)) {
				$scope.costs = angular.copy(schoolsInfo.schoolCosts($scope.school));
				$scope.update();
			}
			// Add school-wide cost notes
			if (schoolsInfo.schoolNotes($scope.school)) {
				$scope.costNotes = schoolsInfo.schoolNotes($scope.school);
			}
		} else {
			// No school => no programs, no costs
			$scope.programs = [];
			$scope.costs = angular.copy(defaultCosts);
			$scope.update();
			// open up costs details
			$scope.hideCosts = false;
		}
	};
	
	$scope.updateProgram = function() {
		// Reset cost notes
		$scope.costNotes = null;
		// But restore if there are school-wide cost notes
		if ($scope.school && schoolsInfo.schoolNotes($scope.school)) {
			$scope.costNotes = schoolsInfo.schoolNotes($scope.school);
		}

		if ($scope.school && $scope.program) {
			var program = schoolsInfo.programInfo($scope.school, $scope.program);
			// Add/update program-specific costs
			if (program.costs) {
				angular.extend($scope.costs, program.costs);
			}
			//  Update program length
			if (program.years) {
				$scope.data.years = program.years;
			}
			// Add cost notes
			if (program.notes) {
				$scope.costNotes = program.notes;
			}
		} else {
			// If no program costs are available, open up costs details
			$scope.hideCosts = false;
			// No program => revert to school's generic costs
			if (schoolsInfo.schoolCosts($scope.school)) {
				$scope.costs = angular.copy(schoolsInfo.schoolCosts($scope.school));
			} else {
			// No program && No school costs => revert to default costs
				$scope.costs = angular.copy(defaultCosts);
			}
		}

		$scope.update();
	};

    $scope.repayment = {
		standard: {},
		extended: {},
		graduated10: {},
		graduated25: {}
    };

  	// loan info
    $scope.stafford = {
		origination: 0.01068,
		interest: 0.0584,
		yearlyMax: 20500
    };
    $scope.plus = {
		origination: 0.04272,
		interest: 0.0684,
    };

  	// http://stackoverflow.com/a/16449334
    var sum = function(obj) {
		var total = 0;
		
		for (var el in obj) {
		    if (obj.hasOwnProperty(el) && !isNaN(parseFloat(obj[el]))) {
				total += parseFloat(obj[el]);
		    }
		}
		
		return total;
    };

    var compounded = function(p, i, t) {
		return Math.pow((1 + i), t) * p;
    };

    var accumulatedDebt = function(amount, origination, interest, time) {
		return compounded(amount * (1 + origination), interest, time);
    };

    var singleYearLoanDebt = function(loanObj, time) {
		return accumulatedDebt(
		    loanObj.yearlyAmount,
		    loanObj.origination,
		    loanObj.interest,
		    time);
    };

    var multiYearLoanDebt = function(loanObj, numYears) {
    // assume loans are disbursed at the beginning of the academic year
		if (numYears == 1) {
		    return singleYearLoanDebt(loanObj, 1);
		} else {
		    return singleYearLoanDebt(loanObj, numYears) + multiYearLoanDebt(loanObj, numYears - 1);
		}
    };

    var aArgs = function() {
		return {
		    "principal": [$scope.stafford.gradDebt, $scope.plus.gradDebt],
		    "interestRate": [$scope.stafford.interest * 100, $scope.plus.interest * 100],
		    "monthsInRepayment": 0
		};
    };

    var monthlyPayment = function(paymentPlan, aArgs, sType) {
		return REPAYMENT[paymentPlan](aArgs, sType);
    };

    $scope.update = function() {
		$scope.totalCosts = sum($scope.costs);
		$scope.totalPayments = sum($scope.payments);
		$scope.totalLoans = $scope.totalCosts - $scope.totalPayments;

		if ($scope.totalLoans < $scope.stafford.yearlyMax) {
		    $scope.stafford.yearlyAmount = $scope.totalLoans;
		    $scope.plus.yearlyAmount = 0;
		} else {
		    $scope.stafford.yearlyAmount = $scope.stafford.yearlyMax;
		    $scope.plus.yearlyAmount = $scope.totalLoans - $scope.stafford.yearlyMax;
		}


		$scope.stafford.gradDebt = multiYearLoanDebt($scope.stafford, $scope.data.years);
		$scope.plus.gradDebt = multiYearLoanDebt($scope.plus, $scope.data.years);
		$scope.data.gradDebt = $scope.stafford.gradDebt + $scope.plus.gradDebt;

		$scope.repayment.standard.monthly = monthlyPayment("standardRepayment", aArgs(), "standard");
		$scope.repayment.standard.total = $scope.repayment.standard.monthly * 120;
		$scope.repayment.standard.interest = $scope.repayment.standard.total - $scope.data.gradDebt;

		// monthlyPayment() is returning 'Not Qualified' when fields are blank
		// Coerce to falsy NaN and then assign 0
		$scope.repayment.extended.monthly = parseFloat(monthlyPayment("standardRepayment", aArgs(), "extended")) || 0;
		$scope.repayment.extended.total = $scope.repayment.extended.monthly * 300;
		$scope.repayment.extended.interest = $scope.repayment.extended.total - $scope.data.gradDebt;

		$scope.repayment.graduated10.firstMonthly = monthlyPayment("graduatedRepayment", aArgs(), "standard");
		$scope.repayment.graduated10.lastMonthly = 3 * $scope.repayment.graduated10.firstMonthly;
		$scope.repayment.graduated10.averageMonthly = ($scope.repayment.graduated10.firstMonthly + $scope.repayment.graduated10.lastMonthly) / 2;
		$scope.repayment.graduated10.total = $scope.repayment.graduated10.averageMonthly * 120;
		$scope.repayment.graduated10.interest = $scope.repayment.graduated10.total - $scope.data.gradDebt;

		// monthlyPayment() is returning 'Not Qualified' as above
		$scope.repayment.graduated25.firstMonthly = parseFloat(monthlyPayment("graduatedRepayment", aArgs(), "extended")) || 0;
		$scope.repayment.graduated25.lastMonthly = 3 * $scope.repayment.graduated25.firstMonthly;
		$scope.repayment.graduated25.averageMonthly = ($scope.repayment.graduated25.firstMonthly + $scope.repayment.graduated25.lastMonthly) / 2;
		$scope.repayment.graduated25.total = $scope.repayment.graduated25.averageMonthly * 300;
		$scope.repayment.graduated25.interest = $scope.repayment.graduated25.total - $scope.data.gradDebt;

    };

    $scope.update();


}]);