angular.module('siwtngbp.twittercallback', [
  'ui.router',
  'ngStorage'
]).config([
  '$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('twittercallback', {
      url: '/twittercallback',
      views: {
        'main': {
          controller: 'TwitterCallbackCtrl',
          templateUrl: 'callbacks/twitter/callback.tpl.html'
        }
      },
      data: { pageTitle: 'Twitter Callback' }
    });
  }
]).controller('TwitterCallbackCtrl', [
  '$scope',
  '$injector',
  function TwitterCallbackController($scope, $injector) {
    var controller = this;
    var sessionStorage = $injector.get('$sessionStorage');
    var log = $injector.get('$log');
    var RestFactory = $injector.get('RestFactory');
    var window = $injector.get('$window');
    var timeout = $injector.get('$timeout');
    var state = $injector.get('$state');
    $scope.$on('$viewContentLoaded', function contentLoaded() {
      log.debug('TwitterCallbackCtrl content loaded');
    });
    $scope.$on('$destroy', function destroyed() {
      log.debug('TwitterCallbackCtrl destroyed');
      controller = null;
      $scope = null;
    });
    var urlParams = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split(/[&#]/);
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      urlParams.push(hash[0]);
      urlParams[hash[0]] = hash[1];
    }
    console.log(urlParams);
    if (urlParams.hasOwnProperty('oauth_token') && urlParams.hasOwnProperty('oauth_verifier')) {
      log.debug('oauth parameters present');
      if (sessionStorage.authentication) {
        RestFactory.createSessionTwitter(sessionStorage.authentication.uuid, urlParams['oauth_token'], urlParams['oauth_verifier']).error(function (error, status, headers, config) {
          sessionStorage.httpStatus = status;
          state.go('httperror');
        }).success(function (createdSession) {
          log.debug('login success');
          sessionStorage.session = createdSession;
          var reloadPath = '/bin/index.html';
          if (sessionStorage.stateAfterLogin) {
            reloadPath += '#/' + sessionStorage.stateAfterLogin;
          }
          log.debug('window.location.reload:' + reloadPath);
          timeout(function () {
            window.location.href = reloadPath;
          }, 500);
        });
      } else {
        log.error('twitter callback problem - no authentication object');
        state.go('home');
      }
    } else {
      log.error('twitter callback problem - missing request parameters');
      state.go('home');
    }
  }
]);
;