/**!
 * AngularJS file upload shim for angular XHR HTML5 browsers
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.2.0
 */
if (window.XMLHttpRequest) {
	if (window.FormData) {
	    // allow access to Angular XHR private field: https://github.com/angular/angular.js/issues/1934
		XMLHttpRequest = (function(origXHR) {
			return function() {
				var xhr = new origXHR();
				xhr.setRequestHeader = (function(orig) {
					return function(header, value) {
						if (header === '__setXHR_') {
							value(xhr);
						} else {
							orig.apply(xhr, arguments);
						}
					}
				})(xhr.setRequestHeader);
				return xhr;
			}
		})(XMLHttpRequest);
	}
}
