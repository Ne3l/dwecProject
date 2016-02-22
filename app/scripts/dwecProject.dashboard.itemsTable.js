/**
 * Created by eduardo on 18/02/16.
 */
(function ($) {
    if (!$.dashboard) {
        $.dashboard = new Object();
    }
    ;
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
            console.log(base.options);
            console.log(this.$el);

            console.log(base.options.template.beginContainer);
            base.$el.append(base.options.template.beginContainer);
            //base.el.append(base.options.template.beginAlgo1);
            //base.el.append(base.options.template.beginAlgo2);
            //base.el.append(base.options.template.icon);
            //base.el.append(base.options.template.title);
            //base.el.append(base.options.template.endAlgo2);
            //base.el.append(base.options.template.beginFullScreen);
            //base.el.append(base.options.template.buttonFullScreen);
            //base.el.append(base.options.template.endFullScreen);

            //base.el.append(base.options.template.endContainer);

            //base.$el.html(base.replace(base.options.template.beginContainer));


            // Put your initialization code here
        };


        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        //
        // };

        /**
         * Replace function
         */
        base.replace = function (string, values) {
            'use strict';
            var key;
            var rE;

            for (key in values) {
                rE = new RegExp("({" + key + "})", "g");
                string = string.replace(rE, values[key]);
            }
            return string;
        };



        // Run initializer
        base.init();
    };
    $.dashboard.itemsTable.defaultOptions = {
        template: {
            beginContainer: '<div class="portlet light ">',
            beginAlgo1: '<div class="portlet-title tabbable-line">',
            beginAlgo2: '<div class="caption">',
            icon: '<i class="{iconClass} {fontClass}"></i>',
            title: '<span class="caption-subject {fontClass} bold uppercase">{title}</span>',
            endAlgo2: '</div>',
            beginFullScreen: '<div class="actions">',
            buttonFullScreen: '<a class="btn btn-circle btn-icon-only btn-default fullscreen" href="#" data-original-title="" title=""> </a>',
            endFullScreen: '</div>',
            beginTabs: '<ul class="nav nav-tabs">',
            tabs: {
                active: '<li class="active"><a href="#tabMyTable2" data-toggle="tab" role="tab" class="active">{tabActive}</a></li>',
                tab: '<li><a href="#myTable2" data-toggle="tab" role="tab">{tab}</a></li>'
            },
            endTabs: '</ul>',
            endAlgo1: '</div>',
            endContainer: '</div>'
        },
        iconClass: "icon-globe",
        fontClass: 'font-green-sharp',
        title: "PRÓXIMOS OBJETIVOS",
        tabs: true,
        fullScreen: true,
        height: "relative"
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