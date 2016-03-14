/**
 * ItemsTable plugin
 * This plugin creates tabs to display the response from an ajax query.
 * Tab event/goal item plugin
 *
 * This plugin allows to add a row that displays an item showing the relevant information of an event/objective
 * that comes from a JSON object (passed as a getData option). Initially, it has to be called through the "itemsTable"
 * plugin (that acts as a "filter wrapper") inside a foreach sentence (in order to generate all the items that
 * exists in the main JSON object dynamically).
 *
 * @author Eduardo Espinosa
 * @author Dani Perches (daw2dperches@iesjoanramis.org)
 *
 */
(function ($) {
    if (!$.dashboard) {
        $.dashboard = new Object();
    }
    /**
     * itemsTable
     * @param el
     * @param getData
     * @param options
     */
    $.dashboard.itemsTable = function (el, getData, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        // Add a reverse reference to the DOM object
        base.$el.data("dashboard.itemsTable", base);
        /**
         * Random Identification Number
         * @type {*|number}
         */
        var RIN = Math.round(Math.random() * new Date().getTime() / Math.PI);

        /**
         * Constructor
         */
        base.init = function () {
            base.getData = getData;
            base.options = $.extend({}, $.dashboard.itemsTable.defaultOptions, options);
            try {
                base.render();
            }
            catch (e) {
                console.log(e.toString());
            }
            base.insert(base.options.tabs, RIN);
        };
        /**
         * Methods
         */
        base.render = function () {
            var out = base.options.template.portlet;
            out = base.replace(out, {
                portletTitle: base.options.template.portletTitle,
                portletBody: base.options.template.portletBody
            });
            out = base.replace(out, {
                caption: base.options.template.caption,
                actions: base.options.template.actions,
                nav: base.options.template.nav
            });
            out = base.replace(out, {
                icon: base.options.template.icon,
                subject: base.options.template.subject,
                buttonFullScreen: base.options.template.buttonFullScreen
            });
            out = base.replace(out, {
                iconClass: base.options.iconClass,
                fontClass: base.options.fontClass,
                title: base.options.title
            });

            // Create the tabs
            out = base.replace(out, {
                tabs: base.tabs(base.options.tabs, RIN)
            });

            // Create body
            out = base.replace(out, {tabContent: base.options.template.tabContent});

            // Create the containers
            out = base.replace(out, {
                panes: base.panes(base.options.tabs, RIN)
            });
            var j = base.$el.html(out);
            if (j.length > 0) {
                return true;
            }
            else {
                throw new base.Exception("Function: base.render()", this, new Error());
            }
        };
        /**
         * item
         * @param tab
         * @param item
         * @param options
         */
        base.item = function(tab, item, options){
            try {
                //Render the current or previous item by date from now, depending on the option selected.
                if ((moment(item.startDate).diff(moment()) > 0 && !options.previous) || (moment(item.startDate).diff(moment()) < 0 && options.previous)) {
                    base.itemRender(tab, item);
                    base.addItemListener();
                }
            } catch (e) {
                e.toString();
            }
        };
        /**
         * Function to add event listeners
         */
        base.addItemListener = function () {
        };
        /**
         * itemRender
         * @param tab
         * @param item
         */
        base.itemRender = function(tab, item) {
            if (tab.selector !== undefined) {
                var columnOne = base.format(base.options.template.columnOne, {columnOneContent: base.options.iconSet[item.eventType.itemValue]});
                var descWrapper = base.format(base.options.template.descWrapper, {descWrapperContent: item.description});
                var columnTwo = base.format(base.options.template.columnTwo, {columnTwoContent: descWrapper});
                var columnPrimary = base.format(base.options.template.columnPrimary, {columnPrimaryContent: columnOne + columnTwo});
                var columnSecondary = base.format(base.options.template.columnSecondary, {columnSecondaryContent: moment(item.startDate).fromNow()});
                var content = base.format(base.options.template.itemWrapper, {itemWrapperContent: columnPrimary + columnSecondary});
                tab.append(content);
            } else {
                throw new base.Exception("Function: base.itemRender()", this, new Error());
            }
        };
        /**
         * replace
         * @param string
         * @param values
         * @returns {*}
         */
        base.replace = function (string, values) {
            'use strict';
            if (values.__proto__ === Object.prototype) {
                var key;
                var rE;
                for (key in values) {
                    rE = new RegExp("{" + key + "}", "g");
                    string = string.replace(rE, values[key]);
                }
            }
            return string;
        };
        /**
         * String formatter based function
         * @param str
         * @param col
         * @returns {XML|void|string}
         */
        base.format = function (str, col) {
            col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);
            return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
                if (m == "{{") {
                    return "{";
                }
                if (m == "}}") {
                    return "}";
                }
                return col[n];
            });
        };
        /**
         * tabs
         * @param tabs
         * @param rin
         * @returns {string}
         */
        base.tabs = function (tabs, rin) {
            var out = '';
            var key;
            for (key in tabs) {
                if (tabs[key].type == 'tab') {
                    out += base.replace(base.options.template.tab, {
                        title: tabs[key].title,
                        id: tabs[key].title,
                        rin: rin

                    });
                }
                else {
                    out += base.replace(base.options.template.active, {
                        title: tabs[key].title,
                        id: tabs[key].title,
                        rin: rin
                    });
                }
            }
            return out;
        };
        /**
         * panes
         * @param tabs
         * @param rin
         * @returns {string}
         */
        base.panes = function (tabs, rin) {
            var out = '';
            var key;
            for (key in tabs) {
                if (tabs[key].type == 'tab') {
                    out += base.replace(base.options.template.paneTab, {
                        id: tabs[key].title,
                        rin: rin
                    });
                }
                else {
                    out += base.replace(base.options.template.paneActive, {
                        id: tabs[key].title,
                        rin: rin
                    })
                }
            }
            return out;
        };
        /**
         * insert
         * @param tabs
         * @param rin
         */
        base.insert = function (tabs, rin) {
            var key;
            for (key in tabs) {
                var tab = $('#' + tabs[key].title + rin + ' .feeds');
                base.getJson(tabs[key].url, base.hterr, {tab: tab});
            }
        };
        /**
         * getJson
         * @param url
         * @param hterr
         * @param options
         */
        base.getJson = function (url, hterr, options) {
            'use strict';
            $.ajax(
                {
                    url: url,
                    dataType: 'json',
                    statusCode: {
                        100 : function(response){base.options.errors[100](response, options);},
                        101 : function(response){base.options.errors[101](response, options);},
                        200 : function(response){hterr(response, options);},
                        201 : function(response){base.options.errors[201](response, options);},
                        202 : function(response){base.options.errors[202](response, options);},
                        203 : function(response){base.options.errors[203](response, options);},
                        204 : function(response){base.options.errors[204](response, options);},
                        205 : function(response){base.options.errors[205](response, options);},
                        206 : function(response){base.options.errors[206](response, options);},
                        207 : function(response){base.options.errors[207](response, options);},
                        300 : function(response){base.options.errors[300](response, options);},
                        301 : function(response){base.options.errors[301](response, options);},
                        302 : function(response){base.options.errors[302](response, options);},
                        303 : function(response){base.options.errors[303](response, options);},
                        304 : function(response){base.options.errors[304](response, options);},
                        305 : function(response){base.options.errors[305](response, options);},
                        306 : function(response){base.options.errors[306](response, options);},
                        307 : function(response){base.options.errors[307](response, options);},
                        400 : function(response){base.options.errors[400](response, options);},
                        401 : function(response){base.options.errors[401](response, options);},
                        402 : function(response){base.options.errors[402](response, options);},
                        403 : function(response){base.options.errors[403](response, options);},
                        404 : function(response){base.options.errors[404](response, options);},
                        405 : function(response){base.options.errors[405](response, options);},
                        406 : function(response){base.options.errors[406](response, options);},
                        407 : function(response){base.options.errors[407](response, options);},
                        408 : function(response){base.options.errors[408](response, options);},
                        409 : function(response){base.options.errors[409](response, options);},
                        410 : function(response){base.options.errors[410](response, options);},
                        411 : function(response){base.options.errors[411](response, options);},
                        412 : function(response){base.options.errors[412](response, options);},
                        413 : function(response){base.options.errors[413](response, options);},
                        414 : function(response){base.options.errors[414](response, options);},
                        415 : function(response){base.options.errors[415](response, options);},
                        416 : function(response){base.options.errors[416](response, options);},
                        417 : function(response){base.options.errors[417](response, options);},
                        418 : function(response){base.options.errors[418](response, options);},
                        419 : function(response){base.options.errors[419](response, options);},
                        500 : function(response){base.options.errors[500](response, options);},
                        501 : function(response){base.options.errors[501](response, options);},
                        502 : function(response){base.options.errors[502](response, options);},
                        503 : function(response){base.options.errors[503](response, options);},
                        504 : function(response){base.options.errors[504](response, options);},
                        505 : function(response){base.options.errors[505](response, options);},
                        506 : function(response){base.options.errors[506](response, options);}
                    }
                }
            );
        };
        /**
         * hterr
         * @param response
         * @param options
         */
        base.hterr = function (response, options) {
            var events = response.sort(function (obj1, obj2) {
                return moment(obj1.startDate).diff(moment(obj2.startDate));
            });
            $.each(events, function (i, item) {
                //new $.dashboard.item(options.tab, item, {previous: true});
                new base.options.itemRenderFunction(base, options.tab, item, {previous: true});
            });
        };
        /**
         * Exception
         * @param msg
         * @param obj
         * @param err
         * @constructor
         */
        base.Exception = function (msg, obj, err) {
            'use strict';
            {
                var author = "Exception class by Eduardo Espinosa";
            }
            var e;
            /**
             * @override
             */
            base.Exception.prototype.constructor = function () {
                msg = (msg === undefined || typeof msg !== 'string') ? "You don't pass the Message argument" : msg;
                obj = (obj === undefined) ? "You don't pass the Object argument" : obj;
                err = (err === undefined) ? "You don't pass the Error argument" : err;
                if (msg !== undefined && obj !== undefined && err !== undefined) {
                    e = this;
                    e.msg = msg;
                    e.obj = obj;
                    e.err = err;
                }
            };
            /**
             * @override
             * @returns {string}
             */
            base.Exception.prototype.toString = function () {
                if (msg !== undefined && obj !== undefined && err !== undefined) {
                    console.log(e.msg);
                    console.log(e.err);
                    console.log(e.obj);
                } else {
                    console.log(msg);
                    console.log(err);
                    console.log(obj);
                }

                return author;
            };
            base.Exception.prototype.constructor();
            if (msg !== undefined && obj !== undefined && err !== undefined) {
                Object.preventExtensions(e);
                Object.seal(e);
                Object.freeze(e);
            }
        };
        // Run initializer
        base.init();
    };
    /**
     *
     * @type {{template: {portlet: string, portletTitle: string, portletBody: string, tabContent: string, caption: string, icon: string, subject: string, actions: string, buttonFullScreen: string, nav: string, active: string, tab: string, paneActive: string, paneTab: string, itemWrapper: string, columnPrimary: string, columnSecondary: string, columnOne: string, columnTwo: string, descWrapper: string, itemListHTML: string}, iconClass: string, fontClass: string, title: string, fullScreen: boolean, height: string, tabs: *[], iconSet: {GOAL_OTHER: string, GOAL_SECUNDARY: string, MESOCICLE: string, SESSION: string, MACROCICLE: string, GENERIC: string, GOAL_PRIMARY: string, MICROCICLE: string}, errors: {404: string}, itemRenderFunction: Function}}
     */
    $.dashboard.itemsTable.defaultOptions = {
        template: {
            portlet: '<div class="portlet light ">{portletTitle} {portletBody}</div>',
            portletTitle: '<div class="portlet-title tabbable-line">{caption}{actions}{nav}</div>',
            portletBody: '<div class="portlet-body">{tabContent}</div>',
            tabContent: '<div class="tab-content">{panes}</div>',
            caption: '<div class="caption">{icon} {subject}</div>',
            icon: '<i class="{iconClass} {fontClass}"></i>',
            subject: '<span class="caption-subject {fontClass} bold uppercase">{title}</span>',
            actions: '<div class="actions">{buttonFullScreen}</div>',
            buttonFullScreen: '<a class="btn btn-circle btn-icon-only btn-default fullscreen" href="#" data-original-title="" title=""> </a>',
            nav: '<ul class="nav nav-tabs">{tabs}</ul>',
            active: '<li class="active"><a href="#{id}{rin}" data-toggle="tab" role="tab" class="active">{title}</a></li>',
            tab: '<li><a href="#{id}{rin}" data-toggle="tab" role="tab">{title}</a></li>',
            paneActive: '<div class="tab-pane active" id="{id}{rin}"><div class="scroller" style="height: 290px;" data-always-visible="1" data-rail-visible1="1"><ul class="feeds"></ul></div></div>',
            paneTab: '<div class="tab-pane" id="{id}{rin}"><div class="scroller" style="height: 290px;" data-always-visible="1" data-rail-visible1="1"><ul class="feeds"></ul></div></div>',
            itemWrapper: '<li>{itemWrapperContent}</li>',
            columnPrimary: '<div class="col1"><div class="cont">{columnPrimaryContent}</div></div>',
            columnSecondary: '<div class="col2" style="width: 120px; margin-left: -120px;"><div class="date">{columnSecondaryContent}</div></div>',
            columnOne: '<div class="cont-col1">{columnOneContent}</div>',
            columnTwo: '<div class="cont-col2">{columnTwoContent}</div>',
            descWrapper: '<div class="desc">{descWrapperContent}</div>'
        },
        iconClass: "icon-globe",
        fontClass: 'font-green-sharp',
        title: "PRÓXIMOS OBJETIVOS",
        fullScreen: true,
        height: "relative",
        tabs: [
            {
                title: 'Generic',
                eventType: 'GENERIC',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/GENERIC',
                type: 'active'
            }, {
                title: 'Primary',
                eventType: 'GOAL_PRIMARY',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/GOAL_PRIMARY',
                type: 'tab'
            }, {
                title: 'Secondary',
                eventType: 'GOAL_SECUNDARY',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/GOAL_SECUNDARY',
                type: 'tab'
            }, {
                title: 'Other',
                eventType: 'GOAL_OTHER',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/GOAL_OTHER',
                type: 'tab'
            }, {
                title: 'Session',
                eventType: 'SESSION',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/SESSION',
                type: 'tab'
            }, {
                title: 'Macro',
                eventType: 'MACROCICLE',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/MACROCICLE',
                type: 'tab'
            }, {
                title: 'Meso',
                eventType: 'MESOCICLE',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/MESOCICLE',
                type: 'tab'
            }, {
                title: 'Micro',
                eventType: 'MICROCICLE',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/MICROCICLE',
                type: 'tab'
            }
        ],
        iconSet: {
            GOAL_OTHER: '<div class="label label-sm label-success"><i class="fa fa-bullhorn"></i></div>',
            GOAL_SECUNDARY: '<div class="label label-sm label-info"><i class="fa fa-bullhorn"></i></div>',
            MESOCICLE: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>',
            SESSION: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>',
            MACROCICLE: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>',
            GENERIC: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>',
            GOAL_PRIMARY: '<div class="label label-sm label-danger"><i class="fa fa-bullhorn"></i></div>',
            MICROCICLE: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>'
        },
        errors : {
            100 : function(){console.log('HTERR_CONTINUE');},
            101 : function(){console.log('HTERR_SWITCHING');},
            200 : '',
            201 : function(){console.log('HTERR_CREATED');},
            202 : function(){console.log('HTERR_ACCEPTED');},
            203 : function(){console.log('HTERR_NON_AUTHORITATIVE');},
            204 : function(response, options){console.log('HTERR_NO_CONTENT');},
            205 : function(){console.log('HTERR_RESET');},
            206 : function(){console.log('HTERR_PARTIAL');},
            207 : function(){console.log('HTERR_PARTIAL_OK');},
            300 : function(){console.log('HTERR_MULTIPLE');},
            301 : function(){console.log('HTERR_MOVED');},
            302 : function(){console.log('HTERR_FOUND');},
            303 : function(){console.log('HTERR_METHOD');},
            304 : function(){console.log('HTERR_NOT_MODIFIED');},
            305 : function(){console.log('HTERR_USE_PROXY');},
            306 : function(){console.log('HTERR_PROXY_REDIRECT');},
            307 : function(){console.log('HTERR_TEMP_REDIRECT');},
            400 : function(){console.log('HTERR_BAD_REQUEST');},
            401 : function(){console.log('HTERR_UNAUTHORIZED');},
            402 : function(){console.log('HTERR_PAYMENT_REQUIRED');},
            403 : function(){console.log('HTERR_FORBIDDEN');},
            404 : function(){console.log('HTERR_NOT_FOUND');},
            405 : function(){console.log('HTERR_NOT_ALLOWED');},
            406 : function(){console.log('HTERR_NONE_ACCEPTABLE');},
            407 : function(){console.log('HTERR_PROXY_UNAUTHORIZED');},
            408 : function(){console.log('HTERR_TIMEOUT');},
            409 : function(){console.log('HTERR_CONFLICT');},
            410 : function(){console.log('HTERR_GONE');},
            411 : function(){console.log('HTERR_LENGTH_REQUIRED');},
            412 : function(){console.log('HTERR_PRECON_FAILED');},
            413 : function(){console.log('HTERR_TOO_BIG');},
            414 : function(){console.log('HTERR_URI_TOO_BIG');},
            415 : function(){console.log('HTERR_UNSUPPORTED');},
            416 : function(){console.log('HTERR_BAD_RANGE');},
            417 : function(){console.log('HTERR_EXPECTATION_FAILED');},
            418 : function(){console.log('HTERR_REAUTH');},
            419 : function(){console.log('HTERR_PROXY_REAUTH');},
            500 : function(){console.log('HTERR_INTERNAL');},
            501 : function(){console.log('HTERR_NOT_IMPLEMENTED');},
            502 : function(){console.log('HTERR_BAD_GATE');},
            503 : function(){console.log('HTERR_DOWN');},
            504 : function(){console.log('HTERR_GATE_TIMEOUT');},
            505 : function(){console.log('HTERR_BAD_VERSION');},
            506 : function(){console.log('HTERR_NO_PARTIAL_UPDATE');}
        },
        /**
         * itemRenderFunction
         * @param base
         * @param tab
         * @param item
         * @param options
         */
        itemRenderFunction: function(base, tab, item, options){
            base.item(tab, item, options);
        }

    };
    $.fn.dashboard_itemsTable = function (getData, options) {
        return this.each(function () {
            (new $.dashboard.itemsTable(this, getData, options));
        });
    };
    // This function breaks the chain, but returns
    // the myCorp.MyExample if it has been attached to the object.
    $.fn.getDashboard_itemsTable = function () {
        this.data("dashboard.itemsTable");
    };
})(jQuery);