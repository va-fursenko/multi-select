import { App } from './app';

/**
 * Common http functions and helpers
 */
export const Http = {
    /**
     * Performing AJAX request
     * @see http://xmlhttprequest.ru/
     *
     * @param params
     */
    ajax (params) {
        let request = new XMLHttpRequest();
        let requestMethod = typeof params.method == 'string'
            ? params.method.toUpperCase()
            : 'POST';

        request.open(requestMethod, params.url, true);
        if (requestMethod == 'POST') {
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            request.setRequestHeader('Accept', 'application/json');
        }

        if (typeof params.fail == 'function') {
            request.onerror = params.fail;
            request.onabort = params.fail;
            request.ontimeout = params.fail;
        }

        request.onload = function () {
            // Fail handler
            if ([200, 201, 202].indexOf(request.status) == -1) {
                if (typeof params.fail == 'function') {
                    params.fail(request);
                }
                return;
            }

            // Success handler
            if (typeof params.done == 'function') {
                params.done(JSON.parse(request.responseText));
            }
        };

        request.send(JSON.stringify(params.data));
    },

    /**
     * Execute ajax action
     *
     * @param {String} url
     * @param {Object} params
     * @param {Function} onLoad
     */
    ajaxAction (url, params, onLoad)
    {
        let data = {};
        Object.assign(data, params);
        data._token = App.csrf();
        let self = this;
        this.ajax({
            url: App.url(url),
            data: data,
            done (response) {
                if (response.success) {
                    onLoad(response);
                } else {
                    self.parseErrorResponse(response);
                }
            },
            fail (responseObject) {
                self.parseError(responseObject);
            }
        });
    },

    /**
     * Parse error by response data
     *
     * @param {Object} response
     */
    parseErrorResponse (response)
    {
        alert("Error occurred: '" + (response.error ? response.error : '') + "'");
    },

    /**
     * Parse error by response data
     *
     * @param {Object} responseObject
     */
    parseError (responseObject)
    {
        alert("Error occurred!");
        console.log('Request failed', responseObject);
    },

    /**
     * Parsing one or all GET parameters
     *
     * @param {String} field
     * @returns {{}|{String}}
     */
    get (field = null) {
        let getVar,
            result = {},
            arrayGet = window.location.search.substring(1).split("&");

        for (let i = 0; i < arrayGet.length; i++) {
            getVar = arrayGet[i].split("=");
            if (getVar == '') {
                continue;
            }
            if (field && getVar[0] == field) {
                return getVar[1];
            }
            result[getVar[0]] = typeof(getVar[1]) == "undefined" ? "" : getVar[1];
        }
        return result;
    }
};

