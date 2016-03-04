/**
 * Created by Lorenzo on 23/02/2016.
 *
 * Requires:
 *
 *    Nothing
 *
 * Description: this file contains all globals functions that other plugins can use
 *
 */

'use strict';
(function ($) {

  if (!$.dwecProject) {
    $.dwecProject = {};
  }
  $.dwecProject.gFunctions = {

    /**
     * Print on console.log() with styles
     *
     * Levels:
     *
     *    0: Error       // Red
     *    1: Waring      // Yellow
     *    2: Success     // Green
     *    3: Info        // Blue
     *    other: Info    // Blue
     *
     * Formats:
     *
     *    showMessage(var);                           // Prints a simple var with default color
     *    showMessage(number, var, ..);               // Prints all vars with 1º color
     *    showMessage(number, var, number);           // Prints var and number with 1º color
     *    showMessage(number, var, number, var);      // Prints 1º var with 1º color and 2º var with 2º color
     *    showMessage(number, var, number, var, var); // Prints 1º var with 1º color, 2º var with 2º color, 3º var with 1º color
     *
     * Usage:
     *
     *    base.showMessage = function(){
     *        dwecProject.gFunctions.showMessage("PluginName", arguments);
     *    };
     *
     * @param pluginName
     * @param args[]
     */
    showMessage: function (pluginName, args) {


      function getColor(level) {

        switch (level) {

          // Error
          case 0:
            return 'color: #AA0000;';
          // Waring
          case 1:
            return 'color: #FFEA00;';
          // Success
          case 2:
            return 'color: #004A00;';
          // Info
          case 3:
            return 'color: #000AA0;';

        }
      }

      function print(level, text) {

        switch (level) {

          // Error
          case 0:
            console.exception(text);
            break;
          // Waring
          case 1:
            console.warn(text);
            break;
          // Success
          case 2:
            console.debug('%c' + text, 'color: #004A00;');
            break;
          // Info
          case 3:
            console.info('%c' + text, 'color: #000AA0;');
            break;
          // Object
          case 4:
            console.dir(text);
            break;
        }
      }


      var ini = 0;
      var defaultC = 3;

      try {
        if (dwecProject.gFunctions.isNumber(args[0])) {
          defaultC = args[0];
          ini++;
        }

        console.groupCollapsed('%cdwecProject.' + pluginName + ':', getColor(defaultC));

        if (typeof (args) !== 'object') {
          print(defaultC, args);
        }

        for (; ini < args.length; ini++) {

          if (dwecProject.gFunctions.isNum(args[ini]) && (typeof (args[ini + 1]) !== 'object' || ini === 0)) {
            print(args[ini], args[ini + 1]);
            ini++;
          } else if (typeof (args[ini]) === 'object') {
            print(4, args[ini]);
          } else if (!args[ini]) {
            print(defaultC, 'undefined')
          } else {
            print(defaultC, args[ini]);
          }

        }

      } catch (e) {
        console.exception(e);
      }
      console.groupEnd();
    },

    /**
     * Return a new random name
     * @param name
     * @returns {*}
     */
    getRandomName: function (name) {
      return name + Math.floor(Math.random() * 500000);
    },

    /**
     * Replace {id} by {id: "dwecProject1231"}
     * @param str
     * @param col
     * @returns {XML|string|void|*|{js, css}|{css, less}}
     */
    format: function (str, col) {
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
    }
}
})(window.jQuery);
