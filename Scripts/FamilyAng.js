/**
 * myApp module for FamilyMemberList SPA
    Module configured with Family Controller to list existing members and add new member
    Factory to get the list or add new member using $http
 */



var myApp = angular.module("myApp", ['ngRoute', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.edit', 'ui.grid.rowEdit','ui.grid.validate']);
myApp.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.hashPrefix(''); //Required due to Hash Bang #!
    $routeProvider
        .when('/view3', {
            templateUrl: 'Partials/View3.html?d' + Math.random(), // Random query string for caching
            controller: 'FamilyControllerForGrid'
        })
        .when('/view2', {
            templateUrl: 'Partials/View2.html?r' + Math.random(), // Random query string for caching
            //controller: 'FamilyController'
        })
        .when('/view1', {
            templateUrl: 'Partials/View1.html?r' + Math.random(), // Random query string for caching
            controller: 'FamilyController'
        })

        .otherwise({ redirectTo: '/view3' });
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

    factory.SaveChanges = function (dirtyRecords) {
        //console.log(dirtyRecords);

        for (var i = 0; i < dirtyRecords.length; i++) {
            delete dirtyRecords[i].$$hashKey;
        }
        
        //console.log(dirtyRecords);

        return $http({
            method: 'POST',
            url: 'Default.aspx/SaveChanges',
            contentType: "application/json; charset=utf-8",
            data: "{'Records':'" + JSON.stringify(dirtyRecords) + "'}",
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


    factory.deleteFMember = function (fMember) {
        for (var i = 0; i < fMember.length; i++) {
            delete fMember[i].$$hashKey;
            
        }

        console.log(fMember);
        return $http({
            method: 'POST',
            url: 'Default.aspx/DeleteFamilyMembers',
            contentType: "application/json; charset=utf-8",
           // data: '{members:' + JSON.stringify(fMember) + '}',
            data: "{'members':'" + JSON.stringify(fMember) + "'}",
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

myApp.controller('FamilyControllerForGrid', function ($scope, $filter,$window, myFactory, uiGridConstants) { // Injecting factory into controller function

    $scope.Family = [];
    $scope.msg = {};

    var ageValidation = "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\"  min=0 max=100 required><div style=\"border: 2px solid red\" ng-show=\"!inputForm.$valid\"><span style=\"font-size:8pt\",\"vertical-align: top\">Age should be between 0 to 100!</span></div></form></div>";
    var reqValidation = "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\"  required><div style=\"border: 2px solid red\" ng-show=\"!inputForm.$valid\"><span style=\"font-size:8pt\",\"vertical-align: top\">Required Field !</span></div></form></div>";

    $scope.gridOptions = {
        rowEditWaitInterval: -1,
        enableFiltering: true, enablePagination: true, enablePaginationControls: true,
        enableRowSelection: false,
        enableCellEditOnFocus: true,
        enableSelectAll: true,
        showGridFooter: true,
        multiSelect: true,
        selectionRowHeaderWidth: 35,
        rowHeight: 50,
        enableCellSelection: true,
        paginationPageSizes: [10, 15, 25],
        paginationPageSize: 10,
        columnDefs: [
            { field: 'Id', enableCellEdit: false, visible: false },
            {
                field: 'Name', enableCellEdit: true, Width: "*", editableCellTemplate: reqValidation, cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                    return "";
                }
            },
            {
                field: 'City', enableCellEdit: true, Width: "*", editableCellTemplate: reqValidation, cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                    return "";
                }
            },
            {
                field: 'Age', enableCellEdit: true, Width: "*", type: 'number', editableCellTemplate: ageValidation, cellClass: ""
            }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                $scope.msg.lastCellEdited = 'edited member:' + rowEntity.Name + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue;
   
                colDef.cellClass = function (grid, row, col, rowRenderIndex, colRenderIndex) {
                    row.entity.dirty = row.entity.dirty || {}
                        if (rowEntity.Id === row.entity.Id && newValue !== oldValue) {
                            rowEntity.dirty[col.displayName] = true;
                        }
                        if (row.entity.dirty[col.displayName])
                            return 'dirty';
                        return "";
                    };
                   
                    $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
          
            });

        }
    };
    init();

    $scope.getSelectedRows = function () {
        $scope.mySelectedRows = $scope.gridApi.selection.getSelectedRows();
    };

    function init() {

        myFactory.getMembers().then(function (data) {

            $scope.Family = angular.fromJson(data.d);
            $scope.gridOptions.data = $scope.Family;
            
        });


    }

    $scope.SaveChanges = function () {

        $scope.gridDirtyRows = $scope.gridApi.rowEdit.getDirtyRows($scope.gridApi.grid)
        var dataDirtyRows = $scope.gridDirtyRows.map(function (gridRow) {
            return gridRow.entity;
        });
        //console.log(dataDirtyRows);
        myFactory.SaveChanges(dataDirtyRows).then(function (data) {
            $scope.Family = angular.fromJson(data.d);
            $scope.gridOptions.data = $scope.Family;
            $scope.gridApi.rowEdit.setRowsClean(dataDirtyRows);
            $window.alert('All Changes are saved');
        });
 
    };

    // Adding new member using factory
    $scope.addMemberFact = function () {
        myFactory.addFMember($scope.newMember.name, $scope.newMember.city, $scope.newMember.age).then(function (data) {
            $scope.Family = angular.fromJson(data.d);
            $scope.gridOptions.data = $scope.Family;
            $window.alert('New Member added successfully');
        });
       
        $scope.newMember.name = $scope.newMember.city = $scope.newMember.age = ''; // Reset Fields
        
    };

    // Adding new member using factory
    $scope.deletMembersFact = function () {
        myFactory.deleteFMember($scope.gridApi.selection.getSelectedRows()).then(function (data) {
            $scope.Family = angular.fromJson(data.d);
            $scope.gridOptions.data = $scope.Family;
            $window.alert('Selected members are deleted');
        });
    };

});