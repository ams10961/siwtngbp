/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module( 'siwtngbp.login', [
  'ui.router',
  'ngStorage'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
    url: '/login',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'login/login.tpl.html'
      }
    },
    data:{ pageTitle: 'Login' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'LoginCtrl', ['$scope', '$injector', function LoginController( $scope, $injector ) {
    
    // self reference
    var controller = this;

    // inject external references
    var log = $injector.get('$log');
    var sessionStorage = $injector.get('$sessionStorage');
    var window = $injector.get('$window');
    var location = $injector.get('$location');
    var RestFactory = $injector.get('RestFactory');
    var state = $injector.get('$state');

    // life cycle 
    $scope.$on('$viewContentLoaded', function contentLoaded() {
        log.debug('LoginCtrl content loaded');
    });    
    $scope.$on('$destroy', function destroyed() {
        log.debug('LoginCtrl destroyed');
        controller = null;  // against memory leaks
        $scope = null;    // against memory leaks
    });
    
    // CONTROLLER LOGIC

    /* login with twitter */
    $scope.twitterLogin = function() {
        
        /* start spinner */
        RestFactory.startSpinner();
        
        /* create an authentication object for the request */
        RestFactory.createAuthentication()
        .error(function (error, status, headers, config) {
            /* server has probably refused a new session */
            RestFactory.stopSpinner();
            sessionStorage.httpStatus = status;
            state.go('httperror');   
        })        
        .success(function (authentication, status, headers, config) {
                log.debug('authentication created:'+authentication.uuid);

                // save authentication object
                sessionStorage.authentication = authentication;
                // mark oauth login in process, avoids reauthentication on page load
                sessionStorage.oauthCallback = true;

                // get twitter redirect URL
                RestFactory.getRedirectUrl(sessionStorage.authentication.uuid)
                .error(function (error, status, headers, config) {
                    RestFactory.stopSpinner();
                    sessionStorage.httpStatus = status;
                    state.go('httperror');   
                })                
                .success(function (redirectData) {
                    RestFactory.stopSpinner();
                    /* redirect to twitter*/
                    log.debug('redirecting to twitter:');
                    /* redirect browser */
                    window.location.href =  redirectData.redirectURL;
                });
        });
    };
}])
;

