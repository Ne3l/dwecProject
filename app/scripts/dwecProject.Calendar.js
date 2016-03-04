//Authors Jordi Benejam - Nacho Lopez
//Funcionalidad Calendario
// Cargar eventos API
// Agregar eventos
// Modificar fechas


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
        base.$eventBox = $('#event_box');


        base.init = function () {
            base.getData = getData;
            base.options = $.extend({}, $.Dwec.Calendar.defaultOptions, options);

            //Provisional modal. To be replaced with borja's Form.
            $("body").append("<div id='myModal' class='modal fade' tabindex='-1' role='dialog'> <div class='modal-dialog'> <div class='modal-content'> <div class='modal-header'> <button type='button' class='close' data-dismiss='modal' aria-label='Closev><span aria-hidden='true'>&times;</span></button> <h4 class='modal-title'>Information</h4> </div> <div class='modal-body'> <p id='content'></p> </div> <div class='modal-footer'> <button id='close' type='button' class='btn btn-default' data-dismiss='modal'>Close</button> <button type='button' id='accept' class='btn btn-primary' data-dismiss='modal'>Save changes</button> </div> </div></div></div>");
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
                200: function _(response) {
                    console.log("Codigo 200 respuesta");
                    console.log(response);
                    fOnSuccessCallback(response);
                },
                201: function _(response) {
                    console.log("Codigo 201 respuesta");
                    console.log(response);
                    fOnSuccessCallback(response);
                },
                204: function _(response) {
                    console.log("Codigo 204 respuesta");
                    console.log(response);
                    fOnSuccessCallback();
                },
                400: function _(response) {
                    console.log("Codigo 400 respuesta");
                    console.log(response);
                    fOnErrorCallback();
                },
                404: function _(response) {
                    console.log("Codigo 404 respuesta");
                    console.log(response);
                    fOnErrorCallback();
                },
                500: function _(response) {
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

            //TODO Si selectior tiene id wrapper => ya puedo tener variar instancias
            // TODO $('.fc-day') => $('#' + containerID + '.fc-day');
            // TODO Container ID es generado por mi => Preguntar Llorenc;


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
                        $(el).fullCalendar('renderEvent', myEvent);
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
            // TODO revisar IDs
            var $bin = '<div class="col-md-12" style="padding-bottom:10px; padding-left:0px ;text-align:left;display:flex;align-items:center;margin-bottom: 20px; border-bottom: 1px solid #e5e5e5 ;"><a href="javascript:;" id="event_add" class="btn green"> Add Event </a><span id="bin" class="glyphicon glyphicon-trash" style="color:#BBDEFB;font-size:3em;"></span></div>';
            $('#external-events').prepend($bin);

            $(bin).on("dragover", function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.style.color = '#F44336';
            });

            $(bin).on("dragleave", function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.style.color = '#BBDEFB';
            });
            $(bin).on("drop", function (event) {
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
            // TODO Revisar IDs
            var bin = $('#bin');
            var offset = bin.offset();
            offset.right = bin.width() + offset.left;
            offset.bottom = bin.height() + offset.top;
            console.log(offset.left);
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
            // TODO revisar ID's
            $("#content").text(info);
            $("#accept").on("click", function () {
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
            $("#close").on("click", function () {
                revertFunc();
            });

            $('#myModal').modal('show');
        };

        /**
         * Initialize the main calendar with custom setup.
         */
        base.renderCalendar = function () {

            //TODO todos los mensajes en options -> i18n


            $(el).fullCalendar({
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
                        console.log("as");

                        $('#calendar').fullCalendar('removeEvents', event._id);
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
                            if (doc[item]["eventType"]["itemLabel"] === "generic") {
                                base.renderGenericEvents(doc[item]);
                            } else {
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
})(jQuery);
