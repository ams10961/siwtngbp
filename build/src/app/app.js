angular.module('siwtngbp', [
  'templates-app',
  'templates-common',
  'siwtngbp.home',
  'siwtngbp.about',
  'siwtngbp.httperror',
  'siwtngbp.login',
  'siwtngbp.twittercallback',
  'ui.router',
  'ui.bootstrap',
  'ngStorage'
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  function myAppConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
  }
]).run([
  '$injector',
  '$state',
  function run($injector, $state) {
    var controller = this;
    var log = $injector.get('$log');
    var sessionStorage = $injector.get('$sessionStorage');
    var RestFactory = $injector.get('RestFactory');
    log.debug('run function');
    if (sessionStorage.session) {
      if (sessionStorage.oauthCallback) {
        log.debug('one-time skipping of session validation during oauth callback');
        sessionStorage.oauthCallback = '';
      } else {
        log.debug('validating session:' + sessionStorage.session.uuid);
        RestFactory.getSession(sessionStorage.session.authentication, sessionStorage.session.uuid).success(function (validatedSession, status, headers, config) {
          log.debug('existing session validated:' + validatedSession.uuid);
          sessionStorage.session = validatedSession;
        }).error(function (error, status, headers, config) {
          sessionStorage.httpStatus = status;
          $state.go('httperror');
        });
      }
    } else {
      log.debug('no existing session found');
    }
  }
]).controller('AppCtrl', [
  '$scope',
  '$injector',
  function ($scope, $injector) {
    var controller = this;
    var log = $injector.get('$log');
    var sessionStorage = $injector.get('$sessionStorage');
    var window = $injector.get('$window');
    var location = $injector.get('$location');
    var RestFactory = $injector.get('RestFactory');
    var state = $injector.get('$state');
    $scope.showSpinner = false;
    $scope.$on('$viewContentLoaded', function contentLoaded() {
      log.debug('AppCtrl content loaded');
    });
    $scope.$on('$destroy', function destroyed() {
      log.debug('AppCtrl destroyed');
      controller = null;
      $scope = null;
    });
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      sessionStorage.fromState = fromState;
      if (angular.isDefined(toState.data.pageTitle)) {
        $scope.pageTitle = toState.data.pageTitle + ' | siwtngbp';
      }
    });
    $scope.isLoggedIn = function () {
      if (sessionStorage.session) {
        return true;
      } else {
        return false;
      }
    };
    $scope.logout = function () {
      RestFactory.endSession(sessionStorage.session.authentication, sessionStorage.session.uuid).success(function () {
        sessionStorage.session = '';
        sessionStorage.authentication = '';
        state.go('home');
      }).error(function (error, status, headers, config) {
        sessionStorage.session = '';
        sessionStorage.authentication = '';
        log.debug('ignore any error on logout:' + status);
      });
    };
    $scope.getHandle = function () {
      if (sessionStorage.session) {
        if (sessionStorage.session.user.type == 'T') {
          return '@' + sessionStorage.session.user.handle;
        } else {
          return sessionStorage.session.user.handle;
        }
      } else {
        return ' ';
      }
    };
    $scope.isSpinnerShown = function () {
      return RestFactory.getSpinnerStatus();
    };
    $scope.status = { isopen: false };
    $scope.toggleDropdown = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };
  }
]);
;