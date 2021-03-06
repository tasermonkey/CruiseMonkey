(function() {
	'use strict';

	/* global ionic: true */

	angular.module('cruisemonkey.controllers.Menu', [
		'ionic',
		'cruisemonkey.Events',
		'cruisemonkey.User',
		'cruisemonkey.Util',
	])
	.controller('CMMenuCtrl', ['$rootScope', '$scope', '$state', '$timeout', '$ionicModal', '$ionicScrollDelegate', 'storage', 'util', 'EventService', 'UserService', function($rootScope, $scope, $state, $timeout, $ionicModal, $ionicScrollDelegate, storage, util, EventService, UserService) {
		console.log('CMMenuCtrl initializing.');

		var loginModal;

		$scope.unreadSeamail = 0;

		$scope.lastTab = storage.get('cruisemonkey.menu.last-tab');
		if (!$scope.lastTab) {
			$scope.lastTab = 'app.events.official';
		}

		$scope.logIn = function($event) {
			loginModal.show();
		};

		$scope.logOut = function() {
			console.log('Logging out.');
			UserService.reset();
		};

		$scope.go = util.go;

		$ionicModal.fromTemplateUrl('menu/login.html', {
			scope: $scope,
			focusFirstInput: true
		}).then(function(modal) {
			loginModal = modal;
		});

		$scope.active = function(viewName) {
			if (viewName === $scope.currentView) {
				return 'active';
			}
			return '';
		};

		$scope.$on('cruisemonkey.notify.unreadSeamail', function(ev, count) {
			$scope.unreadSeamail = count;
		});

		$scope.$on('cruisemonkey.user.updated', function(ev, newUser, oldUser) {
			loginModal.hide();
			$scope.closeKeyboard();
		});

		$scope.$on('cruisemonkey.login.failed', function() {
			loginModal.hide();
			$scope.closeKeyboard();
		});

		/** Ionic Events **/

		$rootScope.$on('$ionicView.beforeEnter', function(ev, info) {
			if (info.stateName) {
				console.log('currentView='+info.stateName);
				$scope.currentView = info.stateName;
			}
		});

		$scope.$on('$ionicView.beforeEnter', function(ev, info) {
			//console.log('Menu: beforeEnter:',ev,info);
			if (info.stateName && info.stateName.startsWith('app.events.')) {
				$scope.lastTab = info.stateName;
				storage.set('cruisemonkey.menu.last-tab', $scope.lastTab);
			} else if (info.stateName === 'app.events') {
				console.log('app.events? this should not happen');
				/*
				var newState = $scope.eventType? ('app.events.' + $scope.eventType) : 'app.events.official';
				console.log('Menu: app.events navigated, going to ' + newState + ' instead.');
				$timeout(function() {
					$state.go(newState);
				});
				*/
			}
		});

		$scope.$on('$destroy', function() {
			loginModal.remove();
		});

	}]);
}());
