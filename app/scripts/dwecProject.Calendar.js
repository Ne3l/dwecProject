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
        base.$actionBox = null;
        base.$calendar = null;
        base.delete = false;
        base.$el.data("Dwec.Calendar", base);

        base.init = function () {
            base.getData = getData;
            base.options = $.extend({}, $.Dwec.Calendar.defaultOptions, options);

            base.$el.addClass("dwecCalendarContainer");
            base.$el.append(base.options.estructureWrapersCalendar.replace("{externalEventsTitle}", base.options.externalEventsTitle));

            //Check only one modal is created instead of one modal por instance.
            if (document.getElementById('calendarModal') == null) {
                $("body").append("<div id='calendarModal' class='modal fade' tabindex='-1' role='dialog'><div class='modal-dialog'> <div class='modal-content'><div class='modal-header'><h4 class='modal-title'></h4></div><div class='modal-body'><p id='content'></p></div><div class='modal-footer'><button id='close' type='button' class='btn btn-default' data-dismiss='modal'></button><button id='accept' type='button' class='btn btn-primary' data-dismiss='modal'></button></div></div></div></div>");
            }
            //Initialize subComponents
            base.$eventBox = base.$el.find('.event_box');
            base.$calendar = base.$el.find('.dwecCalendar');
            base.$calendarModal = $('#calendarModal');

            base.renderActionBox();
            base.addEvent();
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
         * Helper method. Allows a draggable event to be dropped.
         * @param $element
         */
        base.allowDrop = function ($element) {
            //Allows On Drop
            $element.on("dragover", function (event) {
                event.preventDefault();
            });
        };

        /**
         * Adds functionality to drag generic events(Outside calendar) and drop them inside calendar.
         */
        base.addOnDragOverDays = function () {

            // fc-day-number alternative selector
            base.$el.find('.fc-day').each(function (key, value) {
                var $element = $(this);

                $element.on("dragenter", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.style.backgroundColor = 'rgba(50,197,210,0.3)';
                });

                $element.on("dragleave", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.style.backgroundColor = 'rgba(255,255,255,1)';
                });

                base.allowDrop($element);

                $element.on("drop", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.style.backgroundColor = 'rgba(255,255,255,1)';
                    if (base.el.id == event.originalEvent.dataTransfer.getData('Instance')) {

                        var color = event.originalEvent.dataTransfer.getData('colorGeneric');
                        var EventType = event.originalEvent.dataTransfer.getData('EventType');
                        var fechaStart = this.getAttribute('data-date');
                        var fechaEnd = this.getAttribute('data-date');
                        var url = base.options.dataUrls.host + base.options.dataUrls.addEvents; //base.options.urlAdd;

                        //Data to be passed with filled information
                        var baseData = {
                            "name": EventType,
                            "description": null,
                            "startDate": fechaStart,
                            "endDate": fechaEnd,
                            "eventType": null,
                            "status": null,
                            "eventGroup": event.originalEvent.dataTransfer.getData('group-id'),
                            "content": {
                                "data": [{"label": "Prueba", "note": "Loren ipsum"}, {
                                    "label": "Prueba",
                                    "note": "Loren ipsum"
                                }]
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
                        var onSave = function (data) {
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

                        var onRendered = function (data) {
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
         * Renders the Action box inside the external-events container
         * Includes the Add event button and the Bin
         */
        base.renderActionBox = function () {
            var container = '<div class="col-md-12 action-box"><a href="javascript:;" class="event_add btn green">' + base.options.nameButtonAdd + '</a><div class="binWrapper"><span class="bin glyphicon glyphicon-trash"></span></div></div>';
            base.$el.find('.external-events').prepend(container);
            base.$actionBox = base.$el.find('.action-box');
            base.$bin = base.$el.find('.binWrapper');

            //Changes the color of the bin based on Instance preferences
            base.$bin.css("color", base.options.bin.color);

            base.addBinListeners();
        };

        /**
         * Add functionality to the bin
         */
        base.addBinListeners = function () {

            var dragenter = function (event) {
                event.preventDefault();
                event.stopPropagation();
                base.$bin.css("color", base.options.bin.colorHover);
            };

            var dragleave = function (event) {
                event.preventDefault();
                event.stopPropagation();
                base.$bin.css("color", base.options.bin.color);
            };

            var drop = function (event) {
                var genericEvent = base.$eventBox.find("[event-id='" + event.originalEvent.dataTransfer.getData('event-id') + "']")[0];
                var fOnSuccessCallback = function (id) {
                    toastr.success(genericEvent.innerHTML, base.options.messages.delEvents.success);
                };

                base.removeEvent(genericEvent, base.$eventBox, fOnSuccessCallback);
            };

            base.$bin.on("dragenter", dragenter);
            base.$bin.on("dragleave", dragleave);
            base.allowDrop(base.$bin);
            base.$bin.on("drop", drop);

            base.$bin.mouseenter(function () {
                base.$bin.css("color", base.options.bin.colorHover);
                base.delete = true;
            });

            base.$bin.mouseleave(function () {
                base.$bin.css("color", base.options.bin.color);
                base.delete = false;
            });
        };

        /**
         * Render the genericEvent outside the calendar.
         * Adds functionality to drag them inside calendar.
         * @param genericEvent
         */
        base.renderGenericEvents = function (genericEvent) {
            var divEvents = '<div class="{classes}" {attr} draggable="true">{name}</div>';
            var classes = 'external-event label label-default ui-draggable ui-draggable-handle';

            var onDragStart = function onDragStart(event) {
                event.originalEvent.dataTransfer.setData('Instance', base.el.id);
                event.originalEvent.dataTransfer.setData('EventType', event.currentTarget.innerHTML);
                event.originalEvent.dataTransfer.setData('group-id', genericEvent.eventGroup.id);
                event.originalEvent.dataTransfer.setData('colorGeneric', event.currentTarget.style.backgroundColor);
                event.originalEvent.dataTransfer.setData('event-id', genericEvent.id);
            };

            base.$eventBox.append($(divEvents.replace("{classes}", classes)
                .replace("{attr}", "group-id=" + genericEvent.eventGroup.id + " event-id=" + genericEvent.id)
                .replace("{name}", genericEvent.name))
                .on('dragstart', onDragStart));
        };

        /**
         * Changes the day of an event.
         * @param event
         * @param revertFunc
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

        /**
         * Add a new event (through the Form plugin).
         */
        base.addEvent = function () {
            base.$addEventBtn = base.$el.find('.event_add');
            base.$addEventBtn.on("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                //Extra data to be passed (required by the Form plugin)
                var eventGrp = {
                    "eventGroup": {"id": 32},
                    "content": {"data": []},
                    "configuration": {"data": []}
                };

                //Callback function on saved form
                var onSave = function (data) {
                    var sendData = {
                        "name": data.name,
                        "description": data.description,
                        "startDate": data.startDate,
                        "endDate": data.endDate,
                        "eventType": data.eventType,
                        "status": data.status,
                        "eventGroup": data.eventGroup,
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

                var onRendered = function (data) {
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
         * Shows CalendarModal asking if the user wants to delete the event
         * Hide the event on local
         * In case of accept removes the element both on server and local
         * In case of close just show again the event.
         * @param event
         */
        base.removeEvent = function (event, wrapper, fOnSuccessCallback) {
            var $wrapper = base.$el.find(wrapper);
            var $event = $wrapper.find("[event-id='" + event.getAttribute("event-id") + "']");
            $event.hide();

            //Set texts
            base.$calendarModal.find(".modal-title").text(event.title);
            base.$calendarModal.find("#content").text(base.options.messages.delEvents.modal.message);
            base.$calendarModal.find("#accept").text(base.options.messages.delEvents.modal.accept);
            base.$calendarModal.find("#close").text(base.options.messages.delEvents.modal.cancel);

            //reset onClick function
            base.$calendarModal.find("#accept").unbind("click");
            base.$calendarModal.find("#close").unbind("click");

            base.$calendarModal.find("#close").on("click", function () {
                $event.show();
            });

            base.$calendarModal.find("#accept").on("click", function () {
                var fOnErrorCallback = function () {
                    toastr.error(event.title, base.options.messages.delEvents.error);
                };

                base.doAjax(base.options.dataUrls.host + base.options.dataUrls.delEvents + event.getAttribute("event-id"), 'DELETE', "", fOnSuccessCallback, fOnErrorCallback);
            });
            base.$calendarModal.modal('show');

        };

        /**
         * Checks if the event is AllDay or not based on Instance Preferences
         * @param start
         * @param end
         * @returns {boolean}
         */
        base.allDay = function (start, end) {
            return (moment(end).diff(moment(start), 'hours') >= base.options.allDay);
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
                eventColor: base.options.events.color,
                dragRevertDuration: 0,
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
                    if (base.delete) {
                        var fOnSuccessCallback = function (id) {
                            base.$calendar.fullCalendar('removeEvents', event._id);
                            toastr.success(event.title, base.options.messages.delEvents.success);
                        };
                        base.removeEvent(event, base.$calendar, fOnSuccessCallback);
                    }
                },
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
                eventRender: function (event, element) {
                    element.attr("event-id", event.id);
                    var addNode = document.createElement("span");
                    addNode.setAttribute("class", 'glyphicon glyphicon-remove');
                    addNode.style.float = 'right';
                    addNode.style.zIndex = '2000';
                    addNode.addEventListener("click", function (event) {
                        var fOnSuccessCallback = function (id) {
                            toastr.success(event.title, base.options.messages.delEvents.success);
                        };
                        base.removeEvent(element[0], base.$calendar, fOnSuccessCallback);
                    });

                    element.context.childNodes[0].appendChild(addNode);
                }
            });
        };

        base.init();
    };
    $.Dwec.Calendar.defaultOptions = {
        language: "en",
        nameButtonAdd: "Add Event",
        allDay: 5,
        externalEventsTitle: "Dragable Events",
        estructureWrapersCalendar: "<div class='col-md-3 col-sm-12 external-events-wrapper'><h3 class='event-form-title margin-bottom-20'>{externalEventsTitle}</h3><div class='external-events'><div class='event_box' class='margin-bottom-10'></div></div></div><div class='col-md-9 col-sm-12'><div class='dwecCalendar' class='has-toolbar'></div></div></div>",
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
                modal: {
                    message: "Do you want to remove this event ?",
                    accept: "Delete",
                    cancel: "Cancel"
                }
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
        bin: {
            color: "#BBDEFB",
            colorHover: "#F44336"
        },
        events: {
            color: "#32c5d2"
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
})(jQuery);
