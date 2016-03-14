/**
 * Created by Lorenzo on 23/02/2016.
 *
 * Description:
 *
 *    - This plugin extends for amCharts.js and implements draggable options on bullets.
 *
 * Requires:
 *
 *    - jquery.js                 // http://code.jquery.com/jquery-2.2.1.min.js
 *    - dwecProject.gFunctions.js // dwecProject.gFunctions.js
 *    - amcharts.js               // https://www.amcharts.com/lib/3/amcharts.js
 *    - serial.js                 // https://www.amcharts.com/lib/3/serial.js
 *
 * Triggers:
 *
 *    - DraggableChartRefresh:
 *
 *        - Description: It's launched when the rounded values are changed and is different of the last value
 *                     or then mouse up if the element has been dragged.
 *        - Contains:
 *            {
 *               chart,       // Is the amChart object,
 *               object,      // The actual content of dataProvider,
 *               col,         // Col of the chart and is the index of dataProvider array,
 *               valueField,  // The object changed,
 *               value        // The new value
 *            }
 *
 *     - DraggableChartReady:
 *
 *        - Description: It's launched when the table is printed
 *
 *        - Contains:
 *            {
 *              object:     // Plugin returnament
 *            }
 *
 * Examples:
 *
 *    - var data = {"dataProvider":[{"date":"16/02/2016","id":14,"INTENSITY":7,"VOLUME":6},{"date":"16/02/2016","id":15,"INTENSITY":7,"VOLUME":6},{"date":"16/02/2016","id":16,"INTENSITY":7,"VOLUME":6},{"date":"16/02/2016","id":17,"INTENSITY":7,"VOLUME":6}],"graphs":[{"lineColor":"#a312b7","bullet":"round","title":"intensity","valueField":"INTENSITY","type":"smoothedLine"},{"lineColor":"#723945","bullet":"round","title":"volume","valueField":"VOLUME","type":"smoothedLine"}]}
 *
 *    - $('#id').dwecProject_draggableChart(data,{});
 *    - $.dwecProject.draggableChart($('#id'), data, {debugMode: true});
 *
 * Default options:
 *
 *    - 'debugMode': true,        // If is true, yo can see the errors on the console.
 *    - 'maxLevelMessageShow': 3, // Specific the max level to show on the console.
 *    - 'showOneLevel': false,    // If you only want see one level
 *    - 'maxValue': 10,           // Max value than you can drag.
 *    - 'minValue': 0,            // Min value than you can drag.
 *    - 'setAutoOffsets': true,   // You see all positions when you can drag and add the valueOffsets.
 *    - 'valueOffsets': 20,       // Specific the % when yo see on the offsets.
 *    - 'draggable': true,        // Specific if the chart is draggable or not.
 *    - 'triggers': true,         // Triggers enabled or not.
 *    - 'ajaxEnabled': false      // If not exist getData and this is true, get the data of ajaxGet
 *    - 'ajaxGet': "",            // Contains the URL to GET data
 *    - 'ajaxPost': "",           // Contains the URL to POST data
 *    - 'ajaxPut': "",            // Contains the URL to PUT data
 *    - ajaxInvertDataRender()    // Before POST or PUT data, render.
 *    - dataRender()              // Adapt data structure to the plugin
 *    - invertDataRender()        // Transform the dataRendered to original structure
 *
 * Returnaments:
 *
 *    - amChart{}                 // Contains the current amChart object
 *    - data(newData)             // Get or set original data
 *    - dataRendered(newData)     // Get or set data rendered
 *    - options{}                 // Contains reference of plugin options
 *    - post()                    // Call ajaxInvertDataRender() and POST data on the ajaxPost
 *    - put()                     // Call ajaxInvertDataRender() and PUT data on the ajaxPut
 *    - reloadAjax()              // Get data of the ajaxGet, render data and print chart
 *
 * Data Structure:
 *
 *    - The structure is the amCharts, this plugin extends for amCharts.
 *
 */

'use strict';
(function ($) {

  if (!$.dwecProject) {
    $.dwecProject = {};
  }

  /**
   * Initialize plugin
   * @param el: jQuery object.
   * @param getData: data of amChart.
   * @param options: options to override.
   */
  $.dwecProject.draggableChart = function (el, getData, options) {

    // TODO DraggableChart plugin
    var base = this;          // Reference to currrent object
    base.$el = $(el);         // Reference to jquery DOM object
    base.el = el;             // Selector
    base.getData = {};   // Contains the original data
    base.amChartOptions = {}; // Contains the data rendered
    base.fn = {};              // Contains returnament object
    base.$el.data('dwecProject.DraggableChart', base.fn); // Add a reverse reference to the DOM object

    /**
     * Start the project
     */
    base.init = function () {

      // TODO Init
      try {
        base.getData = getData;
        base.options = $.extend(true, {}, $.dwecProject.draggableChart.defaultOptions, options);
        if (!base.$el.attr('id')) {
          base.$el.attr('id', $.dwecProject.gFunctions.getRandomName("dwecProject-Draggable"));
        }
        (base.getData) ? base.initGetData() : base.initAjax();
      } catch (e) {
        base.showMessage(0, 'ERROR base.init()', e);
      }
    };

    /**
     * Get data of the ajaxGet and init plugin
     */
    base.initAjax = function () {

      // TODO Init plugin starting ajax data
      if (!base.options.ajaxEnabled)
        return;

      base.doAjax(base.options.ajaxGet, "GET", null, function (newData) {
        base.getData = newData;
        base.amChartOptions = $.extend(true, {}, $.dwecProject.draggableChart.amChart, base.options.dataRender(newData));
        base.initPlugin();
      });

    };

    /**
     * Init plugin starting getData
     */
    base.initGetData = function () {

      // TODO Init plugin starting getData
      if (!base.getData) {
        return;
      }

      base.amChartOptions = $.extend(true, {}, $.dwecProject.draggableChart.amChart, getData);
      base.initPlugin();
    };

    /**
     * Start the plugin
     */
    base.initPlugin = function () {

      // TODO Init plugin
      if (base.options.chartCursorBallon) {
        base.amChartOptions.chartCursor.categoryBalloonFunction = function (key) {
          return key + " (" + base.amChartOptions.dataProvider[key][base.options.chartCursorBallonShow] + ")";
        };
      }
      base.amChart = window.AmCharts.makeChart(base.$el.attr('id'), base.amChartOptions);
      base.initCustomAfterAmChart();
      base.initListeners();
      base.$el.trigger({
        type: 'DraggableChartReady',
        object: base.fn
      });
    };

    /**
     * Create all plugin listeners
     */
    base.initListeners = function () {

      // TODO Init Listeners
      base.actualGraph = false;         // Contains data of the current graph
      base.amChart.mouseIsDown = false; // Set default value of event


      // TODO Set the variable mouseIsDown to true and disable the efects on charts
      base.$el.mousedown(function () {
        try {
          base.amChart.mouseIsDown = true;
          if (base.actualGraph) {
            base.hideOrShowOnDragable(false);   // Disable vibrating effect
          }
        } catch (e) {
          base.showMessage(0, 'ERROR initListeners()  base.$el.mousedown()', e);
        }
      });

      // TODO Listener mouse up con document and reset actual graph
      $(document).mouseup(function () {
        try {
          base.amChart.mouseIsDown = false;
          if (base.actualGraph) {
            // Reposition the value of chart without 4,1230001239092834082093123
            base.amChart.dataProvider[base.actualGraph.index][base.actualGraph.valueField] = Math.round(base.amChart.dataProvider[base.actualGraph.index][base.actualGraph.valueField]);
            base.hideOrShowOnDragable(true);
            base.amChart.validateData();
            base.actualGraph = false;
          }
        } catch (e) {
          base.showMessage(0, 'ERROR initListeners() $(document).mouseup()', e);
        }
      });

      // TODO Listener if the mouse is move and drag the element
      $(document).mousemove(function () {

        try {

          if (!base.amChart.mouseIsDown) {
            return;
          }

          if (base.amChart.mouseTimeout) {
            clearTimeout(base.amChart.mouseTimeout);
          }

          base.amChart.mouseTimeout = setTimeout(function () {
            base.updatePositionAmChart();   //Call to drag element
          }, 1);

        } catch (e) {
          base.showMessage(0, 'ERROR initListeners() $(document).mousemove()', e);
        }
      });

      // TODO Get graph when the mouse is over graph
      base.amChart.addListener('rollOverGraph', function (event) {

        try {
          if (!base.amChart.mouseIsDown && !base.actualGraph) {
            base.actualGraph = {};
            base.actualGraph.valueField = event.graph.valueField;
            base.actualGraph.index = event.chart.chartCursor.index;
          }
        } catch (e) {
          base.showMessage(0, 'ERROR initListeners() base.amChart.addListener(\'rollOverGraph\')', e);
        }
      });

      // TODO Catch event when the mouse is out the graph
      base.amChart.addListener('rollOutGraph', function () {

        try {
          // If mouse isn't down clear actualGraph
          if (!base.amChart.mouseIsDown) {
            base.actualGraph = false;
          }
        } catch (e) {
          base.showMessage(0, 'ERROR initListeners() base.amChart.addListener(\'rollOutGraph\')', e);
        }
      });


    };

    /**
     * Render amChart options after init base.amChart
     * Show 20% more on the max and min values of chart
     */
    base.initCustomAfterAmChart = function () {

      // TODO Init custom after amChart
      try {
        if (base.options.setAutoOffsets) {
          var percent = base.options.maxValue * (base.options.valueOffsets / 100);

          if (typeof (base.amChart.valueAxes) === 'object' && base.amChart.valueAxes.length === 0) {
            base.amChart.valueAxes = [
              {
                maximum: base.options.maxValue + percent,
                minimum: base.options.minValue - percent
              }
            ];
          } else {
            $.each(base.amChart.valueAxes, function (index, object) {
              object.maximum = base.options.maxValue + percent;
              object.minimum = base.options.minValue - percent;
            });
          }
        }
      } catch (e) {
        base.showMessage(0, 'ERROR initCustomAfterAmChart()', e);
      }
    };

    /**
     * Sets true or false if in draggable mode show or not vibrating effect
     * @param boolean
     */
    base.hideOrShowOnDragable = function (boolean) {

      // TODO Hide or show on dragable
      try {

        if (!base.options.draggable) {
          return;
        }
        base.amChart.chartCursor.categoryBalloonEnabled = boolean;
        base.amChart.chartCursor.valueLineBalloonEnabled = boolean;
        $.each(base.amChart.graphs, function (index, obj) {
          obj.showBalloon = boolean;
        });

        base.amChart.legend.valueFunction = function (obj1, obj2) {
          if (!boolean) {
            return '';
          }
          return obj2;
        };

        base.amChart.validateData();

      } catch (e) {
        base.showMessage(0, 'ERROR hideOrShowOnDragable()', e);
      }
    };

    /**
     * Update point dragged on amChart
     */
    base.updatePositionAmChart = function () {

      // TODO Update Position AmChart
      try {
        if (!base.actualGraph || !base.options.draggable) {
          return;
        }

        // TODO Save the new data changed
        var index = base.actualGraph.index;
        var valueField = base.actualGraph.valueField;
        var value = base.amChart.chartCursor.valueLineAxis.coordinateToValue(base.amChart.chartCursor.vLine.y);
        var valueRounded = Math.round(value);

        // Check if the value exceeds the limit or max value
        if (value > base.options.maxValue || value < base.options.minValue) {
          return;
        }

        // update data
        base.amChart.dataProvider[index][valueField] = value;
        base.amChart.validateData();


        if (!base.actualGraph.value) {
          base.actualGraph.value = valueRounded;
        }


        if (base.options.triggers && base.actualGraph.value && base.actualGraph.value !== valueRounded) {

          // If you not clone the new value, when you change data the actual graph is changed
          var object = $.extend({}, base.amChart.dataProvider[index]);
          object[valueField] = valueRounded;

          // set trigger
          base.$el.trigger({
            type: 'DraggableChartRefresh',
            chart: base.amChart,
            object: object,
            col: index,
            valueField: valueField,
            value: valueRounded
          });
          base.actualGraph.value = valueRounded;
        }

      } catch (e) {
        base.showMessage(0, 'ERROR updatePositionAmChart()', e);
      }
    };

    /**
     * If debug mode is on, show messages on console.
     * @param level
     */
    base.showMessage = function (level) {

      // TODO Show Message
      try {
        if (!base.options.debugMode || arguments[0] > base.options.maxLevelMessageShow || (base.options.showOneLevel && arguments[0] !== base.options.maxLevelMessageShow)) {
          return;
        }

      } catch (e) {
        console.log('%cERROR base.options.debugMode()', 'background: #fff; color: #000', e);
      }

      $.dwecProject.gFunctions.showMessage('draggableChart', arguments);
    };


    // TODO Initialise the plugin
    base.init();


    /**
     * Change or return the dataProvider of the amChart object
     * @param newData
     * @returns {*}
     */
    base.fn.dataRendered = function (newData) {

      // TODO Fn Data, send or change dataProvider
      if (!newData) {
        return base.amChart.dataProvider;
      }

      base.amChart.dataProvider = newData;
      base.amChart.validateData();

    };

    // TODO Returnament
    /**
     * Post data on the base.options.ajaxPost
     */
    base.fn.post = function () {

      // TODO Post prototype
      base.doAjax(base.options.ajaxPost, "POST", base.options.ajaxInvertDataRender(base.getData, base.amChartOptions))
    };

    /**
     * Put data on the base.options.ajaxPut
     */
    base.fn.put = function () {

      // TODO Put prototype
      base.doAjax(base.options.ajaxPut, "PUT", base.options.ajaxInvertDataRender(base.getData, base.amChartOptions))
    };

    /**
     * Reference of options
     */
      // TODO Options prototype
    base.fn.options = base.options;

    /**
     * Contains the amChart object
     * @type {*|{type: string, theme: string, legend: {useGraphSettings: boolean}, valueAxes: *[], chartCursor: {pan: boolean, zoomable: boolean, valueLineEnabled: boolean, valueLineBalloonEnabled: boolean, cursorAlpha: number, valueLineAlpha: number, cursorColor: string}, addClassNames: boolean, categoryField: string}}
     */
    base.fn.amChart = base.amChart;

    /**
     * Get data, print data and set triggers
     */
    base.fn.reloadAjax = function () {

      // TODO Reload ajax prototype
      base.initAjax();
    };

    /**
     * Get or change original data
     * @param newData
     * @returns {*}
     */
    base.fn.data = function (newData) {

      // TODO Data prototype
      if (!newData)
        return base.options.invertDataRender(base.getData, base.amChartOptions);

      base.getData = newData;
      base.initGetData();
    };


    // TODO Returnament
    return base.fn;
  };

  /**
   * Contains the default chart style
   * @type {{type: string, theme: string, legend: {useGraphSettings: boolean}, valueAxes: *[], chartCursor: {pan: boolean, zoomable: boolean, valueLineEnabled: boolean, valueLineBalloonEnabled: boolean, cursorAlpha: number, valueLineAlpha: number, cursorColor: string}, addClassNames: boolean, categoryField: string}}
   */
  $.dwecProject.draggableChart.amChart = {
    'type': 'serial',
    'theme': 'light',
    'legend': {
      'useGraphSettings': true
    },
    'valueAxes': [
      {
        'align': 'center'
      }
    ],
    'chartCursor': {
      'pan': false,
      'zoomable': false,
      'valueLineEnabled': true,
      'valueLineBalloonEnabled': true,
      'cursorAlpha': 0.2,
      'valueLineAlpha': 0.2,
      'cursorColor': '#333'
    },
    'addClassNames': true,
    'categoryField': 'date'
  };

  /**
   * Contains all specific plugin default options
   * @type {{debugMode: boolean, maxLevelMessageShow: number, showOneLevel: boolean, maxValue: number, minValue: number, setAutoOffsets: boolean, valueOffsets: number, draggable: boolean, triggers: boolean}}
   */
  $.dwecProject.draggableChart.defaultOptions = {
    'debugMode': true,        // If is true, yo can see the errors on the console.
    'maxLevelMessageShow': 3, // Specific the max level to show on the console.
    'showOneLevel': false,    // If you only want see one level
    'maxValue': 10,           // Max value than you can drag.
    'minValue': 0,            // Min value than you can drag.
    'setAutoOffsets': true,   // You see all positions when you can drag and add the valueOffsets.
    'valueOffsets': 20,       // Specific the % when yo see on the offsets.
    'draggable': true,        // Specific if the chart is draggable or not.
    'triggers': true,         // Triggers enabled or not.
    'chartCursorBallon': true,// Show or not the chart cursor ballon
    'chartCursorBallonShow': "date", // Specific the attribute to show on chartCursor ballon

    ajaxEnabled: false,        // If this option is available, the data is obtained for the ajaxGet and var getData is ignored
    ajaxGet: "",               // Specific the URL what you get the data
    ajaxPost: "",              // Specific the URL what you post the data
    ajaxPut: "",               // Specific the URL what you put the data

    // On post or put data with ajax
    ajaxInvertDataRender: function (originalData, dataRendered) {
      return this.invertDataRender(originalData, dataRendered);
    },

    // If the data what you received not follow the plugin structure, you can structure the data
    dataRender: function (data) {
      return data;
    },

    // Restructure the data before you get.
    invertDataRender: function (originalData, dataRendered) {
      return originalData;
    }
  };

  /**
   * Create all objects on $('.nameClass').dwecProjectDraggableChart(AmChartOptions,{});
   * @param amChart
   * @param options
   * @returns {*}
   */
  $.fn.dwecProject_draggableChart = function (amChart, options) {
    return this.each(function () {
      $.dwecProject.draggableChart(this, amChart, options);
    });
  };

  /**
   * Return if exist chart of the jQuery object: $('.nameClass').getdwecProjectDraggableChart();
   * @returns {*}
   */
  $.fn.getDwecProject_draggableChart = function () {
    return this.data('dwecProject.DraggableChart');
  };

})(window.jQuery);
