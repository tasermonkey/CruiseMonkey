(function() {
	'use strict';

	/*global ionic: true*/

	angular.module('cruisemonkey.Seamail', [
		'angularLocalStorage',
		'cruisemonkey.Settings',
		'cruisemonkey.User'
	])
	.factory('SeamailService', ['$q', '$rootScope', '$timeout', '$interval', '$http', 'SettingsService', 'UserService', 'storage', function($q, $rootScope, $timeout, $interval, $http, SettingsService, UserService, storage) {
		var interval = null;

		$rootScope.seamailCount = storage.get('cruisemonkey.seamail.count') || 0;
		var updateSeamailCount = function() {
			if ($rootScope.seamailCount === undefined) {
				storage.remove('cruisemonkey.seamail.count');
			} else {
				storage.set('cruisemonkey.seamail.count', $rootScope.seamailCount);
			}
		};

		var getSeamailCount = function() {
			if (!UserService.loggedIn()) {
				console.log('SeamailService: Skipping update, user is not logged in.');
				return;
			}

			console.log('SeamailService: Checking for seamail updates.');
			var twitarrRoot = SettingsService.getTwitarrRoot();
			var user = UserService.get();

			$http({
				method: 'GET',
				url: twitarrRoot + 'api/v2/user/new_seamail',
				params: {
					key: user.key
				},
				cache: false,
				timeout: 5000,
				headers: {
					Accept: 'application/json'
				}
			})
			.success(function(data, status, headers, config) {
				console.log('SeamailService: Success!');
				if (data.status === 'ok') {
					if (data.email_count > $rootScope.seamailCount) {
						var message = 'You have ' + data.email_count + ' new messages in your Seamail inbox!';
						if ($rootScope.foreground) {
							// notifications.status(message, 5000);
						} else {
						}
					}
					$rootScope.seamailCount = data.email_count;
					updateSeamailCount();
				}
			})
			.error(function(data, status, headers, config) {
				console.log('SeamailService: Failed to get seamail update.');
				/*
				console.log('data:', data);
				console.log('status:',status);
				console.log('headers:',headers);
				console.log('config:',config);
				*/
			});
		};

		var startSynchronization = function() {
			if (interval) {
				console.log('SeamailService.startSynchronization(): sync already active.');
				return;
			}

			console.log('SeamailService.startSynchronization(): starting synchronization.');
			interval = $interval(getSeamailCount, (10 * 60 * 1000)); // 10 minutes
			getSeamailCount();
		};

		var stopSynchronization = function() {
			if (!interval) {
				console.log('SeamailService.startSynchronization(): sync not active.');
				return;
			}

			var ret = $interval.cancel(interval);
			interval = null;
			return ret;
		};

		return {
			'online': startSynchronization,
			'offline': stopSynchronization
		};
	}]);
}());
