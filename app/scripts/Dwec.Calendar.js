//Añadir content al añadir evento (Mirar nueva version Postman)
(function ($) {
  if (!$.Dwec) {
    $.Dwec = new Object();
  }
  ;
  $.Dwec.Calendar = function (el, getData, options) {
    var base = this;
    base.$el = $(el);
    base.el = el;
    base.$el.data("Dwec.Calendar", base);
    base.init = function () {
      base.getData = getData;
      base.options = $.extend({}, $.Dwec.Calendar.defaultOptions, options);

      base.renderGenericEvents();
      base.renderBin();
      base.renderCalendar();
    };

    base.doAjax = function (url, method, sendData, fOnSuccessCallback, fOnErrorCallback) {
      //var item = {error:"200","func":function(){}}; se me va la olla
      var callBackFunctions = {
        200: function (response) {
          console.log("Codigo 200 respuesta");
          console.log(response);
          fOnSuccessCallback(response.id);
        },
        201: function (response) {
          console.log("Codigo 201 respuesta");
          console.log(response);
          fOnSuccessCallback(response.id);
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

    base.addOnDragOverDays = function () {
      // fc-day-number alternative selector
      $('.fc-day').each(function (key, value) {
        $(this).on("dragover", function (event) {
          event.preventDefault();
          event.stopPropagation();
          this.style.backgroundColor = 'rgba(50,197,210,0.3)';
        });

        $(this).on("dragleave", function (event) {
          event.preventDefault();
          event.stopPropagation();
          this.style.backgroundColor = 'rgba(255,255,255,1)';
        });

        $(this).on("drop", function (event) {
          event.preventDefault();
          event.stopPropagation();
          var tipoEvento = event.originalEvent.dataTransfer.getData('tipoEvento');
          this.style.backgroundColor = 'rgba(255,255,255,1)';
          var fecha = this.getAttribute('data-date') + "T12:01:00";

          var url = base.options.urlAdd;
          var sendData = {
            "name": "Nuevo evento",
            "description": "Evento de prueba",
            "startDate": fecha,
            "endDate": fecha,
            "eventType": "GENERIC",
            "status": "NOT_DEFINED",
            "eventGroup": {"id": 91},
            "content": {
              "data": [
                {"label": "Prueba", "note": "Loren ipsum"},
                {"label": "Prueba", "note": "Loren ipsum"}
              ]
            },
            "configuration": {
              "data": [
                {"conceptType": "INTENSITY", "value": 8, "label": "Prueba", "note": "Loren ipsum"},
                {"conceptType": "VOLUME", "value": 8, "label": "Prueba", "note": "Loren ipsum"}
              ]
            }
          };
          var fOnSuccessCallback = function (id) {
            var myEvent = {
              id: id,
              title: tipoEvento,
              start: fecha,
              end: fecha
            };
            $(el).fullCalendar('renderEvent', myEvent);
            toastr.success("Evento añadido", "Evento dia " + myEvent.start);
          };
          var fOnErrorCallback = function () {
            toastr.error("Ups!", "No podemos conectar...");
          };

          base.doAjax(url, 'POST', sendData, fOnSuccessCallback, fOnErrorCallback);
        });
      });
    };

    base.renderBin = function(){
      var $bin = '<div id="bin" class="col-md-12" style="text-align: right;"><span class="glyphicon glyphicon-trash" style="color:#BBDEFB;font-size:3em;"></span></div>';
      $('#event_add').after($bin);

      console.log($('#bin'));
      $('#bin').each(function(){
        $(this).on("dragover", function (event) {
          event.preventDefault();
          event.stopPropagation();
          this.style.color = '#333333';
          this.style.backgroundColor = '#333333';
          console.log(bin);
        });
      });

      $(bin).on("dragleave", function (event) {
        event.preventDefault();
        event.stopPropagation();
        this.style.backgroundColor = 'rgba(255,255,255,1)';
      });


    };

    base.renderGenericEvents = function () {
      var divEvents = '<div style="position: relative;" class="{classes}" {attr} draggable="true">{name}</div>';
      var classes = 'external-event label label-default ui-draggable ui-draggable-handle';

      var onDragStart = function (event) {
        event.originalEvent.dataTransfer.setData('tipoEvento', event.currentTarget.innerHTML);
      };

      var $box = $('#event_box');

      $.ajax({
        url: base.options.urlEventsTypes,
        dataType: 'json',
        success: function (doc) {
          $.each(doc, function () {
            $box.append($(divEvents.replace("{classes}", classes).replace("{name}", this.name)).on('dragstart', onDragStart));
            console.log(this);
          });

        },
        error: function (doc) {
          toastr.error("La peticion ajax ha fallado");
        }
      });

    };
    base.renderCalendar = function () {
      $(el).fullCalendar({
        firstDay: 1,
        droppable: true,
        editable: true,
        startEditable: true,
        header: {
          left: 'title', center: 'month,agendaWeek', right: 'today prev,next'
        },
        eventLimit: true,
        viewRender: function () {
          base.addOnDragOverDays();
        },
        eventDrop: function (event, delta, revertFunc) {
          console.log(event);
          //alert(event.title + " was dropped on " + event.start.format());
          if (!confirm("Are you sure about this change?")) {
            revertFunc();
          } else {
            var url = base.options.urlEdit + event.id;
            var sendData = {
              id: event.id,
              "startDate": event.start,
              "endDate": event.end
            };

            var fOnSuccessCallback = function (id) {
              toastr.success("Evento añadido", "Evento dia " + event.start);
            };
            var fOnErrorCallback = function () {
              revertFunc();
              toastr.error("Ups!", "No podemos conectar...");
            };

            base.doAjax(url, 'PUT', sendData, fOnSuccessCallback, fOnErrorCallback);
            console.log(JSON.stringify(event));
          }
        },
        eventResize: function (event, delta, revertFunc) {
          alert(event.title + " end is now " + event.end.format());
          if (!confirm("is this okay?")) {
            revertFunc();
          }
        },
        events: function (start, end, timezone, callback) {
          $.ajax({
            url: base.options.urlGet,
            dataType: 'json',
            data: {
              start: start.unix(),
              end: end.unix()
            },
            success: function (doc) {
              var events = [];
              for (var item in doc) {
                events.push({
                  id: doc[item]['id'],
                  title: doc[item]['description'],
                  start: doc[item]['startDate'],
                  end: doc[item]['endDate'],
                  allDay: true
                })
              }
              callback(events);
            },
            error: function (doc) {
              toastr.error("La peticion ajax ha fallado");
            }
          });
        },
        eventColor: '#32c5d2'
      });

    };

    base.init();
  };
  $.Dwec.Calendar.defaultOptions = {
    html: true,
    url: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/",
    edit: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/set/",
    urlGet: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/",
    urlAdd: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/add/",
    onDropEventType:"",
    urlEventsTypes: "http://tomcat7-mycoachgate.rhcloud.com/rest/eventGroup/get/",
    post: "",
    msgError: "Content not found",
    eventsJson: {},
    editOnSuccess: function () {
    },
    editOnFail: function () {
    },
    addOnSuccess: function () {
    },
    addOnFail: function () {
    },
    deleteOnSuccess: function () {
    },
    deleteOnFail: function () {
    }
  };
  $.fn.Dwec_Calendar = function (getData, options) {
    return this.each(function () {
      (new $.Dwec.Calendar(this, getData, options));
    });
  };

  $.fn.getDwec_Calendar = function () {
    this.data("Dwec.Calendar");
  };
})(jQuery);
