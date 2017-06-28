/*
 * grunt-csproj-integrity
 * https://github.com/mantovanig/grunt-csproj-integrity
 *
 * Copyright (c) 2016 mantovanig
 * Licensed under the MIT license.
 */

'use strict';

// require modules
const checksolution = require('csproj-integrity');
const path = require('path');

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks
    return grunt.registerMultiTask('csproj_integrity', 'Grunt plugin of csproj-integrity', function() {

        var done = this.async();

        var options = this.options({
            checkFiles: false,
            checkIntegrity: false,
            failOnError: false // Fail the task on error. Default: false
        });

        this.files.forEach(function(file) {

            if (!file.cwd) {
                file.cwd = '';
            }

            var files = file.src.map(function(f) {
                return path.join(file.cwd, f);
            });
            grunt.log.debug('Checking: ' + files.length + ' files.');

            Promise.resolve()
                .then(function() {
                    if (options.checkFiles) {
                        console.log('checkFiles...');
                        return checksolution.checkFiles(files)
                            .then(function(files) {
                                console.log('checkFiles: all files included');
                                return files;
                            })
                            .catch(function() {
                                console.log('checkFiles: some files NOT included');
                                return options.checkFiles === true && options.failOnError === true ? Promise.reject('checkFiles - errors found...') : [];
                            });
                    }
                    return Promise.resolve([]);
                })
                .then(function(files) {
                    var files = [].concat(files);
                    if (options.checkIntegrity) {
                        console.log('checkIntegrity...');
                        return checksolution.checkIntegrity(files)
                            .then(function(fileIncludes) {
                                console.log('checkIntegrity: all integrity checks passed');
                                return files.concat(fileIncludes);
                            }).catch(function() {
                                console.log('checkIntegrity - errors found...');
                                return options.checkIntegrity === true && options.failOnError === true ? Promise.reject('checkIntegrity - errors found...') : [];
                            });
                    }
                    return Promise.resolve(files);
                })
                .then(function(files) {
                    done();
                }).catch(function(err) {
                    grunt.fail.fatal('grunt-csproj-integrity: failures found: ', err);
                });

        }); // end forEach

    });

};
