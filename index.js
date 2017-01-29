/* jslint node: true */
'use strict';

const fs			= require('fs');
const crypto		= require('crypto');
const tempDir		= require('os').tmpdir();
const consts		= require('constants');
const paths			= require('path');
const del			= require('del');

const tracked = { };

function cleanupSession(sessionId, sync, cb) {
	const list = (tracked[sessionId].files || []).concat( (tracked[sessionId].dirs || [] ).map(d => {
		return `${d}/**`;
	}));

	if(0 === list.length) {
		if(cb) {
			cb(null, [ ] );
		}
		return;
	}

	const delOpts = {
		force	: true,	//	allow to delete outside current working dir
	};

	if(sync) {
		const paths = del.sync(list, delOpts);
		if(cb) {
			cb(null, paths);
		}
		return;
	}

	del(list, delOpts ).then( paths => {
		if(cb) {
			return cb(null, paths);
		}
	});
}

let cleanupAttached = false;
if(!cleanupAttached) {
	cleanupAttached = true;

	process.once('exit', () => {
		Object.keys(tracked).forEach(sessionId => {
			cleanupSession(sessionId, true, () => { /* dummy */ } );
		});
	});
}

const AVAIL_CHARS	= 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
const CREATE_FLAGS	= (consts.O_CREAT | consts.O_TRUNC | consts.O_RDWR | consts.O_EXCL);
const FILE_MODE		= 0o0600;
const DIR_MODE		= 0o0700;
const TEMP_EPOC		= 1485709902194;

module.exports = class temptmp {
	constructor(sessionId, trackingEnabled) {
		this.sessionId			= sessionId || 'internal_global_session';
		this.trackingEnabled	= trackingEnabled || false;
	}

	static createSession(sessionId, trackingEnabled) {
		return new temptmp(sessionId, trackingEnabled);
	}

	static createTrackedSession(sessionId) {
		return new temptmp(sessionId, true);
	}

	pauseTracking() {
		this.trackingEnabled = false;
		return this;
	}

	resumeTracking() {
		this.trackingEnabled = true;
		return this;
	}

	path(options, cb) {
		const [ opts, callback ] = this._getOptionsAndCallback(options, cb);

		return callback(null, this._makeFullTempPath(opts));
	}

	open(options, cb) {
		const [ opts, callback ] = this._getOptionsAndCallback(options, cb);
		
		const path = this._makeFullTempPath(opts);

		fs.open(path, opts.flags || CREATE_FLAGS, opts.mode || FILE_MODE, (err, fd) => {
			if(!err) {
				this._track(path, 'files');
			}

			return callback(err, { path : path, fd : fd } );
		});		
	}

	mkdir(options, cb) {
		const [ opts, callback ] = this._getOptionsAndCallback(options, cb);

		const path = this._makeFullTempPath(opts);

		fs.mkdir(path, opts.mode || DIR_MODE, err => {
			if(!err) {
				this._track(path, 'dirs');
			}

			return callback(err, path);
		});
	}

	cleanup(cb) {
		cleanupSession(this.sessionId, false, paths => {
			delete tracked[this.sessionId];
		});
	}

	_getOptionsAndCallback(options, cb) {
		if(!cb && 'function' === typeof(options)) {
			cb = options;
			options = {};
		}

		options = options || {};

		return [options, cb];
	}

	_track(path, type) {
		if(!this.trackingEnabled) {
			return;
		}

		tracked[this.sessionId] = tracked[this.sessionId] || {};
		tracked[this.sessionId][type] = tracked[this.sessionId][type] || [];
		tracked[this.sessionId][type].push(path);
	}

	_getRandomString(len) {
		let randBytes;
		try {
			randBytes = crypto.randomBytes(len);
		} catch(e) {
			randBytes = crypto.pseudoRandomBytes(len);
		}

		const result = new Array(len);

		for(let i = 0; i < len; ++i) {
			result[i] = AVAIL_CHARS[randBytes[i] % AVAIL_CHARS.length];
		}

		return result.join('');
	}

	_makeFullTempPath(options) {
		const fileName = [
			options.prefix || '',
			process.pid,
			(Date.now() - TEMP_EPOC).toString(16),
			this._getRandomString(16),
			options.suffix || '',
		].join('');

		return paths.join(options.dir || tempDir, fileName);
	}
};
