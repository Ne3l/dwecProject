/**
 * Created by eduardo on 18/02/16.
 */
(function ($) {
    if (!$.dashboard) {
        $.dashboard = new Object();
    }

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
                return true
            }
            else {
                throw new base.Exception("Function: base.render()", this, new Error());
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
         * tabs
         * @param tabs
         * @param riu
         * @returns {string}
         */
        base.tabs = function (tabs, riu) {
            var out = '';
            var key;
            for (key in tabs) {
                if (tabs[key].type == 'tab') {
                    out += base.replace(base.options.template.tab, {
                        title: tabs[key].title,
                        id: tabs[key].title,
                        riu: riu

                    });
                }
                else {
                    out += base.replace(base.options.template.active, {
                        title: tabs[key].title,
                        id: tabs[key].title,
                        riu: riu
                    });
                }
            }
            return out;
        };
        /**
         * panes
         * @param tabs
         * @param riu
         * @returns {string}
         */
        base.panes = function (tabs, riu) {
            var out = '';
            var key;
            for (key in tabs) {
                if (tabs[key].type == 'tab') {
                    out += base.replace(base.options.template.paneTab, {
                        id: tabs[key].title,
                        riu: riu
                    });
                }
                else {
                    out += base.replace(base.options.template.paneActive, {
                        id: tabs[key].title,
                        riu: riu
                    })
                }
            }
            return out;
        };
        /**
         * insert
         * @param tabs
         * @param riu
         */
        base.insert = function (tabs, riu) {
            var key;
            for (key in tabs) {
                var el = $('#' + tabs[key].title + riu + ' .feeds');
                base.getJson(tabs[key].url, base.func, {target: el});
            }
        };
        /**
         * getJson
         * @param url
         * @param f
         * @param options
         */
        base.getJson = function (url, f, options) {
            'use strict';
            $.ajax(
                {
                    url: url,
                    dataType: 'json',
                    statusCode: {
                        200: function (doc) {
                            f(doc, options);
                        },
                        204: function () {
                            console.log("204");
                        },
                        400: function () {
                            console.log("400");
                        },
                        401: function () {
                            console.log("401");
                        },
                        403: function () {
                            console.log("403");
                        },
                        404: function () {
                            console.log("404");
                        },
                        500: function () {
                            console.log("500");
                        }
                    }
                }
            );
        };
        /**
         *
         * @param data
         * @param options
         */
        base.func = function (data, options) {
            var events = data.sort(function (obj1, obj2) {
                return moment(obj1.startDate).diff(moment(obj2.startDate));
            });
            $.each(events, function (i, item) {
                new $.dashboard.item(options.target, item, {
                    previous: true
                });
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
     * @type {{template: {portlet: string, portletTitle: string, portletBody: string, tabContent: string, caption: string, icon: string, subject: string, actions: string, buttonFullScreen: string, nav: string, active: string, tab: string, paneActive: string, paneTab: string, itemWrapper: string, columnPrimary: string, columnSecondary: string, columnOne: string, columnTwo: string, descWrapper: string}, iconClass: string, fontClass: string, title: string, fullScreen: boolean, height: string, tabs: *[], iconSet: {GOAL_OTHER: string, GOAL_SECUNDARY: string, MESOCICLE: string, SESSION: string, MACROCICLE: string, GENERIC: string, GOAL_PRIMARY: string, MICROCICLE: string}}}
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
            active: '<li class="active"><a href="#{id}{riu}" data-toggle="tab" role="tab" class="active">{title}</a></li>',
            tab: '<li><a href="#{id}{riu}" data-toggle="tab" role="tab">{title}</a></li>',
            paneActive: '<div class="tab-pane active" id="{id}{riu}"><div class="scroller" style="height: 290px;" data-always-visible="1" data-rail-visible1="1"><ul class="feeds"></ul></div></div>',
            paneTab: '<div class="tab-pane" id="{id}{riu}"><div class="scroller" style="height: 290px;" data-always-visible="1" data-rail-visible1="1"><ul class="feeds"></ul></div></div>',
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

    /* ****************************************************************************************************************/

    /**
     * Tab event/goal item plugin
     *
     * This plugin allows to add a row that displays an item showing the relevant information of an event/objective
     * that comes from a JSON object (passed as a getData option). Initially, it has to be called through the "itemsTable"
     * plugin (that acts as a "filter wrapper") inside a foreach sentence (in order to generate all the items that
     * exists in the main JSON object dynamically).
     *
     * @author Dani Perches (daw2dperches@iesjoanramis.org)
     *
     */
    /**
     * Function called when the plugin is invoked
     * @param el: string with query value for jquery  [..]
     * @param getData
     * @param options
     * @constructor
     */
    $.dashboard.item = function (el, getData, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        // Add a reverse reference to the DOM object
        base.$el.data("dashboard.item", base);
        base.init = function () {
            base.getData = getData;
            base.options = $.extend({}, $.dashboard.item.defaultOptions, options);
            try {
                //Render the current or previous item by date from now, depending on the option selected.
                if ((moment(base.getData.startDate).diff(moment()) > 0 && !base.options.previous) || (moment(base.getData.startDate).diff(moment()) < 0 && base.options.previous)) {
                    base.render();
                    base.addListeners();
                }
            } catch (e) {
                console.log("Initialization failure!");
            }
        };

        /**
         * Render final HTML
         */
        base.render = function () {
            //var columnOne = base.format(base.options.templates.columnOne, {columnOneContent: base.options.iconSet[base.options.eventType]});
            var columnOne = base.format(base.options.templates.columnOne, {columnOneContent: base.options.iconSet[base.getData.eventType.itemValue]});
            //var descWrapper = base.format(base.options.templates.descWrapper, {descWrapperContent: base.options.eventDesc});
            var descWrapper = base.format(base.options.templates.descWrapper, {descWrapperContent: base.getData.description});
            var columnTwo = base.format(base.options.templates.columnTwo, {columnTwoContent: descWrapper});
            var columnPrimary = base.format(base.options.templates.columnPrimary, {columnPrimaryContent: columnOne + columnTwo});
            //var columnSecondary = base.format(base.options.templates.columnSecondary, {columnSecondaryContent: base.options.currentDate});
            var columnSecondary = base.format(base.options.templates.columnSecondary, {columnSecondaryContent: moment(base.getData.startDate).fromNow()});
            var content = base.format(base.options.templates.itemWrapper, {itemWrapperContent: columnPrimary + columnSecondary});

            base.$el.append(content);

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
         * Function to add event listeners
         */
        base.addListeners = function () {
        };

        /**
         * Initialize the plugin
         */
        base.init();
    };

    /**
     * Plugin default options
     * @type {{templates: {itemWrapper: string, columnPrimary: string, columnSecondary: string, columnOne: string, columnTwo: string, descWrapper: string}, iconSet: {GOAL_OTHER: string, GOAL_SECUNDARY: string, MESOCICLE: string, SESSION: string, MACROCICLE: string, GENERIC: string, GOAL_PRIMARY: string, MICROCICLE: string}}}
     */
    $.dashboard.item.defaultOptions = {
        templates: {
            itemWrapper: '<li>{itemWrapperContent}</li>',
            columnPrimary: '<div class="col1"><div class="cont">{columnPrimaryContent}</div></div>',
            columnSecondary: '<div class="col2" style="width: 120px; margin-left: -120px;"><div class="date">{columnSecondaryContent}</div></div>',
            columnOne: '<div class="cont-col1">{columnOneContent}</div>',
            columnTwo: '<div class="cont-col2">{columnTwoContent}</div>',
            descWrapper: '<div class="desc">{descWrapperContent}</div>'
        },
        iconSet: {
            GOAL_OTHER: '<div class="label label-sm label-success"><i class="fa fa-bullhorn"></i></div>',
            GOAL_SECUNDARY: '<div class="label label-sm label-info"><i class="fa fa-bullhorn"></i></div>',
            MESOCICLE: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>',
            SESSION: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>',
            MACROCICLE: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>',
            GENERIC: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>',
            GOAL_PRIMARY: '<div class="label label-sm label-danger"><i class="fa fa-bullhorn"></i></div>',
            MICROCICLE: '<div class="label label-sm label-success"><i class="fa fa-bell-o"></i></div>'
        }
    };

    /**
     *
     * @param getData
     * @param options
     * @returns {*}
     * @constructor
     */
    $.fn.dashboard_item = function (getData, options) {
        return this.each(function () {
            (new $.dashboard.item(this, getData, options));
        });
    };

    /**
     *  This function breaks the chain, but returns the tabs.item if it has been attached to the object.
     */
    $.fn.getDashboard_item = function () {
        this.data("dashboard.item");
    };
    /* ****************************************************************************************************************/
})(jQuery);