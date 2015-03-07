angular.module( 'siwtngbp', [
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
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise( '/home' );
})

// for some reason state has to be injected
.run( function run ($injector, $state) {
    
    // self reference
    var controller = this;

    // inject external references
    var log = $injector.get('$log');
    var sessionStorage = $injector.get('$sessionStorage');
    var RestFactory = $injector.get('RestFactory');
    
    log.debug("run function");
   
    /* this is called:
     * - first page load
     * - redirect from twitter callback
     * - page reload
     */
    if (sessionStorage.session) {
        if (sessionStorage.oauthCallback) {
            log.debug ("one-time skipping of session validation during oauth callback");
            // only skip once
            sessionStorage.oauthCallback = '';
        } else {
            log.debug('validating session:'+sessionStorage.session.uuid);
            RestFactory.getSession(sessionStorage.session.authentication, sessionStorage.session.uuid)
            .success(function (validatedSession, status, headers, config) {
                log.debug('existing session validated:'+validatedSession.uuid);
                // update sessions, flags, and persist
                sessionStorage.session = validatedSession;
            })
            .error(function (error, status, headers, config) {
                sessionStorage.httpStatus = status;
                $state.go('httperror');
            });
        } 
    } else {
        log.debug('no existing session found');
    }
})

.controller( 'AppCtrl', ['$scope', '$injector', function ( $scope, $injector) {
    
    // self reference
    var controller = this;

    // inject external references
    var log = $injector.get('$log');
    var sessionStorage = $injector.get('$sessionStorage');
    var window = $injector.get('$window');
    var location = $injector.get('$location');
    var RestFactory = $injector.get('RestFactory');
    var state = $injector.get('$state');
    
    // flags
    $scope.showSpinner = false;

    // life cycle 
    $scope.$on('$viewContentLoaded', function contentLoaded() {
        log.debug('AppCtrl content loaded');
    });    
    
    $scope.$on('$destroy', function destroyed() {
        log.debug('AppCtrl destroyed');
        controller = null;  // against memory leaks
        $scope = null;    // against memory leaks
    });
    
    // save state and make updates on page change
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        // save fromState, needed for restore after login
        sessionStorage.fromState = fromState;
        // update title
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle + ' | siwtngbp' ;
        }
    });
    
    // utility method
    $scope.isLoggedIn = function () {
       if (sessionStorage.session) {
              return true;
        } else {
            return false;
        }   
    };
    
    /* logout  */
    $scope.logout = function() {
        RestFactory.endSession(sessionStorage.session.authentication, sessionStorage.session.uuid)
        .success(function () {
           sessionStorage.session='';
           sessionStorage.authentication = '';
           state.go('home');
        })
        .error(function (error, status, headers, config) {
            sessionStorage.session='';
            sessionStorage.authentication = '';
            log.debug('ignore any error on logout:'+status);
        });
    };

    /* convenience function  */
    $scope.getHandle = function() {
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
    
    /* spinner status */
    $scope.isSpinnerShown = function() {
        return RestFactory.getSpinnerStatus();
    };
    
    // LOGOUT DROPDOWN    
    $scope.status = {
            isopen: false
    };

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };    

}])

;

