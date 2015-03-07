angular.module('siwtngbp.home', ['ui.router']).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('home', {
      url: '/home',
      views: {
        'main': {
          controller: 'HomeCtrl',
          templateUrl: 'home/home.tpl.html'
        }
      },
      data: { pageTitle: 'Home' }
    });
  }
]).controller('HomeCtrl', [
  '$scope',
  '$injector',
  function LoginController($scope, $injector) {
    var controller = this;
    var log = $injector.get('$log');
    $scope.$on('$viewContentLoaded', function contentLoaded() {
      log.debug('HomeCtrl content loaded');
    });
    $scope.$on('$destroy', function destroyed() {
      log.debug('HomeCtrl destroyed');
      controller = null;
      $scope = null;
    });
  }
]);
;