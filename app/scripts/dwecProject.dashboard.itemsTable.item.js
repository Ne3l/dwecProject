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
(function ($) {

  if (!$.itemsTable) {
    $.itemsTable = {};
  }

  /**
   * Function called when the plugin is invoked
   * @param el: string with query value for jquery  [..]
   * @param getData
   * @param options
   * @constructor
   */
  $.itemsTable.item = function (el, getData, options) {
    // To avoid scope issues, use 'base' instead of 'this'
    // to reference this class from internal events and functions.
    var base = this;
    // Access to jQuery and DOM versions of element
    base.$el = $(el);
    base.el = el;
    // Add a reverse reference to the DOM object
    base.$el.data("itemsTable.item", base);
    base.init = function () {
      base.getData = getData;
      base.options = $.extend({}, $.itemsTable.item.defaultOptions, options);
      //Render the item if the event is after the actual time (maybe temporary)
      //if (moment(base.getData.startDate).diff(moment()) > 0) { //With options: + && previous == false
        base.render();
        base.addListeners();
      //} // else if (moment(base.getData.startDate).diff(moment()) < 0 && previous) { base.render(); base.addListeners(); }
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
      $('.feeds').append(content);
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
    base.addListeners = function() {
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
  $.itemsTable.item.defaultOptions = {
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
  $.fn.itemsTable_item  = function (getData, options) {
    return this.each(function () {
      (new $.itemsTable.item(this, getData, options));
    });
  };

  /**
   *  This function breaks the chain, but returns the tabs.item if it has been attached to the object.
   */
  $.fn.getItemsTable_item = function () {
    this.data("itemsTable.item");
  };

})(jQuery);
