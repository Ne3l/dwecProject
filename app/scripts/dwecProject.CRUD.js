/**
 * CRUD plugin
 * @author: alejandro
 */
(function ($) {
    if (!$.Dwec) {
        $.Dwec = {};
    }

    $.Dwec.CRUD = function (el, getData, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;
        base.id = Math.round(Math.random() * 1000000000000);
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        base.actionsArray = [];
        base.fieldsArray = [];
        base.dataTable = {};
        base.table = null;
        // Add a reverse reference to the DOM object
        base.$el.data("Dwec.CRUD", base);
        base.init = function () {
            base.getData = getData;
            base.options = $.extend({}, $.Dwec.CRUD.defaultOptions, options);

            try {
                base.doProcessRequest(base.options.actions, "GET", {}, function (data) {
                    base.actionsArray = data.actions;
                    base.fieldsArray = data.fields;
                    base.renderExternalButton(); //I need to execute it here, because actions array is empty
                    base.renderTable();
                });
            } catch (e) {
                console.log("Something goes wrong in the init" + e);
            }
        };

        /**
         * This function is adding all the events of the plugin
         */
        base.addEvents = function () {
            base.table = $("#table_" + base.id);

            //Button add on the element
            base.$el.find('[data-action = "'+base.options.actionsNames.add+'"]').click(function () {
                try {
                    base.doAdd($(this).data("uri"));
                } catch (e) {
                    console.log(e);
                }
            });

            //Edit action, this will open a form
            base.table.on('click', 'span[data-action = "'+base.options.actionsNames.edit+'"]', function () {
                try {
                    base.doUpdate($(this).siblings("input").val(), $(this).data("uri"));
                } catch (e) {
                    console.log(e);
                }
            });

            //Show action, this will open a form
            base.table.on('click', 'span[data-action = "'+base.options.actionsNames.show+'"]', function () {
                try {
                    base.doShow($(this).siblings("input").val());
                } catch (e) {
                    console.log(e);
                }
            });

            //This directly deletes directly the
            base.table.on('click', 'span[data-action = "'+base.options.actionsNames.delete+'"]', function () {
                try {
                    base.doDelete($(this).data("uri"), $(this).siblings("input").val());
                } catch (e) {
                    console.log(e);
                }
            });

            //SEND buttons events
            base.$el.on('click', 'button[data-action = "SEND"]', function () {
                try {
                    window.open($(this).data("uri"), '_blank');
                } catch (e) {
                    console.log(e);
                }
            });

            //Checkbox select all
            $("#selectAll_" + base.id).click(function () {
                var table = $(this).closest('table');
                table.find("input[type = 'checkbox']").prop('checked', $(this).is(":checked"));
            });
        };

        //CRUD Methods
        /**
         * Generic function that using the common attributes of any action and getting the different ones process the action
         * @param diffOptions
         */
        base.doGenerateForm = function (diffOptions) {
            var defOptions = {
                restService: {
                    host: base.options.host,
                    structure: base.options.actions,
                    structureArrayIndex: base.options.defaultFormRestAttributes.structureArrayIndex,
                    innerUriDataAttribute: base.options.defaultFormRestAttributes.innerUriDataAttribute
                },
                toastAdvice: true,
                onFinishRender: function (data) {
                    base.options.onRenderItemForm(data);
                }
            };
            new jQuery.DwecProject.Form(base.$el.find("div[data-action='formWrapper']"), null, $.extend({}, defOptions, diffOptions));
        };

        /**
         * Adds an element
         * @param uri
         */
        base.doAdd = function (uri) {
            base.doGenerateForm({
                wrapperTitle: base.options.formTitles.add,
                extraData: base.options.initialObject(),
                onSaveFunction: function (data) {
                    base.doProcessRequest(uri, "POST", data, function () {
                        toastr.success(base.options.successCRUDMessages.add);
                        base.dataTable.ajax.reload(null, false);
                    })
                }
            });
        };

        /**
         * Updates an element
         * @param o
         * @param uri
         */
        base.doUpdate = function (o, uri) {
            base.doGenerateForm({
                wrapperTitle: base.options.formTitles.edit,
                extraData: base.doGenerateFormProcessableObject(JSON.parse(o)),
                onSaveFunction: function (data) {
                    base.doProcessRequest(base.format(uri, {id: JSON.parse(o)[base.options.idColumn]}), "PUT", data, function () {
                        toastr.success(base.options.successCRUDMessages.edit);
                        base.dataTable.ajax.reload(null, false);
                    })
                }
            })
        };

        /**
         * Shows an element using form
         * @param o
         */
        base.doShow = function (o) {
            base.doGenerateForm({
                wrapperTitle: base.options.formTitles.show,
                extraData: base.doGenerateFormProcessableObject(JSON.parse(o)),
                buttonHidden: true,
                readOnly: true
            });
        };

        /**
         * Deletes the selected item of the table
         * @param uri
         * @param o
         */
        base.doDelete = function (uri, o) {
            base.doProcessRequest(base.format(uri, {id: JSON.parse(o)[base.options.idColumn]}), "DELETE", {}, function () {
                toastr.success(base.options.successCRUDMessages.delete);
                base.dataTable.ajax.reload(null, false);
                base.dataTable.clear(); //Need this in case of removing last element
            });
        };

        /**
         * By a given object generates an object that can be processed by a form to display the date in case of show or update action
         * @param data
         * @returns {{}}
         */
        base.doGenerateFormProcessableObject = function (data) {
            var o = {};
            for (var i = 0; i < base.fieldsArray.length; i++) {
                if (base.fieldsArray[i].type == 'optionList')
                    o[base.fieldsArray[i].name] = data[base.fieldsArray[i].name].itemLabel;
                else if (base.fieldsArray[i].type == 'date')
                    o[base.fieldsArray[i].name] = moment(data[base.fieldsArray[i].name]).format("YYYY-MM-DD");
                else
                    o[base.fieldsArray[i].name] = data[base.fieldsArray[i].name];
            }
            return o;
        };

        //AJAX
        /**
         * Reusable function to process all the ajax requests made in the plugin
         * @param url
         * @param method
         * @param data
         * @param callbackSuccess
         */
        base.doProcessRequest = function (url, method, data, callbackSuccess) {
            $.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: method,
                url: base.options.host + url,
                dataType: "json",
                data: JSON.stringify(data),
                statusCode: base.getHttpStatusFromOptions(base.options.httpStatus)
            }).done(function (data) {
                callbackSuccess(data);
            })
        };

        /**
         * Returns an object with the status codes of http request using the messages of the options given by a user.
         * @param o
         * @returns {{}}
         */
        base.getHttpStatusFromOptions = function (o) {
            var statusObject = {};
            $.each(o, function (k, v) {
                statusObject[k] = (k.indexOf('2') == 0) ? function () {
                    toastr.success(v);
                } : function () {
                    toastr.error(v);
                }
            });

            return statusObject;
        };

        //EXTERNAL BUTTON
        /**
         * Renders the external button
         */
        base.renderExternalButton = function () {
            var buttons = "";
            for (var i = 0; i < base.actionsArray.length; i++) {
                if (base.actionsArray[i].type == "button") {
                    var name = base.getButtonName(base.actionsArray[i].uriTemplate);
                    buttons += base.format(base.options.templates.button, {
                        text: name,
                        icon: base.actionsArray[i].style,
                        action: (base.actionsArray[i].linkType == "SEND") ? base.actionsArray[i].linkType : name,
                        uri: base.actionsArray[i].uriTemplate
                    });
                }
            }
            base.$el.append(base.format(base.options.templates.buttonGroup, {buttons: buttons}));
            base.$el.append(base.options.templates.divForm);
        };

        /**
         * Obtains the name between slashes (/) using the uri template
         * @param template
         * @returns {string}
         */
        base.getButtonName = function (template) {
            try {
                var endPos = template.lastIndexOf("/");
                var startPos = template.lastIndexOf("/", endPos - 1);

                return template.substring(startPos + 1, endPos)
            }
            catch (e) {
                console.log(e);
            }
        };

        //TABLE
        /**
         * Renders the table and gets the dataTables object for later uses
         */
        base.renderTable = function () {
            var table = base.format(base.options.templates.table, {
                id: "table_" + base.id,
                classCss: base.options.classes.table,
                header: base.getHeader()
            });

            base.$el.append(table);
            base.doGenerateDatatablesObject(base.getDataForDataTables());
            base.addEvents();
        };

        /**
         * Generic function that choose which method call according to the "o" value
         * @returns {*}
         */
        base.getHeader = function () {
            var elements = base.format(base.options.templates.cell, {content: "actions"});
            elements += base.format(base.options.templates.cell, {content: '<input id = "selectAll_' + base.id + '" type="checkbox" class="checkboxes"/>'});
            elements += base.getHeaderByStructure();

            return (base.format(base.options.templates.header, {elements: elements}));
        };

        /**
         * Gets the header elements by structure fields. Checks if it has the label property, if not it render it using the name
         * @returns {string}
         */
        base.getHeaderByStructure = function () {
            var elements = "";
            for (var i = 0; i < base.fieldsArray.length; i++) {
                if (base.isValidTypeProperty(base.fieldsArray[i].type)) {
                    var value = (base.fieldsArray[i].hasOwnProperty("label")) ? base.fieldsArray[i].label : base.fieldsArray[i].name;
                    elements += base.format(base.options.templates.cell, {content: value});
                }
            }

            return elements;
        };

        /**
         * Checks if the type of the field is correct to render it or not
         * @param type
         * @returns {boolean}
         */
        base.isValidTypeProperty = function (type) {
            return (type == "string" || type == "date" || type == "html");
        };

        /**
         * Return the data that datatables needs to show the content of the table. The first two represents the actions and the checkboxes
         * @returns {*[]}
         */
        base.getDataForDataTables = function () {
            var data = [{
                "data": null,
                "searchable": false,
                "orderable": false,
                render: function (data, type, full) {
                    return base.getRapidActions() + base.getInputHiddenSerialized(JSON.stringify(full));
                }
            },
                {
                    "data": null,
                    "searchable": false,
                    "orderable": false,
                    "defaultContent": "<input type='checkbox' class='checkboxes' value='1' />"
                }];

            for (var i = 0; i < base.fieldsArray.length; i++) {
                if (base.isValidTypeProperty(base.fieldsArray[i].type)) {
                    data.push({data: base.fieldsArray[i].name});
                }
            }

            return data;
        };

        /**
         * Creates and returns the object that represents the datatable plugin for later uses
         * @param data
         * @returns {*}
         */
        base.doGenerateDatatablesObject = function (data) {
            try {
                base.dataTable = $("#table_" + base.id).DataTable({
                    rowId: base.options.idColumn,
                    responsive: {details: false},
                    aLengthMenu: [
                        [5, 10, 25, 50, 100, -1],
                        [5, 10, 25, 50, 100, "All"]
                    ],
                    "sAjaxDataProp": "",
                    "ajax": function (data, callback, settings) {
                        //Deprecated since version [explicar porque]
                        settings.jqXHR = $.ajax({
                            url: base.options.host + base.options.ajaxTable.url,
                            dataType: "json",
                            statusCode: {
                                204: function () {
                                    console.log("204");
                                    base.$el.find(".sorting").click();//This helps to quit the loading
                                }
                            }
                        });
                        settings.jqXHR.done(function (d) {
                            if (typeof d != "undefined") {
                                callback(d);
                            }
                        });
                    },
                    "columnDefs": [
                        {className: "dt-center", "targets": [0, 1]}
                    ],
                    'order': [],
                    "columns": data,
                    "language": {
                        "emptyTable": base.options.emptyTableMessage
                    }
                });
            }
            catch (e) {
                console.log("Error generating datatables" + e);
            }
        };

        /**
         * Returns the formatted rapid actions type cell
         * @returns {string}
         */
        base.getRapidActions = function () {
            var rapidActions = "";
            for (var i = 0; i < base.actionsArray.length; i++) {
                if (base.actionsArray[i].type == "cell") {
                    rapidActions += base.format(base.options.templates.rapidAction, {
                        icon: base.actionsArray[i].style,
                        action: base.getButtonName(base.actionsArray[i].uriTemplate),
                        uri: base.actionsArray[i].uriTemplate
                    })
                }
            }

            return rapidActions;
        };

        /**
         * Returns a formatted hidden input with the content of the full object for the form
         * @param data
         * @returns {*}
         */
        base.getInputHiddenSerialized = function (data) {
            return base.format(base.options.templates.input, {type: "hidden", value: data});
        };

        /**
         * This function is replacing the occurrences between {} of a given string for the arguments (that are represented by a json object)
         * @param str
         * @param args
         * @returns {*}
         */
        base.format = function (str, args) {
            for (var arg in args) {
                if (args.hasOwnProperty(arg))
                    str = str.replace(new RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
            }
            return str;
        };

        // Run initializer
        base.init();
    };
    $.Dwec.CRUD.defaultOptions = {
        host: "http://tomcat7-mycoachgate.rhcloud.com/rest/",
        actions: "events/structure/",
        ajaxTable: {
            "url": "events/get/"
        },
        emptyTableMessage: "No data available",
        idColumn: "id",
        templates: {
            table: "<table id='{id}' class='{classCss}'>{header}</table>",
            header: "<thead><tr>{elements}</tr></thead>",
            cell: "<th>{content}</th>",
            rapidAction: "<span class = '{icon}' data-action='{action}' data-uri='{uri}' style='margin: 5px'></span>",
            buttonGroup: "<div class='table-toolbar row'><div class='col-md-6 btn-group'>{buttons}</div></div>",
            button: "<button class='btn sbold green' data-action='{action}' data-uri='{uri}'>{text} <span class='{icon}'></span></button>",
            input: "<input type='{type}' value ='{value}'>",
            divForm: "<div data-action='formWrapper'></div>"
        },
        classes: {
            table: "table table-striped table-bordered table-hover table-checkable order-column"
        },
        httpStatus: {
            400: "Bad Request",
            403: "Connection Refused",
            404: "Not Found",
            405: "Method Not Allowed",
            415: "Unsupported Media Type",
            500: "Internal Server Error"
        },
        initialObject: function () {
            return {eventGroup: {id: 32}};
        },
        defaultFormRestAttributes: {
            structureArrayIndex: "fields",
            innerUriDataAttribute: "uriData"
        },
        formTitles: {
            add: "Adding Element",
            edit: "Updating Element",
            show: "Showing Element"
        },
        //This must to match with the uris of the api e.g: events/add
        actionsNames:{
            add:"add",
            edit:"set",
            show:"find",
            delete:"clear"
        },
        successCRUDMessages: {
            add: "Element correctly added!",
            edit: "Element correctly updated!",
            delete: "Element correctly deleted!"
        },
        onRenderItemForm: function (data) {
            console.log("formLoaded" + data);
        }
    };

    /**
     * This function has been modified to accept differents options for different videos getting an array of objects.
     * @param getData
     * @param optionsArray
     * @returns {*}
     */
    $.fn.Dwec_CRUD = function (getData, optionsArray) {
        var i = 0, options;
        return this.each(function () {
            try {
                options = (optionsArray[i] === undefined) ? optionsArray[0] : optionsArray[i];
            }
            catch (e) {
                console.log("Error loading array of options: Setting the default options ");
                options = {};
            }
            (new $.Dwec.CRUD(this, getData, options));
            i++;
        });
    };
// This function breaks the chain
    $.fn.getDwec_CRUD = function () {
        this.data("Dwec.CRUD");
    };
})
(jQuery);