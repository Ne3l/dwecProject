/**
 * Created by Lorenzo on 04/03/2016.
 *
 * Description:
 *
 *    - This plugin generate a simple table.
 *
 * Requires:
 *
 *    - jquery.js                 // http://code.jquery.com/jquery-2.2.1.min.js
 *    - dwecProject.gFunctions.js // dwecProject.gFunctions.js
 *
 * Triggers:
 *
 *    - LiveTableRefresh:
 *
 *        - Description: It's launched when the cell value is changed
 *
 *        - Contains:
 *            {
 *              row:        // Current row of table
 *              col:        // Current col of table
 *              dataValue:  // Atribute to contains the value (base.options.dataValue)
 *              value:      // The new value
 *              object:     // Object of the current cell
 *            }
 *
 *     - LiveTableReady:
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
 *    - var data = [[{"value":5,"itemLabel":"12/05/2016"},{"value":6,"itemLabel":"12/05/2016"},{"value":7,"itemLabel":"12/05/2016"},{"value":8,"itemLabel":"12/05/2016"},{"value":9,"itemLabel":"12/05/2016"},{"value":10,"itemLabel":"12/05/2016"},{"value":11,"itemLabel":"12/05/2016"},{"value":12,"itemLabel":"12/05/2016"}],[{"micropos":5,"value":100,"itemValue":"INTENSITY","itemLabel":"intensity"},{"micropos":6,"value":8,"itemValue":"INTENSITY","itemLabel":"intensity"},{"micropos":7,"value":8,"itemValue":"INTENSITY","itemLabel":"intensity"},{"micropos":8,"value":8,"itemValue":"INTENSITY","itemLabel":"intensity"},{"micropos":9,"value":8,"itemValue":"INTENSITY","itemLabel":"intensity"},{"micropos":10,"value":8,"itemValue":"INTENSITY","itemLabel":"intensity"},{"micropos":11,"value":8,"itemValue":"INTENSITY","itemLabel":"intensity"},{"micropos":12,"value":8,"itemValue":"INTENSITY","itemLabel":"intensity"}],[{"micropos":5,"value":8,"itemValue":"VOLUME","itemLabel":"volume"},{"micropos":6,"value":8,"itemValue":"VOLUME","itemLabel":"volume"},{"micropos":7,"value":8,"itemValue":"VOLUME","itemLabel":"volume"},{"micropos":8,"value":8,"itemValue":"VOLUME","itemLabel":"volume"},{"micropos":9,"value":8,"itemValue":"VOLUME","itemLabel":"volume"},{"micropos":10,"value":8,"itemValue":"VOLUME","itemLabel":"volume"},{"micropos":11,"value":8,"itemValue":"VOLUME","itemLabel":"volume"},{"micropos":12,"value":8,"itemValue":"VOLUME","itemLabel":"volume"}],[]]
 *
 *    - $('#id').dwecProject_liveTable(data,{});
 *    - $.dwecProject.liveTable($('#id'), data, {debugMode: true});
 *
 * Default options:
 *
 *    - 'debugMode': true,        // If is true, yo can see the errors on the console.
 *    - 'maxLevelMessageShow': 3, // Specific the max level to show on the console.
 *    - 'showOneLevel': false,    // If you only want see one level
 *    - 'table':                  // Contains the structure of the table
 *    - tr(nRow, row, content)    // Render the tr
 *    - rd(nRow, nCol, value, object, maxVal, minVal) // Render the td
 *    - th(nRow, nCol, value, object, maxVal, minVal) // Render the th
 *    - 'dataValue': value        // The attribute of the object cell to contains the value
 *    - 'maxValue': 10,           // Max value than you can drag.
 *    - 'minValue': 0,            // Min value than you can drag.
 *    - 'syncData': true,         // On change the data of table, also change data rendered
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
 *    - data(newData)             // Get or set original data
 *    - dataRendered(newData)     // Get or set data rendered
 *    - options{}                 // Contains reference of plugin options
 *    - post()                    // Call ajaxInvertDataRender() and POST data on the ajaxPost
 *    - put()                     // Call ajaxInvertDataRender() and PUT data on the ajaxPut
 *    - reloadAjax()              // Get data of the ajaxGet, render data and print chart
 *
 * Data Structure:
 *
 *    [
 *      [{Col},{Col}], // Row
 *      [{Col},{Col}]  // Row
 *    ]
 *
 */

'use strict';
(function ($) {
  if (!$.dwecProject) {
    $.dwecProject = {};
  }

  /**
   * Create a simple table
   * @param el
   * @param getData
   * @param options
   * @returns {{}|*}
     */
  $.dwecProject.liveTable = function (el, getData, options) {

    // TODO LiveTable plugin
    var base = this;          // Reference to currrent object
    base.$el = $(el);         // Reference to jquery DOM object
    base.el = el;             // Selector
    base.getData = {};        // Contains the original data
    base.dataRendered = {};   // Contains the data rendered
    base.fn = {};             // Contains returnament object
    base.$el.data('dwecProject.DraggableChart', base.fn); // Add a reverse reference to the DOM object

    /**
     * Prepare before data
     */
    base.init = function () {

      // TODO Init plugin
      base.getData = getData;
      base.options = $.extend({}, $.dwecProject.liveTable.defaultOptions, options);
      base.doAjax = $.dwecProject.gFunctions.doAjax.bind();
      (getData)? base.initGetData() : base.initAjax();
    };

    /**
     * Init plugin for getData
     */
    base.initGetData = function () {

      // TODO Init plugin starting getData
      if (!base.getData) {
        return;
      }

      base.dataRendered = base.options.dataRender(base.getData);
      base.insertContent();
    };

    /**
     * Print table for ajax data
     */
    base.initAjax = function () {

      // TODO Init plugin starting ajax data
      if (!base.options.ajaxEnabled)
        return;

      base.doAjax(base.options.ajaxGet, "GET", null, function (newData) {
        base.getData = newData;
        base.dataRendered = base.options.dataRender(newData);
        base.insertContent();
      });
    };

    /**
     * Print data on $el
     */
    base.insertContent = function () {

      // TODO Insert content on $el
      var options = base.options; // Reference
      var dataTr = "";            // Variable declaration
      var content = "";           // Contains all tr of tbody
      var thead = "";             // Contains all th of thead

      try {
        $.each(base.dataRendered, function (nRow, row) {
          dataTr = "";
          $.each(row, function (nCol, object) {
            if (nRow == 0)
              thead += options.th(nRow, nCol, object[options.dataValue], object, options.maxValue, options.minValue);
            else
              dataTr += options.td(nRow, nCol, object[options.dataValue], object, options.maxValue, options.minValue);
          });
          content += options.tr(nRow, row, dataTr);
        });

        // Insert table
        base.$el.html($.dwecProject.gFunctions.format(options.table, {
          id: "lievTable" + $.dwecProject.gFunctions.getRandomName(),
          content: content,
          thead: options.tr(0, base.dataRendered[0], thead)
        }));

        // If the tooltips aren't initialize
        $('[data-toggle="tooltip"]').tooltip();
        base.syncData();

        base.$el.trigger({
          type: 'LiveTableReady',
          object: base.fn
        });

      } catch (e) {
        base.showMessage(0, e);
      }

    };

    /**
     * Synchronizes DOM table with data and send trigger.
     */
    base.syncData = function () {

      // TODO SyncData
      // Detect and process changes
      base.$el.find('td').change(function () {

        try {
          var row = $(this).attr("data-row");
          var col = $(this).attr("data-col");
          var val = $(this).find('input[type="number"]').val();

          if (row !== undefined && col !== undefined) {

            if (base.options.syncData) {
              base.dataRendered[row][col][base.options.dataValue] = val; // Refresh Value
            }

            if (base.options.triggers) {

              // set trigger
              base.$el.trigger({
                type: 'LiveTableRefresh',
                row: row,
                col: col,
                dataValue: base.options.dataValue,
                value: val,
                object: base.dataRendered[row][col]
              });
            }
          }
        } catch (e) {
          base.showMessage(0, e);
        }
      });
    };

    /**
     * If debug mode is on, show messages on console.
     * @param level
     */
    base.showMessage = function (level) {

      // TODO Show message on debug mode
      try {
        if (!base.options.debugMode || arguments[0] > base.options.maxLevelMessageShow || (base.options.showOneLevel && arguments[0] !== base.options.maxLevelMessageShow)) {
          return;
        }

      } catch (e) {
        console.log('%cERROR base.options.debugMode()', 'background: #fff; color: #000', e);
      }

      $.dwecProject.gFunctions.showMessage("liveTable", arguments);
    };


    // TODO Start plugin
    base.init();


    // TODO Returnament
    /**
     * Post data on the base.options.ajaxPost
     */
    base.fn.post = function () {

      // TODO Post prototype
      base.doAjax(base.options.ajaxPost, "POST", base.options.ajaxInvertDataRender(base.getData, base.dataRendered))
    };

    /**
     * Put data on the base.options.ajaxPut
     */
    base.fn.put = function () {

      // TODO Put prototype
      base.doAjax(base.options.ajaxPut, "PUT", base.options.ajaxInvertDataRender(base.getData, base.dataRendered))
    };

    /**
     * Reference of options
     */
      // TODO Options prototype
    base.fn.options = base.options;

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
        return base.options.invertDataRender(base.getData, base.dataRendered);

      base.getData = newData;
      base.initGetData();
    };

    /**
     * Get or change data rendered
     * @param newData
     * @returns {*}
     */
    base.fn.dataRendered = function (newData) {

      // TODO Data render prototype
      if (!newData)
        return base.dataRendered;

      base.dataRendered = newData;
      base.insertContent();
      base.syncData();
    };


    // TODO Returnament
    return base.fn;
  };

  /**
   * Contains all default options of the plugin
   * @type {{debugMode: boolean, maxLevelMessageShow: number, showOneLevel: boolean, table: string, tr: $.dwecProject.liveTable.defaultOptions.tr, td: $.dwecProject.liveTable.defaultOptions.td, th: $.dwecProject.liveTable.defaultOptions.th, dataValue: string, maxValue: number, minValue: number, syncData: boolean, triggers: boolean, ajaxEnabled: boolean, ajaxGet: string, ajaxPost: undefined, ajaxPut: undefined, ajaxInvertDataRender: $.dwecProject.liveTable.defaultOptions.ajaxInvertDataRender, dataRender: $.dwecProject.liveTable.defaultOptions.dataRender, invertDataRender: $.dwecProject.liveTable.defaultOptions.invertDataRender}}
   */
  $.dwecProject.liveTable.defaultOptions = {

    // TODO Default options
    debugMode: true,       // If is true, yo can see the errors on the console.
    maxLevelMessageShow: 3, // Specific the max level to show on the console.
    showOneLevel: false,    // If you only want see one level

    // Contains the table structure
    table: '<table id="{id}" class="table table-striped"><thead>{thead}</thead><tbody>{content}</tbody></table>',
    // Tr render
    tr: function (nRow, row, content) {
      return $.dwecProject.gFunctions.format("<tr>{content}</tr>", {
        content: content
      });
    },
    // Td render, if you want syncData and triggers, the nRow and nCol is required
    td: function (nRow, nCol, value, object, maxVal, minVal) {

      return $.dwecProject.gFunctions.format("<td data-row='{nRow}' data-col='{nCol}' data-itemvalue='{itemValue}' data-toggle='tooltip' data-container='body' data-placement='top' data-trigger='hover' data-html='true' data-title='<b>{itemLabel}</b>' style='text-align: center; padding: 0;'><input type='number' max='{maxVal}' min='{minVal}' value='{value}' style='max-width: 42px'></td>", {
        nRow: nRow,
        nCol: nCol,
        itemValue: object.itemValue,
        itemLabel: object.itemLabel,
        maxVal: maxVal,
        minVal: minVal,
        value: value
      });

    },
    // Th render
    th: function (nRow, nCol, value, object, maxVal, minVal) {

      return $.dwecProject.gFunctions.format("<th data-toggle='tooltip' data-container='body' data-placement='top' data-html='true' data-trigger='hover' data-title='<b>{itemLabel}</b>' style='text-align: center'>{value}</th>", {
        itemLabel: object.itemLabel,
        value: value
      });

    },

    dataValue: "value", // Specific where is the attribute what contains the value when you see
    maxValue: 10,       // Max value on input
    minValue: 0,        // Min value on input


    syncData: true,     // If this option is available, when you change the input value the data is changed
    triggers: true,     // On data changed set the trigger


    ajaxEnabled: false,  // If this option is available, the data is obtained for the ajaxGet and var getData is ignored
    ajaxGet:  "",        // Specific the URL what you get the data
    ajaxPost: "",        // Specific the URL what you post the data
    ajaxPut:  "",        // Specific the URL what you put the data


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
   * Instance plugin with jQuery selection
   * @param getData
   * @param options
   * @returns {*}
   */
  $.fn.dwecProject_liveTable = function (getData, options) {
    return this.each(function () {
      (new $.dwecProject.liveTable(this, getData, options));
    });
  };

  /**
   * Get plugin of the actual jQuery selection
   * @returns {*}
   */
  $.fn.getDwecProject_liveTable = function () {
    return this.data("dwecProject.liveTable");
  };
})(jQuery);
