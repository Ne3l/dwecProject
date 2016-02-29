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


            $("body").append("<div id='myModal' class='modal fade' tabindex='-1' role='dialog'> <div class='modal-dialog'> <div class='modal-content'> <div class='modal-header'> <button type='button' class='close' data-dismiss='modal' aria-label='Closev><span aria-hidden='true'>&times;</span></button> <h4 class='modal-title'>Information</h4> </div> <div class='modal-body'> <p id='content'></p> </div> <div class='modal-footer'> <button id='close' type='button' class='btn btn-default' data-dismiss='modal'>Close</button> <button type='button' id='accept' class='btn btn-primary' data-dismiss='modal'>Save changes</button> </div> </div></div></div>");
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
                        "eventType": "GENERIC",
                        "status": "NOT_DEFINED",
                        "eventGroup": {"id": event.originalEvent.dataTransfer.getData('idGeneric')},
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
                            title: "Evento " + tipoEvento,
                            start: fechaStart,
                            end: fechaEnd, //"2016-02-03T12:01:00"
                            color: color
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

        base.renderBin = function () {
            var $bin = '<div class="col-md-12" style="padding-bottom:10px;text-align:left;display:flex;align-items:center;margin-bottom: 20px; border-bottom: 1px solid #e5e5e5 ;"><a href="javascript:;" id="event_add" class="btn green"> Add Event </a><span id="bin" class="glyphicon glyphicon-trash" style="color:#BBDEFB;font-size:3em;"></span></div><span class="divider"></span> ';
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


        };

        base.renderGenericEvents = function () {
            var divEvents = '<div style="position: relative;" class="{classes}" {attr} draggable="true">{name}</div>';
            var classes = 'external-event label label-default ui-draggable ui-draggable-handle';

            var onDragStart = function (event) {
                console.log(event);
                event.originalEvent.dataTransfer.setData('tipoEvento', event.currentTarget.innerHTML);
                event.originalEvent.dataTransfer.setData('idGeneric', event.currentTarget.attributes[2].nodeValue);
                event.originalEvent.dataTransfer.setData('colorGeneric', event.currentTarget.style.backgroundColor);
            };

            var $box = $('#event_box');

            $.ajax({
                url: base.options.urlEventsTypes,
                dataType: 'json',
                success: function (doc) {
                    $.each(doc, function () {
                        $box.append($(divEvents.replace("{classes}", classes).replace("{attr}", "data-id='" + this.id + "'").replace("{name}", this.name)).on('dragstart', onDragStart).css("background-color", this.additionalInfo));
                       console.log(this);
                    });

                },
                error: function (doc) {
                    toastr.error("La peticion ajax ha fallado");
                }
            });

        };

        base.changeDay = function (event, revertFunc, info, success, error) {
            $("#content").text(info);
            $("#accept").on("click", function () {
                var url = base.options.urlEdit + event.id;
                var sendData = {
                    id: event.id,
                    "startDate": event.start,
                    "endDate": event.end
                };

                var fOnSuccessCallback = function (id) {
                    toastr.success(success.title, success.description);
                };
                var fOnErrorCallback = function () {
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

                    var info = event.title + " was dropped on " + event.start.format();
                    var success = {title: "Evento modificado", description: "Evento dia " + event.start.format()};
                    var error = {title: "Ups!", description: "No podemos conectar..."};
                    base.changeDay(event, revertFunc, info, success, error);
                    //alert(event.title + " was dropped on " + event.start.format());
                    //if (!confirm("Are you sure about this change?")) {
                    //    revertFunc();
                    //} else {
                    //    var url = base.options.urlEdit + event.id;
                    //    var sendData = {
                    //        id: event.id,
                    //        "startDate": event.start,
                    //        "endDate": event.end,
                    //        "content": {"data": []},
                    //        "configuration": {"data": []}
                    //    };
                    //
                    //    var fOnSuccessCallback = function (id) {
                    //        toastr.success("Evento añadido", "Evento dia " + event.start);
                    //    };
                    //    var fOnErrorCallback = function () {
                    //        revertFunc();
                    //        toastr.error("Ups!", "No podemos conectar...");
                    //    };
                    //
                    //    base.doAjax(url, 'PUT', sendData, fOnSuccessCallback, fOnErrorCallback);
                    //    console.log(JSON.stringify(event));
                    //}
                },
                eventResize: function (event, delta, revertFunc) {
                    var info = event.title + " end is now " + event.end.format();
                    var success = {
                        title: "Evento modificado",
                        description: "Evento dia " + event.start.format() + " hasta " + event.end.format()
                    };
                    var error = {title: "Ups!", description: "No podemos conectar..."};

                    base.changeDay(event, revertFunc, info, success, error);
                    //alert(event.title + " end is now " + event.end.format());
                    //if (!confirm("is this okay?")) {
                    //    revertFunc();
                    //}
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
                                if (doc[item]['startDate'] != null)
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
        urlEdit: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/set/",
        urlGet: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/get/",
        urlAdd: "http://tomcat7-mycoachgate.rhcloud.com/rest/events/add/",
        onDropEventType: "",
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
