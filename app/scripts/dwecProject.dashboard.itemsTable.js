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
        base.$el.data("dashboard", base);
        base.init = function () {
            base.getData = getData;
            base.options = $.extend({}, $.dashboard.itemsTable.defaultOptions, options);

            var out = base.options.template.portlet;
            out = base.replace(out, {portletTitle: base.options.template.portletTitle});
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

            //TODO: function to build tabs
            //Begin examples
            out = base.replace(out, {
                active: base.options.template.active,
                tab: base.options.template.tab
            });

            // Create the containers
            out = base.replace(out, {
                tabs: base.tabs(base.options.tabs)
            });


            // Call their objects

            // Put your initialization code here
            base.$el.html(out);

            base.getJ('http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/', base.func, undefined);
        };

        /**
         * Replace function
         */
        base.replace = function (string, values) {
            'use strict';
            //TODO: continue here 2016/02/25
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
        base.tabs = function (tabs) {
            var out = '';
            var key;
            for (key in tabs) {
                if (tabs[key].type == 'tab') {
                    out += base.replace(base.options.template.tab, {title: tabs[key].title});
                }
                else {
                    out += base.replace(base.options.template.active, {title: tabs[key].title});
                }
            }
            return out;
        };
        base.getJ = function (url, f, options) {
            'use strict';
            $.ajax(
                {
                    url: url,
                    dataType: 'json',
                    statusCode: {
                        200: function (doc) {
                            f(doc, options);
                        }
                    }
                }
            );
        };
        base.func = function (a, opts) {
            console.log(typeof a);
            console.log("doing: ", a);
            console.log("doing: ", opts);
        };
        // Run initializer
        base.init();
    };
    $.dashboard.itemsTable.defaultOptions = {
        template: {
            portlet: '<div class="portlet light ">{portletTitle}</div>',
            portletTitle: '<div class="portlet-title tabbable-line">{caption}{actions}{nav}</div>',
            portletBody: '<div class="portlet-body"></div>',
            tabContent: '<div class="tab-content">{panes}</div>',
            caption: '<div class="caption">{icon} {subject}</div>',
            icon: '<i class="{iconClass} {fontClass}"></i>',
            subject: '<span class="caption-subject {fontClass} bold uppercase">{title}</span>',
            actions: '<div class="actions">{buttonFullScreen}</div>',
            buttonFullScreen: '<a class="btn btn-circle btn-icon-only btn-default fullscreen" href="#" data-original-title="" title=""> </a>',
            nav: '<ul class="nav nav-tabs">{tabs}</ul>',
            active: '<li class="active"><a href="#{id}" data-toggle="tab" role="tab" class="active">{title}</a></li>',
            tab: '<li><a href="{id}" data-toggle="tab" role="tab">{title}</a></li>',
            paneActive: '<div class="tab-pane active" id="tab_1_1">',
            paneTab: '<div class="tab-pane active" id="tab_1_1">'
        },
        iconClass: "icon-globe",
        fontClass: 'font-green-sharp',
        title: "PRÓXIMOS OBJETIVOS",
        fullScreen: true,
        height: "relative",
        tabs: [
            {
                title: 'Generic',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/GENERIC',
                type: 'active'
            }, {
                title: 'Primary',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/GOAL_PRIMARY',
                type: 'tab'
            }, {
                title: 'Secondary',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/GOAL_SECUNDARY',
                type: 'tab'
            }, {
                title: 'Other',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/GOAL_OTHER',
                type: 'tab'
            }, {
                title: 'Session',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/SESSION',
                type: 'tab'
            }, {
                title: 'Macro',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/MACROCICLE',
                type: 'tab'
            }, {
                title: 'Meso',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/MESOCICLE',
                type: 'tab'
            }, {
                title: 'Micro',
                url: 'http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/MICROCICLE',
                type: 'tab'
            }
        ]
    };
    $.fn.myCorp_MyExample = function (getData, options) {
        return this.each(function () {
            (new $.MyCorp.MyExample(this, getData, options));
        });
    };
    // This function breaks the chain, but returns
    // the myCorp.MyExample if it has been attached to the object.
    $.fn.getMyCorp_MyExample = function () {
        this.data("MyCorp.MyExample");
    };
})(jQuery);