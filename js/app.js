'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.input',
  'ui.bootstrap'
]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/grad-cost', {
		templateUrl: 'input/input.html',
		controller: 'InputController'
  });
  $routeProvider.otherwise({redirectTo: '/grad-cost'});
}]);
