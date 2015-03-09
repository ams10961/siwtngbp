angular.module('siwtngbp').factory('RestFactory', ['$injector', function($injector)  {

    // inject dependencies
    var sessionStorage = $injector.get('$sessionStorage');
    var log = $injector.get('$log');
    var location = $injector.get('$location');
    var http = $injector.get('$http');
    var showSpinner = false;
    
    // define factory object;
    var restFactory = {};

    // check location
    var restBaseUrl;
    if (location.$$absUrl.indexOf('file://') === 0 ) {
        restBaseUrl = 'https://localhost:8443/siwtapi/v1';
        log.debug('local REST services');
    } else {
        restBaseUrl = 'https://siwtapi-ams10961.rhcloud.com/v1';
        log.debug('remote REST services');
    }
   

    /* create guest session */
    restFactory.getRestBaseUrl = function () {
        return restBaseUrl;
    };
    
    /* create guest session */
    restFactory.activateApi = function () {
        return http.get(restBaseUrl + '/utility/activate', null);
    };

    /* create guest session */
    restFactory.createAuthentication = function () {
        return http.post(restBaseUrl + '/authentications', null);
    };

    /* get twitter redirection URL */
    restFactory.getRedirectUrl = function (authentication) {
        return http.get(restBaseUrl + '/twitter/redirect', 
                {headers: {'Authorization': authentication}});
    };

    /* create twitter session after callback */
    restFactory.createSessionTwitter = function (authentication, oauthToken, oauthVerifier) {
        var sessionData = {
                token: oauthToken, 
                verifier: oauthVerifier
        };
        return http.post(restBaseUrl + '/sessions/twitter', sessionData, 
                {headers: {'Authorization': authentication}});
    };

    /* get a session as validation */
    restFactory.getSession= function (authentication, uuid) {
        return http.get(restBaseUrl + '/sessions/' + uuid,
                {headers: {'Authorization': authentication}});
    };

    /* end a session */
    restFactory.endSession= function (authentication, uuid) {
        return http['delete'](restBaseUrl + '/sessions/' + uuid,
                {headers: {'Authorization': authentication}});
    };
    
    /* fetch spinner logic */
    restFactory.startSpinner = function () {
        showSpinner = true;
    };
    
    restFactory.stopSpinner = function () {
        showSpinner = false;
    };
    
    restFactory.getSpinnerStatus = function () {
        return showSpinner;
    };

    return restFactory;
}]);