/**
 * Created by Lorenzo on 13/03/2016.
 *
 * Description:
 *
 *    - This plugin synchronizes liveTable with draggableChart.
 *
 * Requires:
 *
 *    - jquery.js // http://code.jquery.com/jquery-2.2.1.min.js
 *
 * Examples:
 *
 *    - $.dwecProject.dragAndLiveSync(#draggableChart, #liveTable. {});
 *
 * Default options:
 *
 *    - draggableChart: {                     // DraggableChart options
          trigger: "DraggableChartRefresh",   // The name of the trigger to catch
          eventItemValue: function(event){    // The attribute to equals liveTable attribute
            return event.valueField;
          }
        },

      - liveTable: {                          // LiveTable options
          trigger: "LiveTableRefresh",        // The name of the trigger to catch
          eventItemValue: function(event){    // The attribute to equals draggableChart attribute
            return event.object.itemValue;
          },
          contentItemValue: "data-itemvalue"  // The attribute of DOM
        }
 *
 * Returnaments:
 *
 *    - null
 *
 */
(function ($) {

  if (!$.dwecProject) {
    $.dwecProject = {};
  }

  /**
   * Synchronizes liveTable to draggableChart
   * @param draggableChart
   * @param liveTable
   * @param options
     */
  $.dwecProject.dragAndLiveSync = function (draggableChart, liveTable, options) {

    var base = this;        // Contains the object reference
    base.lastObject = {};   // Contains the values of the last synchronizes

    /**
     * Start the plugin
     */
    base.init = function () {

      // TODO Init plugin
      base.options = $.extend(true, {}, $.dwecProject.dragAndLiveSync.defaultOptions, options); // Replace default options to options
      base.$chart = $(draggableChart);  // Contains the jQuery object to draggableChart
      base.$table = $(liveTable);       // Contains the jQuery object to liveTable


      /**
       * Listen on draggableChart
       */
      base.$chart.on(base.options.draggableChart.trigger, function (event) {

        // TODO DraggableChart listener
        try {

          if (event.col === base.lastObject.col && event.value === base.lastObject.value && base.options.draggableChart.eventItemValue(event) === base.lastObject.itemValue)
            return;

          base.lastObject.col = event.col;
          base.lastObject.value = event.value;
          base.lastObject.itemValue = base.options.draggableChart.eventItemValue(event);

          base.$table.find('td[' + base.options.liveTable.contentItemValue + '="' + base.lastObject.itemValue + '"][data-col="' + base.lastObject.col + '"] input').val(base.lastObject.value);
        }catch (e){
          console.log("DraggableChart listener error");
          console.log(e);
        }
      });

      /**
       * Listen on liveTable
       */
      base.$table.on(base.options.liveTable.trigger, function (event) {

        // TODO LiveTable listener
        try {

          if (event.col === base.lastObject.col && event.value === base.lastObject.value && base.options.liveTable.eventItemValue(event) === base.lastObject.itemValue)
            return;

          base.lastObject.col = event.col;
          base.lastObject.value = event.value;
          base.lastObject.itemValue = base.options.liveTable.eventItemValue(event);

          var chart = base.$chart.getDwecProject_draggableChart();
          var newData = chart.dataRendered();

          newData[base.lastObject.col][base.lastObject.itemValue] = base.lastObject.value;
          chart.dataRendered(newData);
        }catch (e){
          console.log("LiveTable listener error");
          console.log(e);
        }
      });
    };

    // TODO Start the plugin
    base.init();
  };

  /**
   * Contains the default options
   * @type {{draggableChart: {trigger: string, eventItemValue: $.dwecProject.dragAndLiveSync.defaultOptions.draggableChart.eventItemValue}, liveTable: {trigger: string, eventItemValue: $.dwecProject.dragAndLiveSync.defaultOptions.liveTable.eventItemValue, contentItemValue: string}}}
     */
  $.dwecProject.dragAndLiveSync.defaultOptions = {

    // Draggable Chart options
    draggableChart: {
      trigger: "DraggableChartRefresh",   // The name of the trigger to catch
      eventItemValue: function(event){    // The attribute to equals liveTable attribute
        return event.valueField;
      }
    },

    // Live chart options
    liveTable: {
      trigger: "LiveTableRefresh",        // The name of the trigger to catch
      eventItemValue: function(event){    // The attribute to equals draggableChart attribute
        return event.object.itemValue;
      },
      contentItemValue: "data-itemvalue"  // The attribute of DOM
    }
  };
})(window.jQuery);
