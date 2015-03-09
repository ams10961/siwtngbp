angular.module('siwtngbp').factory('RestFactory', [
  '$injector',
  function ($injector) {
    var sessionStorage = $injector.get('$sessionStorage');
    var log = $injector.get('$log');
    var location = $injector.get('$location');
    var http = $injector.get('$http');
    var showSpinner = false;
    var restFactory = {};
    var restBaseUrl;
    if (location.$$absUrl.indexOf('file://') === 0) {
      restBaseUrl = 'https://localhost:8443/siwtapi/v1';
      log.debug('local REST services');
    } else {
      restBaseUrl = 'https://siwtapi-ams10961.rhcloud.com/v1';
      log.debug('remote REST services');
    }
    restFactory.getRestBaseUrl = function () {
      return restBaseUrl;
    };
    restFactory.activateApi = function () {
      return http.get(restBaseUrl + '/utility/activate', null);
    };
    restFactory.createAuthentication = function () {
      return http.post(restBaseUrl + '/authentications', null);
    };
    restFactory.getRedirectUrl = function (authentication) {
      return http.get(restBaseUrl + '/twitter/redirect', { headers: { 'Authorization': authentication } });
    };
    restFactory.createSessionTwitter = function (authentication, oauthToken, oauthVerifier) {
      var sessionData = {
          token: oauthToken,
          verifier: oauthVerifier
        };
      return http.post(restBaseUrl + '/sessions/twitter', sessionData, { headers: { 'Authorization': authentication } });
    };
    restFactory.getSession = function (authentication, uuid) {
      return http.get(restBaseUrl + '/sessions/' + uuid, { headers: { 'Authorization': authentication } });
    };
    restFactory.endSession = function (authentication, uuid) {
      return http['delete'](restBaseUrl + '/sessions/' + uuid, { headers: { 'Authorization': authentication } });
    };
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
  }
]);