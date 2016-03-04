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
            //Button add on the element
            base.$el.find("[data-action = 'add']").click(function () {
                base.doAdd($(this).data("uri"));
            });

            //Edit action, this will open a form
            $("#table_" + base.id).on('click', 'span[data-action = "set"]', function () {
                base.doUpdate($(this).siblings("input").val(), $(this).data("uri"));
            });

            //Show action, this will open a form
            $("#table_" + base.id).on('click', 'span[data-action = "find"]', function () {
                base.doShow($(this).siblings("input").val());
            });

            //This directly deletes directly the
            $("#table_" + base.id).on('click', 'span[data-action = "clear"]', function () {
                base.doDelete($(this).data("uri"), $(this).siblings("input").val());
            });

            //SEND buttons events
            base.$el.on('click', 'button[data-action = "SEND"]', function () {
                try {
                    window.open(
                        $(this).data("uri"),
                        '_blank'
                    );
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
         * Creates a form instance into the formWrapper div and makes the new object to insert it on the api
         */
        base.doAdd = function (uri) {
            var o = {};
            new jQuery.Plugin.Form(base.$el.find("div[data-action='formWrapper']"), null, {
                structure: base.options.actions, onSaveFunction: function (data) {
                    for (var i = 0; i < base.fieldsArray.length; i++) {
                        //TODO: Apply the filters to construct a correct object, important for the matrioska of events
                        o[base.fieldsArray[i].name] = data[base.fieldsArray[i].name];
                    }
                    console.log(JSON.stringify(o));
                    base.doProcessRequest(uri, "POST", o, function () {
                        toastr.success("Element correctly added");
                        base.dataTable.ajax.reload();
                    })
                }
            });
        };

        base.doUpdate = function (o, uri) {
            //TODO update action
            var newObject = {};
            new jQuery.Plugin.Form(base.$el.find("div[data-action='formWrapper']"), null, {
                formData: JSON.parse(o),
                structure: base.options.actions,
                onSaveFunction: function (data) {
                    for (var i = 0; i < base.fieldsArray.length; i++) {
                        //TODO: refator once is corrected
                        newObject[base.fieldsArray[i].name] = data[base.fieldsArray[i].name];
                    }
                    base.doProcessRequest(base.format(uri, {id:JSON.parse(o)[base.options.idColumn]}), "PUT", newObject, function () {
                        toastr.success("Element correctly edited");
                        base.dataTable.ajax.reload();
                    })
                }
            });

        };

        base.doShow = function (o) {
            //TODO show action
            toastr.warning("SHOW NOT IMPLEMENTED YET!!!!");
            console.log(o);
        };

        base.doDelete = function (uri, o) {
            base.doProcessRequest(base.format(uri, {id: JSON.parse(o)[base.options.idColumn]}), "DELETE", {}, function (data) {
                toastr.success("This element has been correctly removed", "Deleting");
                base.dataTable.ajax.reload();
            });
        };

        //AJAX
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
                statusCode: {
                    400: function () {
                        toastr.error("400 error");
                    },
                    404: function () {
                        toastr.error("404 error");
                    },
                    405: function () {
                        toastr.error("405 error");
                    },
                    415: function () {
                        toastr.error("415 error");
                    },
                    500: function () {
                        toastr.error("500 error");
                    }
                }
            }).done(function (data) {
                callbackSuccess(data);
            })
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
         * @param o
         * @returns {*}
         */
        base.getHeader = function (o) {
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
         * @param o
         * @returns {*[]}
         */
        base.getDataForDataTables = function (o) {
            var data = [{
                "data": null,
                "searchable": false,
                "orderable": false,
                render: function (data, type, full, meta) {
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
            base.dataTable = $("#table_" + base.id).DataTable({
                rowId: base.options.idColumn,
                responsive: {details: false},
                aLengthMenu: [
                    [5, 10, 25, 50, 100, -1],
                    [5, 10, 25, 50, 100, "All"]
                ],
                "ajax": {
                    "url": base.options.host + base.options.ajaxTable.url,
                    "dataSrc": ""
                },
                "columnDefs": [
                    {className: "dt-center", "targets": [0, 1]}
                ],
                'order': [],
                "columns": data
            });
        };

        /**
         * Returns the formatted rapid actions type cell
         * @returns {string}
         */
        base.getRapidActions = function () {
            var rapidActions = "";
            for (var i = 0; i < base.actionsArray.length; i++) {
                rapidActions += (base.actionsArray[i].type == "cell") ? base.format(base.options.templates.rapidAction, {
                    icon: base.actionsArray[i].style,
                    action: base.getButtonName(base.actionsArray[i].uriTemplate),
                    uri: base.actionsArray[i].uriTemplate
                }) : "";
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
            "url": "events/get/",
            "dataSrc": ""
        },
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
