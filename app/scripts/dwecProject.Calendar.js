//Authors Jordi Benejam - Nacho Lopez
//Funcionalidad Calendario
// Cargar eventos API
// Agregar eventos
// Modificar fechas


(function ($) {
  if (!$.Dwec) {
    $.Dwec = {};
  }
  $.Dwec.Calendar = function (el, getData, options) {
    var base = this;
    base.$el = $(el);
    base.el = el;
    base.$bin = null;
    base.$eventBox = null;
    base.$el.data("Dwec.Calendar", base);


    base.init = function () {
      base.getData = getData;
      base.options = $.extend({}, $.Dwec.Calendar.defaultOptions, options);
      base.$el.append("<div class='portlet light portlet-fit bordered calendar'><div class='portlet-title'><div class='caption'><i class='icon-layers font-green'></i><span class='caption-subject font-green sbold uppercase'>Calendar</span></div></div><div class='portlet-body'><div class='row'><div class='col-md-3 col-sm-12'><h3 class='event-form-title margin-bottom-20'>Draggable Events</h3><div class='external-events'><hr/><div class='event_box' class='margin-bottom-10'></div></div></div><div class='col-md-9 col-sm-12'><div class='calendar1' class='has-toolbar'></div></div></div></div></div>");

      base.$eventBox = base.$el.find('.event_box');

      if(document.getElementById('calendarModal') == null){
        $("body").append("<div id='calendarModal' class='modal fade' tabindex='-1' role='dialog'> <div class='modal-dialog'> <div class='modal-content'> <div class='modal-header'> <button type='button' class='close' data-dismiss='modal' aria-label='Closev><span aria-hidden='true'>&times;</span></button> <h4 class='modal-title'>Information</h4> </div> <div class='modal-body'> <p id='content'></p> </div> <div class='modal-footer'> <button id='close' type='button' class='btn btn-default' data-dismiss='modal'>Close</button> <button type='button' id='accept' class='btn btn-primary' data-dismiss='modal'>Save changes</button> </div> </div></div></div>");
      }
      base.renderBin();
      base.renderCalendar();

    };

    /**
     * Generic method to petition/update events in Server
     * @param url
     * @param method
     * @param sendData
     * @param fOnSuccessCallback
     * @param fOnErrorCallback
     */
    base.doAjax = function (url, method, sendData, fOnSuccessCallback, fOnErrorCallback) {
      var callBackFunctions = {
        200: function (response) {
          console.log("Codigo 200 respuesta");
          console.log(response);
          fOnSuccessCallback(response);
        },
        201: function (response) {
          console.log("Codigo 201 respuesta");
          console.log(response);
          fOnSuccessCallback(response);
        },
        204: function (response) {
          console.log("Codigo 204 respuesta");
          console.log(response);
          fOnSuccessCallback();
        },
        400: function (response) {
          console.log("Codigo 400 respuesta");
          console.log(response);
          fOnErrorCallback();
        },
        404: function (response) {
          console.log("Codigo 404 respuesta");
          console.log(response);
          fOnErrorCallback();
        },
        500: function (response) {
          console.log("Codigo 500 respuesta");
          console.log(response);
          fOnErrorCallback();
        }
      };
      $.ajax({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        url: url,
        method: method,
        dataType: 'json',
        data: JSON.stringify(sendData),
        statusCode: callBackFunctions
      });
    };

    /**
     * Adds functionality to drag generic events(Outside calendar) and drop them inside calendar.
     */
    base.addOnDragOverDays = function () {

      // fc-day-number alternative selector
      base.$el.find('.fc-day').each(function (key, value) {
        var $element = $(this);

        $element.on("dragover", function (event) {
          event.preventDefault();
          event.stopPropagation();
          this.style.backgroundColor = 'rgba(50,197,210,0.3)';
        });

        $element.on("dragleave", function (event) {
          event.preventDefault();
          event.stopPropagation();
          this.style.backgroundColor = 'rgba(255,255,255,1)';
        });

        $element.on("drop", function (event) {
          // TODO dani funcion drop
          event.preventDefault();
          event.stopPropagation();
          console.log(event.originalEvent.dataTransfer);
          var color = event.originalEvent.dataTransfer.getData('colorGeneric');
          var tipoEvento = event.originalEvent.dataTransfer.getData('tipoEvento');
          this.style.backgroundColor = 'rgba(255,255,255,1)';
          var fechaStart = this.getAttribute('data-date') + "T12:01:00";
          var fechaEnd = this.getAttribute('data-date') + "T13:01:00";
          var url = base.options.urlAdd;
          var sendData = {
            "name": "Evento " + tipoEvento,
            "description": "Descripcion del Evento",
            "startDate": fechaStart,
            "endDate": fechaEnd,
            "eventType": "SESSION", //TODO coger de options
            "status": "NOT_DEFINED", // TODO coger de options o de la informacion del propio generico que arrastro
            "eventGroup": {"id": event.originalEvent.dataTransfer.getData('idGeneric')},
            "content": {
              "data": [{"label": "Prueba", "note": "Loren ipsum"}, {"label": "Prueba", "note": "Loren ipsum"}]
            },
            "configuration": {
              "data": [{
                "conceptType": "INTENSITY",
                "value": 8,
                "label": "Prueba",
                "note": "Loren ipsum"
              }, {"conceptType": "VOLUME", "value": 8, "label": "Prueba", "note": "Loren ipsum"}]
            }
          };

          var fOnSuccessCallback = function fOnSuccessCallback(response) {

            var myEvent = {
              id: response.id,
              title: "Evento " + tipoEvento,
              start: fechaStart,
              end: fechaEnd, //"2016-02-03T12:01:00"
              color: color
            };
            base.$el.find('.calendar1').fullCalendar('renderEvent', myEvent);
            toastr.success("Evento añadido", "Evento dia " + myEvent.start);
          };
          base.doAjax(url, 'POST', sendData, fOnSuccessCallback, base.options.connectionFail);
        });
      });
    };

    /**
     * Renders the bin
     */
    base.renderBin = function () {
      var bin = '<div class="col-md-12" style="padding-bottom:10px; padding-left:0px ;text-align:left;display:flex;align-items:center;margin-bottom: 20px; border-bottom: 1px solid #e5e5e5 ;"><a href="javascript:;" class="event_add btn green"> Add Event </a><span class="bin glyphicon glyphicon-trash" style="color:#BBDEFB;font-size:3em;"></span></div>';
      base.$el.find('.external-events').prepend(bin);
      base.$bin = base.$el.find('.bin');

      base.$bin.on("dragover", function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.style.color = base.options.bin;
      });

      base.$bin.on("dragleave", function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.style.color = '#BBDEFB';
      });
      base.$bin.on("drop", function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.style.color = '#BBDEFB';
      });
    };

    /**
     * Checks if the event is inside or outside the calendar.
     * @param x
     * @param y
     * @returns {boolean}
     */
    base.isEventOverDiv = function (x, y) {
      var offset = base.$bin.offset();
      offset.right = base.$bin.width() + offset.left;
      offset.bottom = base.$bin.height() + offset.top;
      console.log(offset);
      console.log(offset.top);
      console.log(offset.right);
      console.log(offset.bottom);
      // Compare
      if (x >= offset.left && x <= offset.right) {
        return true;
      }
      return false;
    };

    /**
     * Render the genericEvent outside the calendar.
     * Adds functionality to drag them inside calendar.
     * @param genericEvent
     */
    base.renderGenericEvents = function (genericEvent) {
      var divEvents = '<div style="position: relative;" class="{classes}" {attr} draggable="true">{name}</div>';
      var classes = 'external-event label label-default ui-draggable ui-draggable-handle';

      var onDragStart = function onDragStart(event) {
        console.log(event);
        event.originalEvent.dataTransfer.setData('tipoEvento', event.currentTarget.innerHTML);
        event.originalEvent.dataTransfer.setData('idGeneric', event.currentTarget.attributes[2].nodeValue);
        event.originalEvent.dataTransfer.setData('colorGeneric', event.currentTarget.style.backgroundColor);
      };

      base.$eventBox.append($(divEvents.replace("{classes}", classes)
        .replace("{attr}", "data-id='" + genericEvent.eventGroup.id + "'")
        .replace("{name}", genericEvent.name))
        .on('dragstart', onDragStart)
        .css("background-color", genericEvent.content.data[0].value));


    };

    /**
     * Changes the day of an event.
     * @param event
     * @param revertFunc
     * @param info
     * @param success
     * @param error
     */
    base.changeDay = function (event, revertFunc, info, success, error) {

      base.$calendarModal = $('#calendarModal');

      base.$calendarModal.find("#content").text(info);
      base.$calendarModal.find("#accept").on("click", function () {
        var url = base.options.urlEdit + event.id;
        var sendData = {
          id: event.id,
          "startDate": event.start,
          "endDate": event.end,
          "eventType": "SESSION"
        };

        var fOnSuccessCallback = function fOnSuccessCallback(id) {
          toastr.success(success.title, success.description);
        };
        var fOnErrorCallback = function fOnErrorCallback() {
          revertFunc();
          toastr.error(error.title, error.description);
        };

        base.doAjax(url, 'PUT', sendData, fOnSuccessCallback, fOnErrorCallback);
      });
      base.$calendarModal.find("#close").on("click", function () {
        revertFunc();
      });

      base.$calendarModal.modal('show');
    };

    /**
     * Initialize the main calendar with custom setup.
     */
    base.renderCalendar = function () {

      //TODO todos los mensajes en options -> i18n


      base.$el.find('.calendar1').fullCalendar({
        firstDay: 1,
        droppable: true,
        editable: true,
        startEditable: true,
        header: {
          left: 'title', center: 'month,agendaWeek', right: 'today prev,next'
        },
        eventLimit: true,
        viewRender: function viewRender() {
          base.addOnDragOverDays();
        },
        eventDrop: function eventDrop(event, delta, revertFunc) {
          console.log(event);

          var info = event.title + " was dropped on " + event.start.format();
          var success = {title: "Evento modificado", description: "Evento dia " + event.start.format()};
          var error = {title: "Ups!", description: "No podemos conectar..."};
          base.changeDay(event, revertFunc, info, success, error);
        },
        eventResize: function eventResize(event, delta, revertFunc) {
          var info = event.title + " end is now " + event.end.format();
          var success = {
            title: "Evento modificado",
            description: "Evento dia " + event.start.format() + " hasta " + event.end.format()
          };
          var error = {title: "Ups!", description: "No podemos conectar..."};

          base.changeDay(event, revertFunc, info, success, error);
        },
        eventDragStop: function eventDragStop(event, jsEvent, ui, view) {
          console.log("X -> " + jsEvent.clientX);
          console.log("Y -> " + jsEvent.clientY);
          if (base.isEventOverDiv(jsEvent.clientX, jsEvent.clientY)) {
            base.$el.find('.calendar1').fullCalendar('removeEvents', event._id);
            var fOnSuccessCallback = function (id) {
              toastr.success("Evento " + event.title, "Eliminado");
            };
            var fOnErrorCallback = function () {
              toastr.error("Evento " + event.title, "Error al eliminar");
            };

            base.doAjax(base.options.urlDel + event._id, 'DELETE', "", fOnSuccessCallback, fOnErrorCallback);
          }
        },
        events: function events(start, end, timezone, callback) {
          var fOnSuccessCallback = function fOnSuccessCallback(doc) {
            var events = [];
            for (var item in doc) {
              var currentEventType = doc[item]["eventType"]["itemLabel"];
              if (currentEventType === "generic") {
                base.renderGenericEvents(doc[item]);
              } else if (true){ //TODO datafilters-> shown base.options.datafilter.shown.indexOf(currentEvenType) >= 0
                // TODO aplicar config
                if (doc[item]['startDate'] != null) {
                  events.push({
                    id: doc[item]['id'],
                    title: doc[item]['name'],
                    start: doc[item]['startDate'],
                    end: doc[item]['endDate'],
                    allDay: true
                  });
                }
              }
            }
            callback(events);
          };
          base.doAjax(base.options.urlGet, "GET", null, fOnSuccessCallback, base.options.connectionFail);
        },
        eventColor: '#32c5d2'
      });
    };

    base.init();
  };
  $.Dwec.Calendar.defaultOptions = {
    // TODO cambiar nombres urls
    html: true,
    dataFilters:{
      model:"generic",
      shown:"session,microcicle"
    },

    urlEdit: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/set/",
    urlGet: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/",
    urlAdd: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/add/",
    urlDel: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/clear/",
    onDropEventType: "",
    urlEventsTypes: "http://tomcat7-mycoachgate.rhcloud.com/rest/eventGroup/get/",
    post: "",
    msgError: "Content not found",
    eventsJson: {},
    connectionFail: function connectionFail() {
      toastr.error("Ups!", "No podemos conectar...");
    },
    editOnSuccess: function editOnSuccess() {
    },
    editOnFail: function editOnFail() {
    },
    addOnSuccess: function addOnSuccess() {
    },
    addOnFail: function addOnFail() {
    },
    deleteOnSuccess: function deleteOnSuccess() {
    },
    deleteOnFail: function deleteOnFail() {
    }
  };
  $.fn.Dwec_Calendar = function (getData, options) {
    return this.each(function () {
      new $.Dwec.Calendar(this, getData, options);
    });
  };

  $.fn.getDwec_Calendar = function () {
    this.data("Dwec.Calendar");
  };
  $.fn.getCalendar = function () {
    return base.$el;
  };
})(jQuery);
