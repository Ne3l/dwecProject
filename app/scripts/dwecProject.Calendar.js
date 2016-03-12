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
    base.$calendar = null;
    base.$el.data("Dwec.Calendar", base);
    base.borrar = false;


    base.init = function () {
      base.getData = getData;
      base.options = $.extend({}, $.Dwec.Calendar.defaultOptions, options);
      base.$el.append(base.options.estructureWrapersCalendar.replace("{externalEventsTitle}", base.options.externalEventsTitle));
      base.$el.css("margin-bottom", "7em");
      base.$eventBox = base.$el.find('.event_box');
      base.$calendar = base.$el.find('.calendar1');

      if (document.getElementById('calendarModal') == null) {
        $("body").append("<div id='calendarModal' class='modal fade' tabindex='-1' role='dialog'> <div class='modal-dialog'> <div class='modal-content'> <div class='modal-header'> <button type='button' class='close' data-dismiss='modal' aria-label='Closev><span aria-hidden='true'>&times;</span></button> <h4 class='modal-title'>Information</h4> </div> <div class='modal-body'> <p id='content'></p> </div> <div class='modal-footer'> <button id='close' type='button' class='btn btn-default' data-dismiss='modal'>Close</button> <button type='button' id='accept' class='btn btn-primary' data-dismiss='modal'>Save changes</button> </div> </div></div></div>");
        base.$calendarModal = $('#calendarModal');
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
        405: function (response) {
          console.log("Codigo 405 respuesta");
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
        data: (sendData) ? JSON.stringify(sendData) : "",
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
          event.preventDefault();
          event.stopPropagation();
          this.style.backgroundColor = 'rgba(255,255,255,1)';
          if (base.el.id == event.originalEvent.dataTransfer.getData('Padre')) {
            var color = event.originalEvent.dataTransfer.getData('colorGeneric');
            var tipoEvento = event.originalEvent.dataTransfer.getData('tipoEvento');
            var fechaStart = this.getAttribute('data-date');
            var fechaEnd = this.getAttribute('data-date');
            var url = base.options.dataUrls.host + base.options.dataUrls.addEvents; //base.options.urlAdd;

            //Data to be passed with filled information
            var baseData = {
              "name": tipoEvento,
              "description": null,
              "startDate": fechaStart,
              "endDate": fechaEnd,
              "eventType": null,
              "status": null,
              "eventGroup": event.originalEvent.dataTransfer.getData('idGeneric'),
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

            //Callback function on saved form
            var onSave = function(data) {
              var sendData = {
                "name": data.name,
                "description": data.description,
                "startDate": data.startDate,
                "endDate": data.endDate,
                "eventType": data.eventType,
                "status": data.status,
                "eventGroup": {"id": data.eventGroup},
                "content": {
                  "data": []
                },
                "configuration": {
                  "data": []
                }
              };
              base.doAjax(url, 'POST', sendData, fOnSuccessCallback, fOnErrorCallback);
            };

            var onRendered = function(data) {
              console.log(data);
            };

            //Call to Form plugin with desired data
            new jQuery.DwecProject.Form(jQuery("#form"), null, {
              wrapperType: 'modal',
              wrapperTitle: "Modal Example",
              onFinishRender: onRendered,
              onSaveFunction: onSave,
              extraData: baseData,
              toastAdvice: true,
              fieldRedAdvice: true,
              buttonHidden: false,
              readOnly: false
            });

            var fOnSuccessCallback = function fOnSuccessCallback(response) {
              var myEvent = {
                id: response.id,
                title: response.name,
                start: response.startDate,
                end: response.endDate, //"2016-02-03T12:01:00"
                color: color,
                allDay: base.allDay(response.startDate, response.endDate)
              };
              base.$calendar.fullCalendar('renderEvent', myEvent);
              toastr.success(myEvent.title, base.options.messages.addEvents.success);
            };

            var fOnErrorCallback = function fOnErrorCallback() {
              toastr.error("Ups!", base.options.messages.addEvents.error);
            };

          }
        });
      });
    };

    /**
     * Renders the bin
     */
    base.renderBin = function () {
      var bin = '<div class="col-md-12" style="padding-bottom:10px; padding-left:0px ;text-align:left;display:flex;align-items:center;margin-bottom: 20px; border-bottom: 1px solid #e5e5e5 ;"><a href="javascript:;" class="event_add btn green">'+base.options.nameButtonAdd+'</a><div class="binWrapper" style="height:auto"><span class="bin glyphicon glyphicon-trash" style="font-size:30px; z-index: 20000;"></span></div></div>';
      base.$el.find('.external-events').prepend(bin);
      base.$bin = base.$el.find('.binWrapper');
      base.$bin.css("color","#BBDEFB");
      base.$bin.css("display", "flex");
      base.$bin.css("align-items", "center");

      base.$bin.mouseenter(function() {
        base.$bin.css("color","red ");
        base.borrar = true;
      });

      base.$bin.mouseleave(function() {
        base.$bin.css("color","#BBDEFB");
        base.borrar = false;
      });

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
        event.originalEvent.dataTransfer.setData('Padre', base.el.id);
        event.originalEvent.dataTransfer.setData('tipoEvento', event.currentTarget.innerHTML);
        event.originalEvent.dataTransfer.setData('idGeneric', event.currentTarget.attributes[2].nodeValue);
        event.originalEvent.dataTransfer.setData('colorGeneric', event.currentTarget.style.backgroundColor);
        event.originalEvent.dataTransfer.setData('event', event.currentTarget);
      };


      base.$eventBox.append($(divEvents.replace("{classes}", classes)
        .replace("{attr}", "data-id='" + genericEvent.eventGroup.id + "'")
        .replace("{name}", genericEvent.name))
        .on('dragstart', onDragStart)
        .attr("id", genericEvent.id));

    };

    /**
     * Changes the day of an event.
     * @param event
     * @param revertFunc
     * @param info
     * @param success
     * @param error
     */
    base.changeDay = function (event, revertFunc, success, error) {
      var url = base.options.dataUrls.host + base.options.dataUrls.editEvent + event.id;
      var sendData = {
        id: event.id,
        "startDate": event.start,
        "endDate": event.end,
        "eventType": "SESSION",
        allDay: base.allDay(moment(event.start).format(), moment(event.end).format())
      };

      var fOnSuccessCallback = function fOnSuccessCallback(id) {
        toastr.success(success.title, success.description);
      };
      var fOnErrorCallback = function fOnErrorCallback() {
        revertFunc();
        toastr.error(error.title, error.description);
      };

      base.doAjax(url, 'PUT', sendData, fOnSuccessCallback, fOnErrorCallback);
    };

    base.removeEvent = function (event) {
      base.$calendar.find("#" + event.id).hide();
      base.$calendarModal.find("#modal-title").text(event.title);
      base.$calendarModal.find("#content").text(base.options.messages.delEvents.modal);

      //reset onClick function
      base.$calendarModal.find("#accept").unbind("click");
      base.$calendarModal.find("#close").unbind("click");

      base.$calendarModal.find("#close").on("click", function () {
        base.$calendar.find("#" + event.id).show()
      });

      base.$calendarModal.find("#accept").on("click", function () {

        var fOnSuccessCallback = function (id) {
          base.$calendar.fullCalendar('removeEvents', event._id);
          toastr.success(event.title, base.options.messages.delEvents.success);
        };
        var fOnErrorCallback = function () {
          toastr.error(event.title, base.options.messages.delEvents.error);
        };

        base.doAjax(base.options.dataUrls.host + base.options.dataUrls.delEvents + event._id, 'DELETE', "", fOnSuccessCallback, fOnErrorCallback);
      });
      base.$calendarModal.modal('show');
    };

    base.allDay = function (start, end) {
      return (moment(end).diff(moment(start), 'hours') >= base.options.allDay);
    };

    /**
     * Add a new event (through the Form plugin).
     */
    base.addEvent = function () {
      base.$addEventBtn = base.$el.find('.event_add');
      base.$addEventBtn.on("click", function(event) {
        event.preventDefault();
        event.stopPropagation();

        //Extra data to be passed (required by the Form plugin)
        var eventGrp = {
          "eventGroup": {"id": 32},
          "content": {"data": []},
          "configuration": {"data": []}
        };

        //Callback function on saved form
        var onSave = function(data) {
          var sendData = {
            "name": data.name,
            "description": data.description,
            "startDate": data.startDate,
            "endDate": data.endDate,
            "eventType": data.eventType,
            "status": data.status,
            "eventGroup": {"id": data.eventGroup},
            "content": {
              "data": []
            },
            "configuration": {
              "data": []
            }
          };
          var url = base.options.dataUrls.host + base.options.dataUrls.addEvents;
          base.doAjax(url, 'POST', sendData, fOnSuccessCallback, fOnErrorCallback);
        };

        var onRendered = function(data) {
          console.log(data);
        };

        //Call to Form plugin with desired data
        new jQuery.DwecProject.Form(jQuery("#form"), null, {
          wrapperType: 'modal',
          wrapperTitle: "Modal Example",
          onFinishRender: onRendered,
          onSaveFunction: onSave,
          extraData: eventGrp,
          toastAdvice: true,
          fieldRedAdvice: true,
          buttonHidden: false,
          readOnly: false
        });

        //Callback function on successful upload
        var fOnSuccessCallback = function fOnSuccessCallback(response) {
          console.log(response);
          var myEvent = {
            id: response.id,
            title: response.name,
            start: response.startDate,
            end: response.endDate, //"2016-02-03T12:01:00"
            //color: color,
            allDay: base.allDay(response.startDate, response.endDate)
          };
          base.$calendar.fullCalendar('renderEvent', myEvent);
          toastr.success(myEvent.title, base.options.messages.addEvents.success);
        };

        //Callback function on failed upload
        var fOnErrorCallback = function fOnErrorCallback() {
          toastr.error("Ups!", base.options.messages.addEvents.error);
        };

      });
    };

    /**
     * Initialize the main calendar with custom setup.
     */
    base.renderCalendar = function () {


      base.$calendar.fullCalendar({
        lang: base.options.language,
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
          var success = {title: event.title, description: base.options.messages.editEvent.successDrop};
          var error = {title: "Ups!", description: base.options.messages.editEvent.errorDrop};
          base.changeDay(event, revertFunc, success, error);
        },
        eventResize: function eventResize(event, delta, revertFunc) {
          var success = {title: event.title, description: base.options.messages.editEvent.successResize};
          var error = {title: "Ups!", description: base.options.messages.editEvent.errorResize};

          base.changeDay(event, revertFunc, success, error);
        },
        eventDragStop: function eventDragStop(event, jsEvent, ui, view) {
          if(base.borrar){
            base.removeEvent(event);
          }
        },
        dragRevertDuration: 0,
        events: function events(start, end, timezone, callback) {
          var fOnSuccessCallback = function fOnSuccessCallback(doc) {
            var events = [];
            for (var item in doc) {
              var currentEventType = doc[item]["eventType"]["itemLabel"];
              if (currentEventType === base.options.dataFilters.model) {
                if (base.$eventBox[0].innerHTML.indexOf(doc[item].id) == -1) {
                  try {
                    base.renderGenericEvents(doc[item]);
                  } catch (err) {
                    toastr.error("Ups!", base.options.messages.getGenericEvents.error);
                  }
                }

              } else if (base.options.dataFilters.shown.indexOf(currentEventType) >= 0) {
                // TODO aplicar config
                if (doc[item]['startDate'] != null) {
                  events.push({
                    id: doc[item]['id'],
                    title: doc[item]['name'],
                    start: doc[item]['startDate'],
                    end: doc[item]['endDate'],
                    allDay: base.allDay(doc[item]['startDate'], doc[item]['endDate'])
                  });

                }
              }
            }
            callback(events);
          };

          var fOnErrorCallback = function fOnErrorCallback() {
            toastr.error("Ups!", base.options.messages.getEvents.error);
          };

          base.doAjax(base.options.dataUrls.host + base.options.dataUrls.getEvents, "GET", null, fOnSuccessCallback, fOnErrorCallback);
        },
        eventColor: '#32c5d2',
        eventRender: function (event, element) {
          element.attr("id", event.id);
          var addNode = document.createElement("span");
          addNode.setAttribute("class", 'glyphicon glyphicon-remove');
          addNode.style.float = 'right';
          addNode.addEventListener("click", function(event){
            base.removeEvent(base.$calendar.fullCalendar('clientEvents', event.currentTarget.offsetParent.offsetParent.id)[0]);
          });
          element.context.childNodes[0].appendChild(addNode);
        }
      });
    };

    base.init();
  };
  $.Dwec.Calendar.defaultOptions = {
    language: "es",
    nameButtonAdd: "Add Event",
    allDay: 5,
    externalEventsTitle: "Dragable Events",
    estructureWrapersCalendar: "<div class='col-md-3 col-sm-12'><h3 class='event-form-title margin-bottom-20'>{externalEventsTitle}</h3><div class='external-events'><hr/><div class='event_box' class='margin-bottom-10'></div></div></div><div class='col-md-9 col-sm-12'><div class='calendar1' class='has-toolbar'></div></div></div>",
    messages: {
      editEvent: {
        error: "",
        success: "",
        errorResize: "Failed to change the end date of the event",
        successResize: "Changed the end date of the event",
        errorDrop: "Failed to change event day",
        successDrop: "Day event changed",
        modalDrop: "Do you want to change from day event?",
        modalResize: "Do you want to change the date of expiration of the event?"
      },
      getEvents: {
        error: "Failed to connect to server",
        success: "All events available loaded successfully"
      },
      addEvents: {
        error: "Error adding new event",
        success: "New event added"
      },
      delEvents: {
        error: "Failed to delete event",
        success: "Event deleted",
        modal: "Do you want to remove this event ?"
      },
      getGenericEvents: {
        error: "Failed to get some generic event"
      }

    },
    dataFilters: {
      model: "generic",
      shown: "session,microcicle"
    },
    dataUrls: {
      host: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/",
      editEvent: "set/",
      getEvents: "get/",
      addEvents: "add/",
      delEvents: "clear/"
    },
    initialObject: function () {
      return {eventGroup: {id: 32}};
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
