/**
 * myApp module for FamilyMemberList SPA
    Module configured with Family Controller to list existing members and add new member
    Factory to get the list or add new member using XMLHttpRequest
 */


var myApp = angular.module("myApp", ['ngRoute']);
myApp.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.hashPrefix(''); //Required due to Hash Bang #!
    $routeProvider
        .when('/view1', {
            templateUrl: 'Partials/View1.html?d' + Math.random(), // Random query string for caching
            controller: 'FamilyController'
        })
        .when('/view2', {
            templateUrl: 'Partials/View2.html?r' + Math.random(), // Random query string for caching
            controller: 'FamilyController'
        })

        .otherwise({ redirectTo: '/view1' });
}]);

myApp.factory('myFactory', ["$http", function ($http) {
    var factory = {};

    factory.getMembers = function () {

        return $http({
            method: 'POST',
            url: 'Default.aspx/GetFamily',
            contentType: "application/json; charset=utf-8",
            data: '{update:"0"}', // Parameter to differentiate between fetch and update
            dataType: 'json'
        }).then(function (response) {
            return angular.fromJson(response.data);
        });

    };

    factory.addFMember = function (name, city, age) {
        return $http({
            method: 'POST',
            url: 'Default.aspx/GetFamily',
            contentType: "application/json; charset=utf-8",
            data: '{update:' + JSON.stringify('{ Name:"' + name + '","City":"' + city + '","Age":' + age + '}') + '}',
            dataType: 'json'
        }).then(function (response) {
            return angular.fromJson(response.data);
        });

    };

    return factory;
}]);

myApp.controller('FamilyController', function ($scope, myFactory) { // Injecting factory into controller function

    $scope.Family = [];

    init();

    function init() {

        myFactory.getMembers().then(function (data) {
            $scope.Family = angular.fromJson(data.d);
        });


    }

    // Adding new member using factory
    $scope.addMemberFact = function () {
        myFactory.addFMember($scope.newMember.name, $scope.newMember.city, $scope.newMember.age).then(function (data) {
            $scope.Family = angular.fromJson(data.d);
        });
        $scope.newMember.name = $scope.newMember.city = $scope.newMember.age = null; // Reset text
    }; 

});