angular.module('siwtngbp.httperror', [
  'ui.router',
  'ngStorage'
]).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('httperror', {
      url: '/httperror',
      views: {
        'main': {
          controller: 'HttpErrorCtrl',
          templateUrl: 'httperror/httperror.tpl.html'
        }
      },
      data: { pageTitle: 'HTTP Problem' }
    });
  }
]).controller('HttpErrorCtrl', [
  '$scope',
  '$injector',
  function httperrorController($scope, $injector) {
    var controller = this;
    var log = $injector.get('$log');
    var sessionStorage = $injector.get('$sessionStorage');
    var state = $injector.get('$state');
    var timeout = $injector.get('$timeout');
    $scope.$on('$viewContentLoaded', function contentLoaded() {
      log.debug('HttpErrorCtrl content loaded');
    });
    $scope.$on('$destroy', function destroyed() {
      log.debug('HttpErrorCtrl destroyed');
      controller = null;
      $scope = null;
    });
    $scope.errorMessage = 'oh, had some problems fetching something from the API';
    var statusCode = sessionStorage.httpStatus;
    if (statusCode) {
      if (statusCode >= 500) {
        $scope.errorMessage = 'Please check the API server';
      } else if (statusCode >= 400) {
        if (sessionStorage.session) {
          sessionStorage.session = '';
          sessionStorage.authentication = '';
          $scope.errorMessage = 'Your session may have expired, please login again';
          timeout(function () {
            state.go('login');
          }, 5000);
        } else {
          sessionStorage.authentication = '';
          $scope.errorMessage = 'Not sure what happened there, could you try that again?';
          timeout(function () {
            state.go('home');
          }, 5000);
        }
      }
    } else {
      sessionStorage.session = '';
      sessionStorage.authentication = '';
      $scope.errorMessage = 'Please check the API server is available';
    }
  }
]);
;