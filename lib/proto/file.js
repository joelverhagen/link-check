"use strict";

const fs = require('fs');
const LinkCheckResult = require('../LinkCheckResult');
const path = require('path');
const processModule = require('process');
const url = require('url');

module.exports = {
    check: function (link, opts, callback) {
        let fileLink = link;
        let hash = url.parse(link, false, true).hash;
        if ((hash || '') === link) {
            fileLink = opts.url + link;
        }

        let filepath = decodeURIComponent(url.parse(fileLink, false, true).pathname || '');
        if (!path.isAbsolute(filepath)) {
            const basepath = decodeURI(url.parse(opts.baseUrl, false, true).path) || processModule.cwd();
            filepath = path.resolve(basepath, filepath);
        }

        fs.access(filepath || '', fs.hasOwnProperty('R_OK') ? fs.R_OK : fs.constants.R_OK, function (err) {
            let stream = null;
            if (!err && opts.checkAnchors && hash) {
                if (filepath.endsWith('.md')) {
                    stream = fs.createReadStream(filepath);
                } else {
                    console.warn('Skipping anchor check for non-Markdown file: %s', filepath);
                }
            }
            callback(null, new LinkCheckResult(opts, link, !err ? 200 : 400, err, stream));
        });
    }
};
