file.upload = $upload
		.upload({
			url : $scope.s3url,
			method : 'POST',
			data : {
				key : file.name,
				AWSAccessKeyId : $scope.AWSAccessKeyId,
				acl : $scope.acl,
				policy : $scope.policy,
				signature : $scope.signature,
				"Content-Type" : file.type === null || file.type === '' ? 'application/octet-stream' : file.type,
				filename : file.name
			},
			file : file,
		});

file.upload.then(function(response) {
	$timeout(function() {
		file.result = response.data;
	});
}, function(response) {
	if (response.status > 0)
		$scope.errorMsg = response.status + ': ' + response.data;
});

file.upload.progress(function(evt) {
	file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
});
