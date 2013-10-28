/*global URL, webkitURL, dataURLtoBlob*/

(function (window, undef){
	'use strict';

	var
		gid = 1,
		noop = function (){},
		userAgent = navigator.userAgent,

		// https://github.com/blueimp/JavaScript-Load-Image/blob/master/load-image.js#L48
		apiURL = (window.createObjectURL && window) || (window.URL && URL.revokeObjectURL && URL) || (window.webkitURL && webkitURL),

		Blob = window.Blob,
		File = window.File,
		FileReader = window.FileReader,
		FormData = window.FormData,
		XMLHttpRequest = window.XMLHttpRequest,
		jQuery = window.jQuery,

		html5 =    !!(File && (FileReader && (window.Uint8Array || FormData || XMLHttpRequest.prototype.sendAsBinary)))
				&& !(/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent) && /windows/i.test(userAgent)), // BugFix: https://github.com/mailru/FileAPI/issues/25

		cors = html5 && ('withCredentials' in (new XMLHttpRequest)),
		
		chunked = html5 && !!Blob && !!(Blob.prototype.webkitSlice||Blob.prototype.mozSlice||Blob.prototype.slice),

		document = window.document,

		// https://github.com/blueimp/JavaScript-Canvas-to-Blob
		dataURLtoBlob = window.dataURLtoBlob,

		_rimg = /img/i,
		_rcanvas = /canvas/i,
		_rimgcanvas = /img|canvas/,
		_rinput = /input/i,
		_rdata = /^data:[^,]+,/,

		_pow = Math.pow,
		_round = Math.round,
		_num = Number,
		_from = function (sz) { return _round(sz * this); },

		_KB = new _num(1024),
		_MB = new _num(_pow(_KB, 2)),
		_GB = new _num(_pow(_KB, 3)),
		_TB = new _num(_pow(_KB, 4)),

		_elEvents = {}, // element event listeners
		_infoReader = [], // list of file info processors

		_readerEvents = 'abort progress error load loadend',
		_xhrPropsExport = 'status statusText readyState response responseXML responseText responseBody'.split(' '),

		currentTarget = 'currentTarget',
		preventDefault = 'preventDefault',

		api = {
			version: '1.2.6',

			cors: false,
			html5: true,
			debug: false,
			pingUrl: false,
			flashAbortTimeout: 0,
			withCredentials: true,

			staticPath: './',

			flashUrl: 0, // @default: './FileAPI.flash.swf'
			flashImageUrl: 0, // @default: './FileAPI.flash.image.swf'

			postNameConcat: function (name, idx){
				return name + (idx != null ? '['+ idx +']' : '');
			},

			ext2mime: {
				  jpg: 'image/jpeg'
				, tif: 'image/tiff'
			},

			// Fallback for flash
			accept: {
				  'image/*': 'art bm bmp dwg dxf cbr cbz fif fpx gif ico iefs jfif jpe jpeg jpg jps jut mcf nap nif pbm pcx pgm pict pm png pnm qif qtif ras rast rf rp svf tga tif tiff xbm xbm xpm xwd'
				, 'audio/*': 'm4a flac aac rm mpa wav wma ogg mp3 mp2 m3u mod amf dmf dsm far gdm imf it m15 med okt s3m stm sfx ult uni xm sid ac3 dts cue aif aiff wpl ape mac mpc mpp shn wv nsf spc gym adplug adx dsp adp ymf ast afc hps xs'
				, 'video/*': 'm4v 3gp nsv ts ty strm rm rmvb m3u ifo mov qt divx xvid bivx vob nrg img iso pva wmv asf asx ogm m2v avi bin dat dvr-ms mpg mpeg mp4 mkv avc vp3 svq3 nuv viv dv fli flv wpl'
			},

			chunkSize : 0,
			chunkUploadRetry : 0,
			chunkNetworkDownRetryTimeout : 2000, // milliseconds, don't flood when network is down

			KB: (_KB.from = _from, _KB),
			MB: (_MB.from = _from, _MB),
			GB: (_GB.from = _from, _GB),
			TB: (_TB.from = _from, _TB),

			expando: 'fileapi' + (new Date).getTime(),

			uid: function (obj){
				return	obj
					? (obj[api.expando] = obj[api.expando] || api.uid())
					: (++gid, api.expando + gid)
				;
			},

			log: function (){
				if( api.debug && window.console && console.log ){
					if( console.log.apply ){
						console.log.apply(console, arguments);
					}
					else {
						console.log([].join.call(arguments, ' '));
					}
				}
			},

			/**
			 * Create new image
			 *
			 * @param {String} [src]
			 * @param {Function} [fn]   1. error -- boolean, 2. img -- Image element
			 * @returns {HTMLElement}
			 */
			newImage: function (src, fn){
				var img = document.createElement('img');
				if( fn ){
					api.event.one(img, 'error load', function (evt){
						fn(evt.type == 'error', img);
						img = null;
					});
				}
				img.src = src;
				return	img;
			},

			/**
			 * Get XHR
			 * @returns {XMLHttpRequest}
			 */
			getXHR: function (){
				var xhr;

				if( XMLHttpRequest ){
					xhr = new XMLHttpRequest;
				}
				else if( window.ActiveXObject ){
					try {
						xhr = new ActiveXObject('MSXML2.XMLHttp.3.0');
					} catch (e) {
						xhr = new ActiveXObject('Microsoft.XMLHTTP');
					}
				}

				return  xhr;
			},

			isArray: isArray,

			support: {
				dnd:     cors && ('ondrop' in document.createElement('div')),
				cors:    cors,
				html5:   html5,
				chunked: chunked,
				dataURI: true
			},

			event: {
				  on: _on
				, off: _off
				, one: _one
				, fix: _fixEvent
			},


			throttle: function(fn, delay) {
				var id, args;

				return function _throttle(){
					args = arguments;

					if( !id ){
						fn.apply(window, args);
						id = setTimeout(function (){
							id = 0;
							fn.apply(window, args);
						}, delay);
					}
				};
			},


			F: function (){},


			parseJSON: function (str){
				var json;
				if( window.JSON && JSON.parse ){
					json = JSON.parse(str);
				}
				else {
					json = (new Function('return ('+str.replace(/([\r\n])/g, '\\$1')+');'))();
				}
				return json;
			},


			trim: function (str){
				str = String(str);
				return	str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
			},

			/**
			 * Simple Defer
			 * @return	{Object}
			 */
			defer: function (){
				var
					  list = []
					, result
					, error
					, defer = {
						resolve: function (err, res){
							defer.resolve = noop;
							error	= err || false;
							result	= res;

							while( res = list.shift() ){
								res(error, result);
							}
						},

						then: function (fn){
							if( error !== undef ){
								fn(error, result);
							} else {
								list.push(fn);
							}
						}
				};

				return	defer;
			},

			queue: function (fn){
				var
					  _idx = 0
					, _length = 0
					, _fail = false
					, _end = false
					, queue = {
						inc: function (){
							_length++;
						},

						next: function (){
							_idx++;
							setTimeout(queue.check, 0);
						},

						check: function (){
							(_idx >= _length) && !_fail && queue.end();
						},

						isFail: function (){
							return _fail;
						},

						fail: function (){
							!_fail && fn(_fail = true);
						},

						end: function (){
							if( !_end ){
								_end = true;
								fn();
							}
						}
					}
				;
				return queue;
			},


			/**
			 * For each object
			 *
			 * @param	{Object|Array}	obj
			 * @param	{Function}		fn
			 * @param	{*}				[ctx]
			 */
			each: _each,


			/**
			 * Async for
			 *
			 * @param	{Array}	array
			 */
			afor: function (array, callback){
				var i = 0, n = array.length;

				if( isArray(array) && n-- ){
					(function _next(){
						callback(n != i && _next, array[i], i++);
					})();
				}
				else {
					callback(false);
				}
			},



			/**
			 * Merge the contents of two or more objects together into the first object
			 *
			 * @param	{Object}	dst
			 * @param	{Object}	[src]
			 * @return	{Object}
			 */
			extend: function (dst){
				_each(arguments, function (src){
					_each(src, function (val, key){
						dst[key] = val;
					});
				});
				return  dst;
			},


			/**
			 * Is file instance
			 *
			 * @param  {File}  file
			 * @return {Boolean}
			 */
			isFile: function (file){
				return	html5 && file && (file instanceof File);
			},


			/**
			 * Is canvas element
			 *
			 * @param	{HTMLElement}	el
			 * @return	{Boolean}
			 */
			isCanvas: function (el){
				return	el && _rcanvas.test(el.nodeName);
			},


			getFilesFilter: function (filter){
				filter = typeof filter == 'string' ? filter : (filter.getAttribute && filter.getAttribute('accept') || '');
				return	filter ? new RegExp('('+ filter.replace(/\./g, '\\.').replace(/,/g, '|') +')$', 'i') : /./;
			},



			/**
			 * Read as DataURL
			 *
			 * @param {File|Element} file
			 * @param {Function} fn
			 */
			readAsDataURL: function (file, fn){
				if( api.isCanvas(file) ){
					_emit(file, fn, 'load', api.toDataURL(file));
				}
				else {
					_readAs(file, fn, 'DataURL');
				}
			},


			/**
			 * Read as Binary string
			 *
			 * @param {File} file
			 * @param {Function} fn
			 */
			readAsBinaryString: function (file, fn){
				if( _hasSupportReadAs('BinaryString') ){
					_readAs(file, fn, 'BinaryString');
				} else {
					// Hello IE10!
					_readAs(file, function (evt){
						if( evt.type == 'load' ){
							try {
								// dataURL -> binaryString
								evt.result = api.toBinaryString(evt.result);
							} catch (e){
								evt.type = 'error';
								evt.message = e.toString();
							}
						}
						fn(evt);
					}, 'DataURL');
				}
			},


			/**
			 * Read as ArrayBuffer
			 *
			 * @param {File} file
			 * @param {Function} fn
			 */
			readAsArrayBuffer: function(file, fn){
				_readAs(file, fn, 'ArrayBuffer');
			},


			/**
			 * Read as text
			 *
			 * @param {File} file
			 * @param {String} encoding
			 * @param {Function} fn
			 */
			readAsText: function(file, encoding, fn){
				if( !fn ){
					fn	= encoding;
					encoding = 'utf-8';
				}

				_readAs(file, fn, 'Text', encoding);
			},


			/**
			 * Convert image or canvas to DataURL
			 *
			 * @param   {Element}   el    Image or Canvas element
			 * @return  {String}
			 */
			toDataURL: function (el){
				if( typeof el == 'string' ){
					return  el;
				}
				else if( el.toDataURL ){
					return  el.toDataURL('image/png');
				}
			},


			/**
			 * Canvert string, image or canvas to binary string
			 *
			 * @param   {String|Element} val
			 * @return  {String}
			 */
			toBinaryString: function (val){
				return  window.atob(api.toDataURL(val).replace(_rdata, ''));
			},


			/**
			 * Read file or DataURL as ImageElement
			 *
			 * @param	{File|String}	file
			 * @param	{Function}		fn
			 * @param	{Boolean}		[progress]
			 */
			readAsImage: function (file, fn, progress){
				if( api.isFile(file) ){
					if( apiURL ){
						/** @namespace apiURL.createObjectURL */
						var data = apiURL.createObjectURL(file);
						if( data === undef ){
							_emit(file, fn, 'error');
						}
						else {
							api.readAsImage(data, fn, progress);
						}
					}
					else {
						api.readAsDataURL(file, function (evt){
							if( evt.type == 'load' ){
								api.readAsImage(evt.result, fn, progress);
							}
							else if( progress || evt.type == 'error' ){
								_emit(file, fn, evt, null, { loaded: evt.loaded, total: evt.total });
							}
						});
					}
				}
				else if( api.isCanvas(file) ){
					_emit(file, fn, 'load', file);
				}
				else if( _rimg.test(file.nodeName) ){
					if( file.complete ){
						_emit(file, fn, 'load', file);
					}
					else {
						var events = 'error abort load';
						_one(file, events, function _fn(evt){
							if( evt.type == 'load' && apiURL ){
								/** @namespace apiURL.revokeObjectURL */
								apiURL.revokeObjectURL(file.src);
							}

							_off(file, events, _fn);
							_emit(file, fn, evt, file);
						});
					}
				}
				else if( file.iframe ){
					_emit(file, fn, { type: 'error' });
				}
				else {
					// Created image
					var img = api.newImage(file.dataURL || file);
					api.readAsImage(img, fn, progress);
				}
			},


			/**
			 * Make file by name
			 *
			 * @param	{String}	name
			 * @return	{Array}
			 */
			checkFileObj: function (name){
				var file = {}, accept = api.accept;

				if( typeof name == 'object' ){
					file = name;
				}
				else {
					file.name = (name + '').split(/\\|\//g).pop();
				}

				if( file.type == null ){
					file.type = file.name.split('.').pop();
				}

				_each(accept, function (ext, type){
					ext = new RegExp(ext.replace(/\s/g, '|'), 'i');
					if( ext.test(file.type) ){
						file.type = api.ext2mime[file.type] || type.split('/')[0] +'/'+ file.type;
					}
				});

				return	file;
			},


			/**
			 * Get drop files
			 *
			 * @param	{Event}	evt
			 * @param	{Function} callback
			 */
			getDropFiles: function (evt, callback){
				var
					  files = []
					, dataTransfer = _getDataTransfer(evt)
					, entrySupport = isArray(dataTransfer.items) && dataTransfer.items[0] && _getAsEntry(dataTransfer.items[0])
					, queue = api.queue(function (){ callback(files); })
				;

				_each((entrySupport ? dataTransfer.items : dataTransfer.files) || [], function (item){
					queue.inc();
					try {
						if( entrySupport ){
							_readEntryAsFiles(item, function (err, entryFiles){
								!err && files.push.apply(files, entryFiles);
								queue.next();
							});
						}
						else {
							_isRegularFile(item, function (yes){
								yes && files.push(item);
								queue.next();
							});
						}
					}
					catch( err ){
						queue.next();
						api.log('getDropFiles.error:', err.toString());
					}
				});

				queue.check();
			},


			/**
			 * Get file list
			 *
			 * @param	{HTMLInput|Event}	input
			 * @param	{String|Function}	[filter]
			 * @param	{Function}			[callback]
			 * @return	{Array|Null}
			 */
			getFiles: function (input, filter, callback){
				var files = [];

				if( callback ){
					api.filterFiles(api.getFiles(input), filter, callback);
					return null;
				}

				if( input.jquery ){
					// jQuery object
					input.each(function (){
						files = files.concat(api.getFiles(this));
					});
					input	= files;
					files	= [];
				}

				if( typeof filter == 'string' ){
					filter	= api.getFilesFilter(filter);
				}

				if( input.originalEvent ){
					// jQuery event
					input = _fixEvent(input.originalEvent);
				}
				else if( input.srcElement ){
					// IE Event
					input = _fixEvent(input);
				}


				if( input.dataTransfer ){
					// Drag'n'Drop
					input = input.dataTransfer;
				}
				else if( input.target ){
					// Event
					input = input.target;
				}

				if( input.files ){
					// Input[type="file"]
					files = input.files;

					if( !html5 ){
						// Partial support for file api
						files[0].blob	= input;
						files[0].iframe	= true;
					}
				}
				else if( !html5 && isInputFile(input) ){
					if( api.trim(input.value) ){
						files = [api.checkFileObj(input.value)];
						files[0].blob   = input;
						files[0].iframe = true;
					}
				}
				else if( isArray(input) ){
					files	= input;
				}

				return	api.filter(files, function (file){ return !filter || filter.test(file.name); });
			},


			/**
			 * Get image information
			 *
			 * @param	{File}		file
			 * @param	{Function}	fn
			 */
			getInfo: function (file, fn){
				var info = {}, readers = _infoReader.concat();

				if( api.isFile(file) ){
					(function _next(){
						var reader = readers.shift();
						if( reader ){
							if( reader.test(file.type) ){
								reader(file, function (err, res){
									if( err ){
										fn(err);
									}
									else {
										api.extend(info, res);
										_next();
									}
								});
							}
							else {
								_next();
							}
						}
						else {
							fn(false, info);
						}
					})();
				}
				else {
					fn('not_support', info);
				}
			},


			/**
			 * Add information reader
			 *
			 * @param {RegExp} mime
			 * @param {Function} fn
			 */
			addInfoReader: function (mime, fn){
				fn.test = function (type){ return mime.test(type) };
				_infoReader.push(fn);
			},


			/**
			 * Filter of array
			 *
			 * @param	{Array}		input
			 * @param	{Function}	fn
			 * @return	{Array}
			 */
			filter: function (input, fn){
				var result = [], i = 0, n = input.length, val;
				for( ; i < n; i++ ) if( i in input ){
					val = input[i];
					if( fn.call(val, val, i, input) ){
						result.push(val);
					}
				}
				return	result;
			},


			/**
			 * Filter files
			 *
			 * @param	{Array}		files
			 * @param	{Function}	eachFn
			 * @param	{Function}	resultFn
			 */
			filterFiles: function (files, eachFn, resultFn){
				if( files.length ){
					// HTML5 or Flash
					var queue = files.concat(), file, result = [], deleted = [];

					(function _next(){
						if( queue.length ){
							file = queue.shift();
							api.getInfo(file, function (err, info){
								(eachFn(file, err ? false : info) ? result : deleted).push(file);
								_next();
							});
						}
						else {
							resultFn(result, deleted);
						}
					})();
				}
				else {
					resultFn([], files);
				}
			},


			upload: function (options){
				options = api.extend({
					  prepare: api.F
					, beforeupload: api.F
					, upload: api.F
					, fileupload: api.F
					, fileprogress: api.F
					, filecomplete: api.F
					, progress: api.F
					, complete: api.F
					, pause: api.F
					, chunkSize: api.chunkSize
					, chunkUpoloadRetry: api.chunkUploadRetry
				}, options);

				if( options.imageAutoOrientation && !options.imageTransform ){
					options.imageTransform	= { rotate: 'auto' };
				}


				var
					  proxyXHR = new api.XHR(options)
					, dataArray = this._getFilesDataArray(options.files)
					, _total = 0
					, _loaded = 0
					, _this = this
					, _nextFile
					, _complete = false
				;


				// calc total size
				_each(dataArray, function (data){
					_total += data.size;
				});

				// Array of files
				proxyXHR.files = [];
				_each(dataArray, function (data){
					proxyXHR.files.push(data.file);
				});

				// Set upload status props
				proxyXHR.total	= _total;
				proxyXHR.loaded	= 0;
				proxyXHR.filesLeft = dataArray.length;

				// emit "beforeupload"  event
				options.beforeupload(proxyXHR, options);
				// Upload by file
				( _nextFile = function _nextFile(){
					var
						  data = dataArray.shift()
						, _file = data && data.file
						, _fileLoaded = false
						, _fileOptions = _simpleClone(options)
					;

					proxyXHR.filesLeft = dataArray.length;

					if( _file && _file.name === api.expando ){
						_file = null;
						api.log('[warn] FileAPI.upload() — called without files')
					}

					if( ( proxyXHR.statusText != 'abort' || proxyXHR.current ) && data ){
					    // Mark active job
					    _complete = false;

						// Set current upload file
						proxyXHR.currentFile = _file;

						// Prepare file options
						_file && options.prepare(_file, _fileOptions);

						this._getFormData(_fileOptions, data, function (form){
							if( !_loaded ){
								// emit "upload" event
								options.upload(proxyXHR, options);
							}

							var xhr = new api.XHR(api.extend({}, _fileOptions, {

								upload: _file ? function (){
									// emit "fileupload" event
									options.fileupload(_file, xhr, _fileOptions);
								} : noop,

								progress: _file ? function (evt){
									if( !_fileLoaded ){
										// emit "fileprogress" event
										options.fileprogress({
											  type:   'progress'
											, total:  data.total = evt.total
											, loaded: data.loaded = evt.loaded
										}, _file, xhr, _fileOptions);

										// emit "progress" event
										options.progress({
											  type:   'progress'
											, total:  _total
											, loaded: proxyXHR.loaded = (_loaded + data.size * (evt.loaded/evt.total))|0
										}, _file, xhr, _fileOptions);
									}
								} : noop,

								complete: function (err){
									// fixed throttle event
									_fileLoaded = true;

									_each(_xhrPropsExport, function (name){
										proxyXHR[name] = xhr[name];
									});

									if( _file ){
										data.loaded	= data.total;

										// emulate 100% "progress"
										this.progress(data);

										// bytes loaded
										_loaded += data.size; // data.size != data.total, it's desirable fix this
										proxyXHR.loaded = _loaded;

										// emit "filecomplete" event
										options.filecomplete(err, xhr, _file, _fileOptions);
									}

									// upload next file
									_nextFile.call(_this);
								}
							})); // xhr


							// ...
							proxyXHR.abort = function (current){
								if (!current) { dataArray.length = 0; }
								this.current = current;
								xhr.abort();
							};

							// Start upload
							xhr.send(form);
						});
					}
					else {
						options.complete(proxyXHR.status == 200 || proxyXHR.status == 201 ? false : (proxyXHR.statusText || 'error'), proxyXHR, options);
						// Mark done state
						_complete = true;
					}
				}).call(this);

				// Append more files to the existing request
				// first - add them to the queue head/tail
				proxyXHR.append = function (files, first) {
					files = api._getFilesDataArray([].concat(files));

					_each(files, function (data) {
						_total += data.size;
						proxyXHR.files.push(data.file);
						if (first) {
							dataArray.unshift(data);
						} else {
							dataArray.push(data);
						}
					});

					proxyXHR.statusText = "";

					if (_complete) {
						_nextFile.call(_this);
					}
				}

				// Removes file from queue by file reference and returns it
				proxyXHR.remove = function (file) {
				    var idx = -1;
					_each(dataArray, function (data) {
						idx++;
						if (data.file == file) {
							return dataArray.splice(idx, 1);
						}
					});
				}

				return proxyXHR;
			},


			_getFilesDataArray: function (data){
				var files = [], oFiles = {};

				if( isInputFile(data) ){
					var tmp = api.getFiles(data);
					oFiles[data.name || 'file'] = data.getAttribute('multiple') !== null ? tmp : tmp[0];
				}
				else if( isArray(data) && isInputFile(data[0]) ){
					_each(data, function (input){
						oFiles[input.name || 'file'] = api.getFiles(input);
					});
				}
				else {
					oFiles = data;
				}

				_each(oFiles, function add(file, name){
					if( isArray(file) ){
						_each(file, function (file, idx){
							add(file, name);
						});
					}
					else if( file && file.name ){
						files.push({
							  name: name
							, file: file
							, size: file.size
							, total: file.size
							, loaded: 0
						});
					}
				});

				if( !files.length ){
					// Create fake `file` object
					files.push({ file: { name: api.expando } });
				}

				return	files;
			},


			_getFormData: function (options, data, fn){
				var
					  file = data.file
					, name = data.name
					, filename = file.name
					, filetype = file.type
					, trans = api.support.transform && options.imageTransform
					, Form = new api.Form
					, queue = api.queue(function (){ fn(Form); })
					, isOrignTrans = trans && (parseInt(trans.maxWidth || trans.minWidth || trans.width, 10) > 0 || trans.rotate)
				;
				

				// Append data
				_each(options.data, function add(val, name){
					if( typeof val == 'object' ){
						_each(val, function (v, i){
							add(v, api.postNameConcat(name, i));
						});
					}
					else {
						Form.append(name, val);
					}
				});


				if( api.Image && trans && (/image/.test(file.type) || _rimgcanvas.test(file.nodeType)) ){
					queue.inc();

					if( isOrignTrans ){
						// Convert to array for transform function
						trans = [trans];
					}

					api.Image.transform(file, trans, options.imageAutoOrientation, function (err, images){
						if( isOrignTrans && !err ){
							if( !dataURLtoBlob && !api.flashEngine ){
								images[0] = api.toBinaryString(images[0]);
								Form.multipart = true;
							}

							Form.append(name, images[0], filename, filetype);
						}
						else {
							if( !err ){
								_each(images, function (image, idx){
									if( !dataURLtoBlob && !api.flashEngine ){
										image = api.toBinaryString(image);
										Form.multipart = true;
									}

									Form.append(name +'['+ idx +']', image, filename, filetype);
								});

								name += '[original]';
							}

							if( err || options.imageOriginal ){
								Form.append(name, file, filename, filetype);
							}
						}

						queue.next();
					});
				}
				else if( filename !== api.expando ){
					Form.append(name, file, filename);
				}

				queue.check();
			},


			reset: function (inp, notRemove){
				var parent, clone;

				if( jQuery ){
					clone = jQuery(inp).clone(true).insertBefore(inp).val('')[0];
					if( !notRemove ){
						jQuery(inp).remove();
					}
				} else {
					parent  = inp.parentNode;
					clone   = parent.insertBefore(inp.cloneNode(true), inp);
					clone.value = '';

					if( !notRemove ){
						parent.removeChild(inp);
					}

					_each(_elEvents[api.uid(inp)], function (fns, type){
						_each(fns, function (fn){
							_off(inp, type, fn);
							_on(clone, type, fn);
						})
					});
				}

				return  clone;
			},


			/**
			 * Load remote file
			 *
			 * @param   {String}    url
			 * @param   {Function}  fn
			 * @return  {XMLHttpRequest}
			 */
			load: function (url, fn){
				var xhr = api.getXHR();
				if( xhr ){
					xhr.open('GET', url, true);

					if( xhr.overrideMimeType ){
				        xhr.overrideMimeType('text/plain; charset=x-user-defined');
					}

					_on(xhr, 'progress', function (/**Event*/evt){
						/** @namespace evt.lengthComputable */
						if( evt.lengthComputable ){
							fn({ type: evt.type, loaded: evt.loaded, total: evt.total }, xhr);
						}
					});

					xhr.onreadystatechange = function(){
						if( xhr.readyState == 4 ){
							xhr.onreadystatechange = null;
							if( xhr.status == 200 ){
								url = url.split('/');
								/** @namespace xhr.responseBody */
								var file = {
								      name: url[url.length-1]
									, size: xhr.getResponseHeader('Content-Length')
									, type: xhr.getResponseHeader('Content-Type')
								};
								file.dataURL = 'data:'+file.type+';base64,' + api.encode64(xhr.responseBody || xhr.responseText);
								fn({ type: 'load', result: file });
							}
							else {
								fn({ type: 'error' });
							}
					    }
					};
				    xhr.send(null);
				} else {
					fn({ type: 'error' });
				}

				return  xhr;
			},

			encode64: function (str){
				var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', outStr = '', i = 0;

				if( typeof str !== 'string' ){
					str	= String(str);
				}

				while( i < str.length ){
					//all three "& 0xff" added below are there to fix a known bug
					//with bytes returned by xhr.responseText
					var
						  byte1 = str.charCodeAt(i++) & 0xff
						, byte2 = str.charCodeAt(i++) & 0xff
						, byte3 = str.charCodeAt(i++) & 0xff
						, enc1 = byte1 >> 2
						, enc2 = ((byte1 & 3) << 4) | (byte2 >> 4)
						, enc3, enc4
					;

					if( isNaN(byte2) ){
						enc3 = enc4 = 64;
					} else {
						enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
						enc4 = isNaN(byte3) ? 64 : byte3 & 63;
					}

					outStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
				}

				return  outStr;
			}

		} // api
	;
	

	function _each(obj, fn, ctx){
		if( obj ){
			if( isArray(obj) ){
				for( var i = 0, n = obj.length; i < n; i++ ){ if( i in obj )
					fn.call(ctx, obj[i], i, obj);
				}
			}
			else {
				for( var key in obj ) if( obj.hasOwnProperty(key) ){
					fn.call(ctx, obj[key], key, obj);
				}
			}
		}
	}


	// @private methods
	function _on(el, type, fn){
		if( el ){
			var uid = api.uid(el);

			if( !_elEvents[uid] ){
				_elEvents[uid] = {};
			}

			_each(type.split(/\s+/), function (type){
				if( jQuery ){
					jQuery.event.add(el, type, fn);
				}
				else {
					if( !_elEvents[uid][type] ){
						_elEvents[uid][type] = []
					}
					_elEvents[uid][type].push(fn);


					if( el.addEventListener ) el.addEventListener(type, fn, false);
					else if( el.attachEvent ) el.attachEvent('on'+type, fn);
					else el['on'+type] = fn;
				}
			});
		}
	}


	function _off(el, type, fn){
		if( el ){
			var uid = api.uid(el), events = _elEvents[uid] || {};

			_each(type.split(/\s+/), function (type){
				if( jQuery ){
					jQuery.event.remove(el, type, fn);
				}
				else {
					var fns = events[type] || [], i = fns.length;

					while( i-- ){
						if( fns[i] === fn ){
							fns.splice(i, 1);
							break;
						}
					}

					if( el.addEventListener ) el.removeEventListener(type, fn, false);
					else if( el.detachEvent ) el.detachEvent('on'+type, fn);
					else el['on'+type] = null;
				}
			});
		}
	}


	function _one(el, type, fn){
		_on(el, type, function _(evt){
			_off(el, type, _);
			fn(evt);
		});
	}


	function _emit(target, fn, name, res, ext){
		var evt = {
			  type:		name.type || name
			, target:	target
			, result:	res
		};
		api.extend(evt, ext);
		fn(evt);
	}


	function _hasSupportReadAs(as){
		return	FileReader && !!FileReader.prototype['readAs'+as];
	}


	function _readAs(file, fn, as, encoding){
		if( api.isFile(file) && _hasSupportReadAs(as) ){
			var Reader = new FileReader;

			// Add event listener
			_on(Reader, _readerEvents, function _fn(evt){
				var type = evt.type;
				if( type == 'progress' ){
					_emit(file, fn, evt, evt.target.result, { loaded: evt.loaded, total: evt.total })
				}
				else if( type == 'loadend' ){
					_off(Reader, _readerEvents, _fn);
					Reader = null;
				}
				else {
					_emit(file, fn, evt, evt.target.result);
				}
			});


			try {
				// ReadAs ...
				if( encoding ){
					Reader['readAs'+as](encoding, file);
				}
				else {
					Reader['readAs'+as](file);
				}
			}
			catch (err){
				_emit(file, fn, 'error', undef, { error: err.toString() });
			}
		}
		else {
			_emit(file, fn, 'error', undef, { error: 'filreader_not_support_'+as });
		}
	}


	function _isRegularFile(file, callback){
		// http://stackoverflow.com/questions/8856628/detecting-folders-directories-in-javascript-filelist-objects
		if( !file.type && (file.size % 4096) == 0 && (file.size <= 102400) ){
			if( FileReader ){
				try {
					var Reader = new FileReader();

					_one(Reader, _readerEvents, function (evt){
						var isFile = evt.type != 'error';
						callback(isFile);
						if( isFile ){
							Reader.abort();
						}
					});

					Reader.readAsDataURL(file);
				} catch( err ){
					callback(false);
				}
			}
			else {
				callback(null)
			}
		}
		else {
			callback(true);
		}
	}


	function _getAsEntry(item){
		var entry;
		if( item.getAsEntry ) entry = item.getAsEntry();
		else if( item.webkitGetAsEntry ) entry = item.webkitGetAsEntry();
		return	entry;
	}


	function _readEntryAsFiles(entry, callback){
		if( !entry ){
			// error
			callback('empty_entry');
		}
		else if( entry.isFile ){
			// Read as file
			entry.file(function(file){
				// success
				file.fullPath = entry.fullPath;
				callback(false, [file]);
			}, function (){
				// error
				callback('entry_file');
			});
		}
		else if( entry.isDirectory ){
			var reader = entry.createReader(), result = [];

			reader.readEntries(function(entries){
				// success
				api.afor(entries, function (next, entry){
					_readEntryAsFiles(entry, function (err, files){
						if( !err ){
							result = result.concat(files);
						}

						if( next ){
							next();
						}
						else {
							callback(false, result);
						}
					});
				});
			}, function (){
				// error
				callback('directory_reader');
			});
		}
		else {
			_readEntryAsFiles(_getAsEntry(entry), callback);
		}
	}


	function isArray(ar) {
		return	(typeof ar == 'object') && ar && ('length' in ar);
	}


	function _simpleClone(obj){
		var copy = {};
		_each(obj, function (val, key){
			if( val && (typeof val === 'object') ){
				val = api.extend({}, val);
			}
			copy[key] = val;
		});
		return	copy;
	}


	function isInputFile(el){
		return	_rinput.test(el && el.tagName);
	}


	function _getDataTransfer(evt){
		return	(evt.originalEvent || evt || '').dataTransfer || {};
	}


	function _fixEvent(evt){
		if( !evt.target ) evt.target = window.event && window.event.srcElement || document;
		if( evt.target.nodeType === 3 ) evt.target = event.target.parentNode;
		return  evt;
	}


	// Add default image info reader
	api.addInfoReader(/^image/, function (file/**File*/, callback/**Function*/){
		if( !file.__dimensions ){
			var defer = file.__dimensions = api.defer();

			api.readAsImage(file, function (evt){
				var img = evt.target;
				defer.resolve(evt.type == 'load' ? false : 'error', {
					  width:  img.width
					, height: img.height
				});
				img = null;
			});
		}

		file.__dimensions.then(callback);
	});


	// Special event
	api.event.dnd = function (el, onHover, onDrop){
		var _id, _type;

		if( !onDrop ){
			onDrop = onHover;
			onHover = api.F;
		}

		if( FileReader ){
			_on(el, 'dragenter dragleave dragover', function (evt){
				var types = _getDataTransfer(evt).types, i = types && types.length;

				while( i-- ){
					if( ~types[i].indexOf('File') ){
						evt[preventDefault]();

						if( _type !== evt.type ){
							_type = evt.type;

							if( _type != 'dragleave' ){
								onHover.call(evt[currentTarget], true, evt);
							}

							clearTimeout(_id);
							_id = setTimeout(function (){
								onHover.call(evt[currentTarget], _type != 'dragleave', evt);
							}, 50);
						}
					}
				}
			});

			_on(el, 'drop', function (evt){
				evt[preventDefault]();

				_type = 0;
				onHover.call(evt[currentTarget], false, evt);

				api.getDropFiles(evt, function (files){
					onDrop.call(evt[currentTarget], files, evt);
				});
			});
		}
		else {
			api.log("Drag'n'Drop -- not supported");
		}
	};


	// Support jQuery
	if( jQuery && !jQuery.fn.dnd ){
		jQuery.fn.dnd = function (onHover, onDrop){
			return this.each(function (){
				api.event.dnd(this, onHover, onDrop);
			});
		};
	}


	// @export
	window.FileAPI  = api.extend(api, window.FileAPI);


	api.log('version: '+api.version);
	api.log('protocol: '+window.location.protocol);


	if( document.doctype ){
		api.log('doctype: ['+ document.doctype.name +'] '+ document.doctype.publicId +' '+ document.doctype.systemId);
	}
	else {
		api.log('doctype: unknown');
	}


	// @detect 'x-ua-compatible'
	_each(document.getElementsByTagName('meta'), function (meta){
		if( /x-ua-compatible/i.test(meta.getAttribute('http-equiv')) ){
			api.log('meta.http-equiv: '+meta.getAttribute('content'));
		}
	});


	// @configuration
	if( !api.flashUrl ) api.flashUrl = api.staticPath + 'FileAPI.flash.swf';
	if( !api.flashImageUrl ) api.flashImageUrl = api.staticPath + 'FileAPI.flash.image.swf';
})(window);

/**
 * FileAPI fallback to Flash
 *
 * @flash-developer  "Vladimir Demidov" <v.demidov@corp.mail.ru>
 */
(function (api, window, document){
	api.support.flash = (function (){
		var nav	= window.navigator, mime = nav.mimeTypes, has = false;

		if( nav.plugins && typeof nav.plugins['Shockwave Flash'] == 'object' ){
			has	= nav.plugins['Shockwave Flash'].description && !(mime && mime['application/x-shockwave-flash'] && !mime['application/x-shockwave-flash'].enabledPlugin);
		}
		else {
			try {
				has	= !!(window.ActiveXObject && new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));
			}
			catch(er){}
		}

		if( !has ){
			api.log('Flash -- does not supported.');
		}

		return	has;
	})();


	if( /^file:/i.test(window.location) ){
		api.log('[warn] Flash does not work on `file:` protocol.');
		return;
	}


	if( 1 && api.support.flash && (0 || !api.html5 || !api.support.html5 || api.cors && !api.support.cors) ) (function (){
		var
			  _attr  = api.uid()
			, _retry = 0
			, _files = {}
			, _rhttp = /^https?:/i

			, flash = {
				_fn: {},


				/**
				 * Initialization & preload flash object
				 */
				init: function (){
					var child = document.body && document.body.firstChild;

					if( child ){
						do {
							if( child.nodeType == 1 ){
								api.log('FlashAPI.Flash.init...');

								var dummy = document.createElement('div');

								_css(dummy, {
									  top: 1
									, right: 1
									, width: 5
									, height: 5
									, position: 'absolute'
								});

								child.parentNode.insertBefore(dummy, child);
								flash.publish(dummy, _attr);

								return;
							}
						}
						while( child = child.nextSibling )
					}

					if( _retry < 10 ){
						setTimeout(flash.init, ++_retry*50);
					}
				},


				/**
				 * Publish flash-object
				 *
				 * @param {HTMLElement} el
				 * @param {String} id
				 */
				publish: function (el, id){
					el.innerHTML = _makeFlashHTML({
						  id: id
						, src: _getUrl(api.flashUrl, 'r=' + api.version)
//						, src: _getUrl('http://v.demidov.boom.corp.mail.ru/uploaderfileapi/FlashFileAPI.swf?1')
						, wmode: 'transparent'
						, flashvars: 'callback=FileAPI.Flash.event'
							+ '&flashId='+ id
							+ '&storeKey='+ navigator.userAgent.match(/\d/ig).join('') +'_'+ api.version
							+ (flash.isReady || (api.pingUrl ? '&ping='+api.pingUrl : ''))
							+ '&timeout='+api.flashAbortTimeout
					});
				},


				ready: function (){
					flash.ready = api.F;
					flash.isReady = true;
					flash.patch();

					api.event.on(document, 'mouseover', flash.mouseover);
					api.event.on(document, 'click', function (evt){
						if( flash.mouseover(evt) ){
							evt.preventDefault
								? evt.preventDefault()
								: (evt.returnValue = true)
							;
						}
					});
				},

				getWrapper: function (node){
					do {
						if( /js-fileapi-wrapper/.test(node.className) ){
							return	node;
						}
					}
					while( (node = node.parentNode) && (node !== document.body) );
				},

				mouseover: function (evt){
					var target = api.event.fix(evt).target;

					if( /input/i.test(target.nodeName) && target.type == 'file' ){
						var state = target.getAttribute(_attr);

						// check state
						if( state == 'i' || state == 'r' ){
							// publish fail
							return	false;
						}
						else if( state != 'p' ){
							// set "init" state
							target.setAttribute(_attr, 'i');

							var
								  dummy = document.createElement('div')
								, wrapper = flash.getWrapper(target)
							;

							if( !wrapper ){
								api.log('flash.mouseover.error: js-fileapi-wrapper not found');
								return
							}

							_css(dummy, {
								  top:    0
								, left:   0
								, width:  target.offsetWidth + 100
								, height: target.offsetHeight + 100
								, zIndex: 1e6+'' // set max zIndex
								, position: 'absolute'
							});


							wrapper.appendChild(dummy);
							flash.publish(dummy, api.uid());

							// set "publish" state
							target.setAttribute(_attr, 'p');
						}

						return	true;
					}
				},

				event: function (evt){
					var type = evt.type;

					if( type == 'ready' ){
						try {
							// set "ready" state
							flash.getInput(evt.flashId).setAttribute(_attr, 'r');
						} catch (e){
						}

						flash.ready();
						setTimeout(function (){ flash.mouseenter(evt); }, 50);
						return	true;
					}
					else if( type === 'ping' ){
						api.log('(flash -> js).ping:', [evt.status, evt.savedStatus], evt.error);
					}
					else if( type === 'log' ){
						api.log('(flash -> js).log:', evt.target);
					}
					else if( type in flash ) setTimeout(function (){
						api.log('Flash.event.'+evt.type+':', evt);
						flash[type](evt);
					}, 1);
				},

				mouseenter: function (evt){
					var node = flash.getInput(evt.flashId);
					if( node ){
						// Set multiple mode
						flash.cmd(evt, 'multiple', node.getAttribute('multiple') != null);


						// Set files filter
						var accept = [], exts = {};

						api.each((node.getAttribute('accept') || '').split(/,\s*/), function (mime){
							api.accept[mime] && api.each(api.accept[mime].split(' '), function (ext){
								exts[ext] = 1;
							});
						});

						api.each(exts, function (i, ext){
							accept.push( ext );
						});

						flash.cmd(evt, 'accept', accept.length ? accept.join(',')+','+accept.join(',').toUpperCase() : '*');
					}
				},

				get: function (id){
					return	document[id] || window[id] || document.embeds[id];
				},

				getInput: function (id){
					try {
						var node = flash.getWrapper(flash.get(id));
						if( node ) return node.getElementsByTagName('input')[0];
					} catch (e){
						api.log('Can not find "input" by flashId:', id, e);
					}
				},

				select: function (evt){
					var
						  inp = flash.getInput(evt.flashId)
						, uid = api.uid(inp)
						, files = evt.target.files
						, event
					;

					api.each(files, function (file){
						api.checkFileObj(file);
					});

					_files[uid] = files;

					if( document.createEvent ){
						event = document.createEvent('Event');
						event.initEvent ('change', true, false);
						inp.dispatchEvent(event)
					}
					else if( document.createEventObject ){
						event = document.createEventObject();
						inp.fireEvent('onchange', event)
					}
				},


				cmd: function (id, name, data, last){
					try {
						api.log('(js -> flash).'+name+':', data);
						return flash.get(id.flashId || id).cmd(name, data);
					} catch (e){
						api.log('(js -> flash).onError:', e);
						if( !last ){
							// try again
							setTimeout(function (){ flash.cmd(id, name, data, true); }, 50);
						}
					}
				},


				patch: function (){
					api.flashEngine =
					api.support.transform = true;

					// FileAPI
					_inherit(api, {
						getFiles: function (input, filter, callback){
							if( callback ){
								api.filterFiles(api.getFiles(input), filter, callback);
								return null;
							}

							var files = api.isArray(input) ? input : _files[api.uid(input.target || input.srcElement || input)];


							if( !files ){
								// Файлов нету, вызываем родительский метод
								return	this.parent.apply(this, arguments);
							}


							if( filter ){
								filter	= api.getFilesFilter(filter);
								files	= api.filter(files, function (file){ return filter.test(file.name); });
							}

							return	files;
						},


						getInfo: function (file, fn){
							if( _isHtmlFile(file) ){
								this.parent.apply(this, arguments);
							}
							else {
								if( !file.__info ){
									var defer = file.__info = api.defer();

									flash.cmd(file, 'getFileInfo', {
										  id: file.id
										, callback: _wrap(function _(err, info){
											_unwrap(_);
											defer.resolve(err, file.info = info)
										})
									});
								}
								file.__info.then(fn);
							}
						}
					});


					// FileAPI.Image
					api.support.transform = true;
					api.Image && _inherit(api.Image.prototype, {
						get: function (fn, scaleMode){
							this.set({ scaleMode: scaleMode || 'noScale' }); // noScale, exactFit
							this.parent(fn);
						},

						_load: function (file, fn){
							api.log('FileAPI.Image._load:', file);

							if( _isHtmlFile(file) ){
								this.parent.apply(this, arguments);
							}
							else {
								var _this = this;
								api.getInfo(file, function (err, info){
									fn.call(_this, err, file);
								});
							}
						},

						_apply: function (file, fn){
							api.log('FileAPI.Image._apply:', file);

							if( _isHtmlFile(file) ){
								this.parent.apply(this, arguments);
							}
							else {
								var m = this.getMatrix(file.info);

								flash.cmd(file, 'imageTransform', {
									  id: file.id
									, matrix: m
									, callback: _wrap(function _(err, base64){
										api.log('FileAPI.Image._apply.callback:', err);
										_unwrap(_);

										if( err ){
											fn(err);
										}
										else if( !api.support.dataURI || base64.length > 3e4 ){
											_makeFlashImage({
												  width:	!(m.deg % 180) ? m.dw : m.dh
												, height:	(m.deg % 180) ? m.dw : m.dh
												, scale:	m.scaleMode
											}, base64, fn);
										}
										else {
											api.newImage('data:'+ file.type +';base64,'+ base64, fn);
										}
									})
								});
							}
						},

						toData: function (fn){
							var file = this.file, info = file.info, matrix = this.getMatrix(info);

							if( _isHtmlFile(file) ){
								this.parent.apply(this, arguments);
							}
							else {
								if( matrix.deg == 'auto' ){
									matrix.deg = api.Image.exifOrientation[info && info.exif && info.exif.Orientation] || 0;
								}

								fn.call(this, !file.info, {
									  id:		file.id
									, flashId:	file.flashId
									, name:		file.name
									, type:		file.type
									, matrix:	matrix
								});
							}
						}
					});


					// FileAPI.Form
					_inherit(api.Form.prototype, {
						toData: function (fn){
							var items = this.items, i = items.length;

							for( ; i--; ){
								if( items[i].file && _isHtmlFile(items[i].blob) ){
									return this.parent.apply(this, arguments);
								}
							}

							api.log('flash.Form.toData');
							fn(items);
						}
					});


					// FileAPI.XHR
					_inherit(api.XHR.prototype, {
						_send: function (options, formData){
							if(
								   formData.nodeName
								|| formData.append && api.support.html5
								|| api.isArray(formData) && (typeof formData[0] === 'string')
							){
								// HTML5, Multipart or IFrame
								return	this.parent.apply(this, arguments);
							}


							var
								  data = {}
								, files = {}
								, _this = this
								, flashId
								, fileId
							;

							api.each(formData, function (item){
								if( item.file ){
									files[item.name] = item = _getFileDescr(item.blob);
									fileId  = item.id;
									flashId = item.flashId;
								}
								else {
									data[item.name] = item.blob;
								}
							});

							if( !(fileId || flashId) ){
								return this.parent.apply(this, arguments);
							} else {
								api.log('flash.XHR._send:', flashId, fileId, files);
							}

							_this.xhr = {
								headers: {},
								abort: function (){ flash.cmd(flashId, 'abort', { id: fileId }); },
								getResponseHeader: function (name){ return this.headers[name]; },
								getAllResponseHeaders: function (){ return this.headers; }
							};

							var queue = api.queue(function (){
								flash.cmd(flashId, 'upload', {
									  url: _getUrl(options.url)
									, data: data
									, files: files
									, headers: options.headers
									, callback: _wrap(function upload(evt){
										var type = evt.type, result = evt.result;

										api.log('flash.upload.'+type+':', evt);

										if( type == 'progress' ){
											evt.loaded = Math.min(evt.loaded, evt.total); // @todo fixme
											evt.lengthComputable = true;
											options.progress(evt);
										}
										else if( type == 'complete' ){
											_unwrap(upload);

											if( typeof result == 'string' ){
												_this.responseText	= result.replace(/%22/g, "\"").replace(/%5c/g, "\\").replace(/%26/g, "&").replace(/%25/g, "%");
											}

											_this.end(evt.status || 200);
										}
										else if( type == 'abort' || type == 'error' ){
											_this.end(evt.status || 0, evt.message);
											_unwrap(upload);
										}
									})
								});
							});


							// #2174: FileReference.load() call while FileReference.upload() or vice versa
							api.each(files, function (file){
								queue.inc();
								api.getInfo(file, queue.next);
							});

							queue.check();
						}
					});
				}
			}
		;


		function _makeFlashHTML(opts){
			return ('<object id="#id#" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+(opts.width || '100%')+'" height="'+(opts.height || '100%')+'">'
				+ '<param name="movie" value="#src#" />'
				+ '<param name="flashvars" value="#flashvars#" />'
				+ '<param name="swliveconnect" value="true" />'
				+ '<param name="allowscriptaccess" value="always" />'
				+ '<param name="allownetworking" value="all" />'
				+ '<param name="menu" value="false" />'
				+ '<param name="wmode" value="#wmode#" />'
				+ '<embed flashvars="#flashvars#" swliveconnect="true" allownetworking="all" allowscriptaccess="always" name="#id#" src="#src#" width="'+(opts.width || '100%')+'" height="'+(opts.height || '100%')+'" menu="false" wmode="transparent" type="application/x-shockwave-flash"></embed>'
				+ '</object>').replace(/#(\w+)#/ig, function (a, name){ return opts[name]; })
			;
		}


		function _css(el, css){
			if( el && el.style ){
				var key, val;
				for( key in css ){
					val = css[key];
					if( typeof val == 'number' ) val += 'px';
					try { el.style[key] = val; } catch (e) {}
				}
			}
		}


		function _inherit(obj, methods){
			api.each(methods, function (fn, name){
				var prev = obj[name];
				obj[name] = function (){
					this.parent = prev;
					return fn.apply(this, arguments);
				};
			});
		}

		function _isHtmlFile(file){
			return	file && !file.flashId;
		}

		function _wrap(fn){
			var id = fn.wid = api.uid();
			flash._fn[id] = fn;
			return	'FileAPI.Flash._fn.'+id;
		}


		function _unwrap(fn){
			try {
				flash._fn[fn.wid] = null;
				delete	flash._fn[fn.wid];
			}
			catch(e){}
		}


		function _getUrl(url, params){
			if( !_rhttp.test(url) ){
				if( /^\.\//.test(url) || '/' != url.charAt(0) ){
					var path = location.pathname;
					path = path.substr(0, path.lastIndexOf('/'));
					url = (path +'/'+ url).replace('/./', '/');
				}

				if( '//' != url.substr(0, 2) ){
					url = '//' + location.host + url;
				}

				if( !_rhttp.test(url) ){
					url = location.protocol + url;
				}
			}

			if( params ){
				url += (/\?/.test(url) ? '&' : '?') + params;
			}

			return	url;
		}


		function _makeFlashImage(opts, base64, fn){
			var _id, flashId = api.uid(), el = document.createElement('div');

			for( _id in opts ){
				el.setAttribute('data-img-' + _id, opts[_id]);
			}

			_css(el, opts);

			el.innerHTML = _makeFlashHTML(api.extend({
				  id: flashId
				, src: _getUrl(api.flashImageUrl, 'r='+ api.uid())
				, wmode: 'opaque'
				, flashvars: 'scale='+ opts.scale +'&callback='+_wrap(function _setData(){
					_unwrap(_setData);
					setTimeout(_setImage, 99);
					return true;
				})
			}, opts));

			function _setImage(){
				try {
					// Get flash-object by id
					var img = flash.get(flashId);
					img.setImage(base64);
				} catch (e){
					api.log('flash.setImage -- can not set "base64":', e);
				}
			}

			fn(false, el);
			el = null;
		}


		function _getFileDescr(file){
			return	{
				  id: file.id
				, name: file.name
				, matrix: file.matrix
				, flashId: file.flashId
			};
		}



		// @export
		api.Flash = flash;


		// Check dataURI support
		api.newImage('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', function (err, img){
			api.support.dataURI = !(img.width != 1 || img.height != 1);
			flash.init();
		});
	})();
})(FileAPI, window, document);

(function (window, api){
	var
		  noop = function (){}

		, XHR = function (options){
			this.uid = api.uid();
			this.xhr = {
				  abort: noop
				, getResponseHeader: noop
				, getAllResponseHeaders: noop
			};
			this.options = options;
		}
	;


	XHR.prototype = {
		status: 0,
		statusText: '',

		getResponseHeader: function (name){
			return this.xhr.getResponseHeader(name);
		},

		getAllResponseHeaders: function (){
			return this.xhr.getAllResponseHeaders() || {};
		},

		end: function (status, statusText){
			var _this = this, options = _this.options;

			_this.end		=
			_this.abort		= noop;
			_this.status	= status;

			if( statusText ){
				_this.statusText = statusText;
			}

			api.log('xhr.end:', status, statusText);
			options.complete(status == 200 || status == 201 ? false : _this.statusText || 'unknown', _this);

			if( _this.xhr && _this.xhr.node ){
				setTimeout(function (){
					var node = _this.xhr.node;
					try { node.parentNode.removeChild(node); } catch (e){}
					try { delete window[_this.uid]; } catch (e){}
					window[_this.uid] = _this.xhr.node = null;
				}, 9);
			}
		},

		abort: function (){
			this.end(0, 'abort');

			if( this.xhr ){
			    this.xhr.aborted = true;
				this.xhr.abort();
			}
		},

		send: function (FormData){
			var _this = this, options = this.options;

			FormData.toData(function (data){
				// Start uploading
				options.upload(options, _this);
				_this._send.call(_this, options, data);
			}, options);
		},

		_send: function (options, data){
			var _this = this, xhr, uid = _this.uid, url = options.url;

			api.log('XHR._send:', data);

			if( !options.cache ){
				// No cache
				url += (~url.indexOf('?') ? '&' : '?') + api.uid();
			}

			if( data.nodeName ){
				// legacy
				options.upload(options, _this);

				xhr = document.createElement('div');
				xhr.innerHTML = '<form target="'+ uid +'" action="'+ url +'" method="POST" enctype="multipart/form-data" style="position: absolute; top: -1000px; overflow: hidden; width: 1px; height: 1px;">'
							+ '<iframe name="'+ uid +'" src="javascript:false;"></iframe>'
							+ '<input value="'+ uid +'" name="callback" type="hidden"/>'
							+ '</form>'
				;

				_this.xhr.abort = function (){
					var transport = xhr.getElementsByName('iframe')[0];
					if( transport ){
						try {
							if( transport.stop ) transport.stop();
							else if( transport.contentWindow.stop ) transport.contentWindow.stop();
							else transport.contentWindow.document.execCommand('Stop');
						}
						catch (er) {}
					}
					xhr = null;
				};

				// append form-data
				var form = xhr.getElementsByTagName('form')[0];
				form.appendChild(data);

				api.log(form.parentNode.innerHTML);

				// append to DOM
				document.body.appendChild(xhr);

				// keep a reference to node-transport
				_this.xhr.node = xhr;

				// jsonp-callack
				window[uid] = function (status, statusText, response){
					_this.readyState	= 4;
					_this.responseText	= response;
					_this.end(status, statusText);
					xhr = null;
				};

				// send
				_this.readyState = 2; // loaded
				form.submit();
				form = null;
			}
			else {
				// html5
				if (this.xhr && this.xhr.aborted) {
					api.log("Error: already aborted");
					return;
				}
				xhr = _this.xhr = api.getXHR();

				if (data.params) {
				    url += (url.indexOf('?') < 0 ? "?" : "&") + data.params.join("&");
				}

				xhr.open('POST', url, true);

				if( api.withCredentials ){
					xhr.withCredentials = "true";
				}

				if( !options.headers || !options.headers['X-Requested-With'] ){
					xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
				}

				api.each(options.headers, function (val, key){
					xhr.setRequestHeader(key, val);
				});

				
				if ( options._chunked ) {
					// chunked upload
					if( xhr.upload ){
						xhr.upload.addEventListener('progress', function (/**Event*/evt){
							if (!data.retry) {
							    // show progress only for correct chunk uploads
								options.progress({
									  type:			evt.type
									, total:		data.size
									, loaded:		data.start + evt.loaded
									, totalSize:	data.size
								}, _this, options);
							}
						}, false);
					}

					xhr.onreadystatechange = function (){
						_this.status     = xhr.status;
						_this.statusText = xhr.statusText;
						_this.readyState = xhr.readyState;

						if( xhr.readyState == 4 ){
							for( var k in { '': 1, XML: 1, Text: 1, Body: 1 } ){
								_this['response'+k]  = xhr['response'+k];
							}
							xhr.onreadystatechange = null;
                            
							if (!xhr.status || xhr.status - 201 > 0) {
							    api.log("Error: " + xhr.status);
								// some kind of error
								// 0 - connection fail or timeout, if xhr.aborted is true, then it's not recoverable user action
								// up - server error
								if (((!xhr.status && !xhr.aborted) || 500 == xhr.status || 416 == xhr.status) && ++data.retry <= options.chunkUploadRetry) {
									// let's try again the same chunk
									// only applicable for recoverable error codes 500 && 416

									var to = xhr.status ? 0
									                    : api.chunkNetworkDownRetryTimeout;

								    // inform about recoverable problems
									options.pause(data.file, options);

									// smart restart if server reports about the last known byte
									var lkb = parseInt(xhr.getResponseHeader('X-Last-Known-Byte'), 10);
									api.log("X-Last-Known-Byte: " + lkb);
									if (lkb) {
										data.end = lkb;
									} else {
										data.end = data.start - 1;
									}

									setTimeout(function () {
									    _this._send(options, data);
									}, to);
								} else {
									// no mo retries
									_this.end(xhr.status);
								}
							} else {
								// success
								data.retry = 0;

								if (data.end == data.size - 1) {
									// finished
									_this.end(xhr.status);
								} else {
									// next chunk

									// shift position if server reports about the last known byte
									var lkb = parseInt(xhr.getResponseHeader('X-Last-Known-Byte'), 10);
									api.log("X-Last-Known-Byte: " + lkb);
									if (lkb) {
										data.end = lkb;
									}
									data.file.FileAPIReadPosition = data.end;

									setTimeout(function () {
									    _this._send(options, data);
									}, 0);
								}
							}
							xhr = null;
						}
					};

					data.start = data.end + 1;
					data.end = Math.max(Math.min(data.start + options.chunkSize, data.size ) - 1, data.start);
                    
					var slice;
					(slice = 'slice') in data.file || (slice = 'mozSlice') in data.file || (slice = 'webkitSlice') in data.file;

					xhr.setRequestHeader("Content-Range", "bytes " + data.start + "-" + data.end + "/" + data.size);
					xhr.setRequestHeader("Content-Disposition", 'attachment; filename=' + encodeURIComponent(data.name));
					xhr.setRequestHeader("Content-Type", data.type || "application/octet-stream");
                    
					slice = data.file[slice](data.start, data.end + 1);
                 
					xhr.send(slice);
					slice = null;
				} else {
					// single piece upload
					if( xhr.upload ){
						// https://github.com/blueimp/jQuery-File-Upload/wiki/Fixing-Safari-hanging-on-very-high-speed-connections-%281Gbps%29
						xhr.upload.addEventListener('progress', api.throttle(function (/**Event*/evt){
							options.progress(evt, _this, options);
						}, 100), false);
					}
				    
					xhr.onreadystatechange = function (){
						_this.status     = xhr.status;
						_this.statusText = xhr.statusText;
						_this.readyState = xhr.readyState;

						if( xhr.readyState == 4 ){
							for( var k in { '': 1, XML: 1, Text: 1, Body: 1 } ){
								_this['response'+k]  = xhr['response'+k];
							}
							xhr.onreadystatechange = null;
							_this.end(xhr.status);
							xhr = null;
						}
					};

					if( api.isArray(data) ){
						// multipart
						xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=_'+api.expando);
						data = data.join('') +'--_'+ api.expando +'--';

						/** @namespace  xhr.sendAsBinary  https://developer.mozilla.org/ru/XMLHttpRequest#Sending_binary_content */
						if( xhr.sendAsBinary ){
							xhr.sendAsBinary(data);
						}
						else {
							var bytes = Array.prototype.map.call(data, function(c){ return c.charCodeAt(0) & 0xff; });
							xhr.send(new Uint8Array(bytes).buffer);

						}
					} else {
						// FormData 
						xhr.send(data);
					}
				}
			}
		}
	};


	// @export
	api.XHR = XHR;
})(window, FileAPI);

(function (api, window, document){
	var
		encode = window.encodeURIComponent,
		FormData = window.FormData,
		Form = function (){
			this.items = [];
		}
	;


	Form.prototype = {

		append: function (name, blob, file, type){
			this.items.push({
				  name: name
				, blob: blob && blob.blob || (blob == void 0 ? '' : blob)
				, file: blob && (file || blob.name)
				, type:	blob && (type || blob.type)
			});
		},

		each: function (fn){
			var i = 0, n = this.items.length;
			for( ; i < n; i++ ){
				fn.call(this, this.items[i]);
			}
		},

		toData: function (fn, options){
		    // allow chunked transfer if we have only one file to send
		    // flag is used below and in XHR._send
		    options._chunked = api.support.chunked && options.chunkSize > 0 && api.filter(this.items, function (item){ return item.file; }).length == 1;

			if( !api.support.html5 ){
				api.log('FileAPI.Form.toHtmlData');
				this.toHtmlData(fn);
			}
			else if( this.multipart || !FormData ){
				api.log('FileAPI.Form.toMultipartData');
				this.toMultipartData(fn);
			}
			else if( options._chunked ){
				api.log('FileAPI.Form.toPlainData');
				this.toPlainData(fn);
			}
			else {
				api.log('FileAPI.Form.toFormData');
				this.toFormData(fn);
			}
		},

		_to: function (data, complete, next, arg){
			var queue = api.queue(function (){
				complete(data);
			});

			this.each(function (file){
				next(file, data, queue, arg);
			});

			queue.check();
		},


		toHtmlData: function (fn){
			this._to(document.createDocumentFragment(), fn, function (file, data/**DocumentFragment*/){
				var blob = file.blob, hidden;

				if( file.file ){
					api.reset(blob, true);
					// set new name
					blob.name = file.name;
					data.appendChild(blob);
				}
				else {
					hidden = document.createElement('input');
					hidden.name  = file.name;
					hidden.type  = 'hidden';
					hidden.value = blob;
					data.appendChild(hidden);
				}
			});
		},

		toPlainData: function (fn){
			this._to({}, fn, function (file, data, queue){
				if( file.file ){
					data.type = file.file;
				}
				if( file.blob.toBlob ){
				    // canvas
					queue.inc();
					file.blob.toBlob(function (blob){
						data.name = file.name;
						data.file = blob;
						data.size = blob.length;
						data.type = file.type;
						queue.next();
					}, 'image/png');
				}
				else if( file.file ){
				    //file
					data.name = file.blob.name;
					data.file = file.blob;
					data.size = file.blob.size;
					data.type = file.type;
				}
				else {
				    // additional data
				    if (!data.params) {
				        data.params = [];
				    }
				    data.params.push(encodeURIComponent(file.name) + "=" + encodeURIComponent(file.blob));
				}
				data.start = -1;
				data.end = data.file && data.file.FileAPIReadPosition || -1;
				data.retry = 0;
			});
		},

		toFormData: function (fn){
			this._to(new FormData, fn, function (file, data, queue){
				if( file.file ){
					data.append('_'+file.name, file.file);
				}

				if( file.blob && file.blob.toBlob ){
					queue.inc();
					file.blob.toBlob(function (blob){
						data.append(file.name, blob, file.file);
						queue.next();
					}, 'image/png');
				}
				else if( file.file ){
					data.append(file.name, file.blob, file.file);
				}
				else {
					data.append(file.name, file.blob);
				}
			});
		},


		toMultipartData: function (fn){
			this._to([], fn, function (file, data, queue, boundary){
				var
					  isFile = !!file.file
					, blob = file.blob
					, done = function (blob){
						data.push(
							  '--_' + boundary + ('\r\nContent-Disposition: form-data; name="'+ file.name +'"'+ (isFile ? '; filename="'+ encode(file.file) +'"' : '')
							+ (isFile ? '\r\nContent-Type: '+ (file.type || 'application/octet-stream') : '')
							+ '\r\n'
							+ '\r\n'+ (isFile ? blob : encode(blob))
							+ '\r\n')
						);
						queue.next();
					}
				;

				queue.inc();

				if( api.isFile(blob) ){
					api.readAsBinaryString(blob, function (evt/**Object*/){
						if( evt.type == 'load' ){
							done(evt.result);
						}
					});
				}
				else {
					done(blob);
				}
			}, api.expando);
		}
	};


	// @export
	api.Form = Form;
})(FileAPI, window, document);