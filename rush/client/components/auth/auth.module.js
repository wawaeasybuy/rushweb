'use strict';

angular.module('rushApp.auth', [
  'rushApp.constants',
  'rushApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
