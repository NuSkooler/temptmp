# temptmp - Temp Files & Directories For Node (Again)

**temptmp** is a module for generating unique temporary file/directory names and files, as well as automatic tracking and cleanup. Tracking and cleanup can optionally use a *session identifier* such that __independent tracking can be used without conflict in long running processes__.

temptmp is inspired by [node-temp](https://github.com/bruce/node-temp) and [node-tmp](https://github.com/raszi/node-tmp).

## Compatability
temptmp is written using ES6 & therefore requires newer Node.js (think 6.x+) features.

## Installation
`npm install temptmp`

## Usage
### Setup
Create a new session with `createSession`, optionally passing a *sessionId*. You may also enable tracking or explicitly use the `createTrackedSession` API. Note that at any time `pauseTracking` or `resumeTracking` can be called.

```
const temptmp = require('temptmp').createTrackedSession('my_session');
```

### Create ~~temporary~~ temptmp stuff
The APIs `path`, `open`, and `mkdir` take an optional `options` object and a completion callback.

#### Options
* `prefix` (String): A prefix for the temporary **file name**. Defaults to `''`
* `suffix` (String): A suffix for the temporary **file name**. Defaults to `''`
* `dir` (String): Directory to create temporary file/directory. Defaults to `os.tmpdir`
* `mode` (Number): Mode for new file/directory. Defaults to `0600` for files and `0700` for directories.
* `flags` (Number): Creation flags for files. Defaults to `(O_CREAT | O_TRUNC | O_RDWR | O_EXCL)`

#### Cleanup


#### APIs
##### Get a Path
```
const temptmp = require('temptmp').createTrackedSession('my_session');

temptmp.path( (err, path) => {
  // path is present if !err
});

// though we asked for tracking, we didn't actually create any files

```


##### Create a File
```
// equiv to createTrackedSession('my_session')
const temptmp = require('temptmp').createSession('my_session', true);

temptmp.open( (err, tempFileInfo) => {
  // tempFileInfo.path and tempFileInfo.fd are avail if !err
});

// files created are auto-cleaned up at process exit since we asked for tracking
```

##### Create a Directory
```
//	note that we're not asking for tracking
const temptmp = require('temptmp').createSession('my_session');

temptmp.mkdir( { prefix : 'roffle', suffix : 'copter' }, (err, path) => {
  // path is present if !err
  // ...do stuff with path...
  // temptmp.cleanup(); // clean up tracked items in "my_session" only!
});

// we didn't ask for tracking; no additional cleanup here.
```

##### Other APIs
Remember that your `temptmp` object also has `pauseTracking` and `resumeTracking` to selectively track or omit particular files from tracking.

## Contributing
Feel free to submit comments/feedback and PR requests. Note that I do not have intentions of supporting anything older than ES6. If you need this, fork away!

## License
Released under the [BSD 2-clause](https://opensource.org/licenses/BSD-2-Clause) license:

Copyright (c) 2017, Bryan D. Ashby
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.