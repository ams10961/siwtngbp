angular.module('siwtngbp.login', [
  'ui.router',
  'ngStorage'
]).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('login', {
      url: '/login',
      views: {
        'main': {
          controller: 'LoginCtrl',
          templateUrl: 'login/login.tpl.html'
        }
      },
      data: { pageTitle: 'Login' }
    });
  }
]).controller('LoginCtrl', [
  '$scope',
  '$injector',
  function LoginController($scope, $injector) {
    var controller = this;
    var log = $injector.get('$log');
    var sessionStorage = $injector.get('$sessionStorage');
    var window = $injector.get('$window');
    var location = $injector.get('$location');
    var RestFactory = $injector.get('RestFactory');
    var state = $injector.get('$state');
    $scope.$on('$viewContentLoaded', function contentLoaded() {
      log.debug('LoginCtrl content loaded');
    });
    $scope.$on('$destroy', function destroyed() {
      log.debug('LoginCtrl destroyed');
      controller = null;
      $scope = null;
    });
    $scope.twitterLogin = function () {
      RestFactory.startSpinner();
      RestFactory.createAuthentication().error(function (error, status, headers, config) {
        RestFactory.stopSpinner();
        sessionStorage.httpStatus = status;
        state.go('httperror');
      }).success(function (authentication, status, headers, config) {
        log.debug('authentication created:' + authentication.uuid);
        sessionStorage.authentication = authentication;
        sessionStorage.oauthCallback = true;
        RestFactory.getRedirectUrl(sessionStorage.authentication.uuid).error(function (error, status, headers, config) {
          RestFactory.stopSpinner();
          sessionStorage.httpStatus = status;
          state.go('httperror');
        }).success(function (redirectData) {
          RestFactory.stopSpinner();
          log.debug('redirecting to twitter:');
          window.location.href = redirectData.redirectURL;
        });
      });
    };
  }
]);
;