/**
 * Form Plugin v2.0.
 * Plugin done by Borja Benejam.
 */
(function ($) {
  if (!$.DwecProject) {
    $.DwecProject = new Object();
  }
  ;
  $.DwecProject.Form = function (el, getData, options) {
    // To avoid scope issues, use 'base' instead of 'this'
    // to reference this class from internal events and functions.
    var base = this;
    // Access to jQuery and DOM versions of element
    base.$el = $(el);
    base.el = el;
    // Add a reverse reference to the DOM object
    base.$el.data("DwecProject.Form", base);
    base.init = function () {
      base.getData = getData;
      base.options = $.extend({}, $.DwecProject.Form.defaultOptions, options);
      base.id = base.getRandomId();
      base.options.validation.toastAdvice = base.options.toastAdvice;
      base.options.validation.fieldRedAdvice = base.options.fieldRedAdvice;
      base.getRestStructure();
      base.render({
        parameters: base.options,
        extraData: base.options.extraData,
        wrapperType: base.options.wrapperType,
        buttonHidden: base.options.buttonHidden,
        wrapperTitle: base.options.wrapperTitle,
        readOnly: base.options.readOnly,
        onSaveFunction: base.options.onSaveFunction,
        onFinishRender: base.options.onFinishRender
      });
    };
    //String format function to use in this plugin
    String.prototype.format = function (args) {
      var newStr = this;
      for (var key in args) {
        newStr = newStr.replace('{' + key + '}', args[key]);
      }
      return newStr;
    };
    //Rendering of the Data into HTML -> DOM.
    base.render = function (data) {
      base.getRestStructure();
      base.options.data.extraData = data.extraData;
      base.options.wrapper.wrapperTitle = data.wrapperTitle;
      base.options.buttonHidden = data.buttonHidden;
      //local Variables
      var renderCode = base.options.htmlRender;
      var restData = base.options.data.restData;
      var aux = "";
      var label = "";
      var input = "";
      var content = "";
      var hidden = "";
      var obj;
      //Loop all the fields.
      $.each(restData, function (key) {
        obj = restData[key];
        //Creation of the 'blue label' of the left.
        label = renderCode.fieldLabel("field"+obj['name'],obj['label']);
        //Creation of the input
        input = base.createInput(obj);

        //If it's hidden -> become the row hidden to don't display anything.
        obj['type'] == 'hidden' ? hidden = "hidden" : hidden = "";
        content = base.options.htmlRender.inputRow(hidden, label, input);
        aux += content;
      });

      //Action Buttons Rendering

      //Rendering of the option buttons.
      var buttonContainer = base.options.renderButtons(base.options.buttons, base.options.htmlRender.button);
      buttonContainer = base.options.htmlRender.row('right', buttonContainer, base.options.buttonHidden);

      //Wrapper Rendering
      el.html(base.options.wrapper.getWrapper(base.options.wrapperType).format({
        title: base.options.wrapper.wrapperTitle,
        id: base.id,
        content: aux + buttonContainer
      }));
      //Fill the extra data into the inputs (if exist)
      base.fillInputs();
      //AddListeners to Form.
      base.addListeners();
      //Optional function to do when render finishes.
      base.options.onFinishRender();
    };
    base.addListeners = function () {
      //set Listeners of Buttons
      $.each(base.options.buttons, function (key) {
        $("#" + base.id).find("." + base.options.buttons[key]['mainClass']).on('click', function () {
          base.options.buttons[key]['click'](base);
        });
      });
      //DropDown Listener
      $('#' + base.id).find('.listElement').on('click', function (e) {
        ($(this)).parent().parent().children('.DropdownButton').addClass('btn-success').text(($(this).text()));
        e.preventDefault();
      });
      //Close the modal when there's a click outside it. (Click in Toast doesn't close the modal)
      if (base.options.wrapperType == 'modal') {
        $(document).mouseup(function (e) {
          var container = $('#' + base.id).find(" .modal-content");
          var toastr = $('.toastr');
          if ((!container.is(e.target)) && (container.has(e.target).length === 0) && (!toastr.is(e.target)) && (toastr.has(e.target).length === 0)) {
            base.deletePlugin();
          }
        });
      }
    };
    //Generation of Random id's between 1 and 10000.
    base.getRandomId = function () {
      return Math.floor((Math.random() * 10000) + 1);
    };
    //Get rest/structure by ajax.
    base.getRestStructure = function () {
      $.ajax({
        url: base.options.restService.host + base.options.restService.structure,
        method: "GET",
        async: false,
        success: function (ajax1Data) {
          base.options.data.restData = (ajax1Data[base.options.restService.structureArrayIndex]);
          $.each(base.options.data.restData, function (key, value) {
            //Loops de data.
            if (base.options.data.restData[key][base.options.restService.innerUriDataAttribute] != null) {
              $.ajax({
                url: base.options.restService.host + base.options.data.restData[key][base.options.restService.innerUriDataAttribute],
                method: "GET",
                async: false,
                success: function (ajax2Data) {
                  //Gets the 'uriData source object' and save it directly into the 'uriData' attribute.
                  base.options.data.restData[key][base.options.restService.innerUriDataAttribute] = ajax2Data;
                },
                error: function () {
                  //If fails getting 'UriData'
                  toastr.error("Couldn't get " + base.options.data.restData[key][base.options.restService.innerUriDataAttribute]);
                }
              });
            }
          });
        },
        error: function () {
          //If fails getting the restStucture.
          toastr.error("Couldn't get Rest Structure");
        }
      });
    };
    base.validate = function () {
      //Variables
      var obj;
      var input;
      var errorObject = {};
      var goodObject = {};
      $.each(base.options.data.restData, function (key) {
        obj = base.options.data.restData[key];
        input = $('#' + base.id).find(" ." + obj['name']);
        //If there's not another object inside 'uriData' of Element [Key] -> Means it's not an optionList
        if (obj['uriData'] == null) {
          if (obj['validation'] == 'required' && input.val() == "") {
            errorObject[(obj['name'])] = obj['name'];
            goodObject[obj['name']] = null;
          } else {
            goodObject[obj['name']] = input.val();
          }
        } else {
          if (obj['validation'] == 'required' && input.text().trim() == obj['label']) {
            errorObject[(obj['name'])] = obj['name'];
            goodObject[obj['name']] = null;
          } else {
            goodObject[obj['name']] = input.text().trim();
          }
        }
      });
      if ($.isEmptyObject(errorObject)) {
        base.deletePlugin();
        base.options.onSaveFunction(goodObject);
      } else {
        if (base.options.validation.fieldRedAdvice) base.changeFieldOnError(errorObject, goodObject);
        if (base.options.validation.toastAdvice) base.options.toastError.createError(errorObject, "Some fields are not OK:");
      }
    };
    
    base.deletePlugin = function () {
      //Removes Form to the DOM.
      $('#' + base.id).remove();
    };
    base.createInput = function (obj) {
      var type = obj['type'];
      var name = obj['name'];
      var types = base.options.htmlInputTypes;
      if (types[type] != undefined) {
        //If types[key] is a string -> It will be render such a HTML 5 Common Type.
        if (typeof(types[type]) == 'string') {
          return base.options.htmlRender.input(types[type], obj['name'], base.options.getReadOnly());
        } else {
        //If we have specified one functionality, it's a function. So here it will be called.  
          return types[type](obj, base);
        }
        //If the type value isn't recognized there will appear a Toast R.
      } else {
        toastr.error("Input type: " + type + " not accepted.");
      }
    };
    base.fillInputs = function () {
      //Function to Fill all the extraData into the inputs of the Form.
      var data = base.options.data.extraData;
      var rest = base.options.data.restData;
      if(data != undefined){
        $.each(rest, function (key) {
          if (data[rest[key]['name']] != null) {
            if (rest[key]['type'] == 'optionList') {
              $("#" + base.id + " ." + rest[key]['name']).addClass('btn-success').text(data[rest[key]['name']]);
            } else {
              $("#" + base.id + " ." + rest[key]['name']).val(data[rest[key]['name']]);
            }
          }
        });
      }
    };
    base.changeFieldOnError = function (errorObject) {
      //Changes The blue color of the field to red when there's bad validation.
      var data = base.options.data.restData;
      $.each(data, function (key) {
        $('#' + base.id).find(".field" + data[key]['name']).removeClass('badFieldLabel').addClass('fieldLabel');
      });
      $.each(errorObject, function (key) {
        $('#' + base.id).find(".field" + errorObject[key]).removeClass('fieldLabel').addClass('badFieldLabel');
      });
    };
    base.init();
  };
  $.DwecProject.Form.defaultOptions = {

    //Rest configuration
    restService: {
      host: "http://tomcat7-mycoachgate.rhcloud.com/rest/",
      structure: "events/structure",
      //Inside events/structure, the structure is stored in the second array called 'fields'
      structureArrayIndex: "fields",
      //Name of the attribute which can contain another object. (That's for optionList inputs)
      //
      innerUriDataAttribute: "uriData"
    },
    //Data used
    data: {
      //Data received to be filled in the input
      extraData: {},
      //Input's structure to be displayed in the form.
      restData: {}
    },
    //The user can set if the form will display toast error's on bad validation.
     //The user can set if the form will change field color to red on bad validation.
    validation: {
      toastAdvice: true,
      fieldRedAdvice: true
    },
    //Allows the user to become the inputs not editable.
    readOnly: false,
    //Getter of the readOnly option.
    getReadOnly: function () {
      if (this.readOnly) {
        return 'readOnly'
      } else {
        return "";
      }
    },

    //Wrapper allows the user to display the form with the next Structures: If there's no one specify, it would be modal by default
    //If the wrapper type is not valid, you will get the 'empty' container.
    //You can specify wrapperTitle and Wrapper Type.
    wrapperType: "modal",
    wrapper: {
      wrapperTitle: "Add Element",
      modal: "<div class='modal fade in' id='{id}' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' style='display: block;'><div class='modal-dialog' role='document'><div class='modal-content FormModalContent'> <div class='modal-header FormModalHeader'> <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button> <h4 class='modal-title' id='myModalLabel'>{title}</h4> </div> <div class='modal-body'>{content}</div></div></div></div>",
      container: "<div id='{id}' class='text-left'><div class='row text-left contTitle inputRow'><h3>{title}<h3></div>{content}</div>",
      empty: "<div id='{id}'><div class='col-xs-12 text-right'><h3>{title}<h3></div>{content}</div>",
      getWrapper: function (wrapperType) {
        if (this[wrapperType] != undefined) {
          return this[wrapperType];
        } else {
          return this['empty'];
        }
      }
    },


    //Rendering of the Buttons.
    renderButtons: function (buttons, buttonFormat) {
      var aux = "";
      $.each(buttons, function (key) {
        aux += buttonFormat.format({
          classes: buttons[key]['classes'],
          mainClass: buttons[key]['mainClass'],
          buttonText: buttons[key]['label']
        });
      });
      return aux;
    },
    //Option to become the bottom buttons hidden. (by default False)
    buttonHidden: false,
    /**
     * Good improvement of Form 2.0
     * Dynamically creation of live buttons. We can specify how we want it, and its functionality.
     * *** We can add another buttons easily and set to it a functionality.
     */
    buttons: [
      {
        classes: "btn btn-primary",
        mainClass: "buttonSave",
        label: "Add Element",
        click: function (base) {
          base.validate();
        }
      },
      {
        classes: "btn btn-default",
        mainClass: "buttonDiscard",
        label: "Discard",
        click: function (base) {
          base.deletePlugin();
        }
      }
    ],
    /**
      - Best improvement of Form 2.0, Form can receive any type of data, in the following option you can add
        a functionality for each one. If it has a string value, it means that it's a common HTML5 input type.

      - Another use: I received a Type STRING from rest service, and here I can do that each string type
        becomes to a text type, or if I want I would be able to set a specifically function for it such as for
        example with html and optionList types.
     */

    htmlInputTypes: {
      'color': 'color',
      'date': 'date',
      'datetime': 'datetime',
      'datetime-local': 'datetime-local',
      'email': 'email',
      'html': function (obj, base) {
        //Rendering of a TextArea (It can be change easily by changing html render).
        return base.options.htmlRender.textArea(obj['name'], base.options.getReadOnly());
      },
      'hidden': 'hidden',
      'month': 'month',
      'number': 'number',
      'optionList': function (obj, base) {
        //Rendering of Dropdown Button
        var input = "";
        $.each(obj['uriData'], function (key2) {
          input += base.options.htmlRender.dropDownElement.format({itemName: obj['uriData'][key2]});
        });
        input = base.options.htmlRender.dropDownButton(obj['name'], obj['label'],input );
        return input;
      },
      'range': 'range',
      'search': 'search',
      'tel': 'tel',
      'text': 'text',
      'string': 'text',
      'time': 'time',
      'url': 'url',
      'week': 'week',
      'json': 'text'
    },
    //In htmlRender there are some html Code to be format by rendering. It has its own formatting functions.
    htmlRender: {
      //Common Row (Option to set an alignment, the option to become it hidden and the content to insert into.
      row: function (rowAlignment, content, hidden) {
        var hid = "";
        hidden ? hid = 'hidden' : hid = '';
        return "<div class='text-{rowAlignment} {hidden}'>{content}</div>".format({
          hidden: hid,
          rowAlignment: rowAlignment,
          content: content
        });
      },
      //Common input row, Here we specify if we want it hidden, the field label, and the input.
      inputRow: function (optionalHidden, label, input) {
        return "<div class='row inputRow {optionalHidden}'>{label} {input}</div>".format({
          optionalHidden: optionalHidden,
          label: label,
          input: input
        });
      },
      //Field label with the 'label-name' got from RestService, styled with fieldLabel CSS class.
      fieldLabel: function (classes, labelName) {
        return "<div class='fieldLabel {classes}'>{labelName}</div>".format({classes: classes, labelName: labelName})
      },
      //common input of HTML5 types. (There's an option to become it not editable[readOnly])
      input: function (type, classes, readOnly) {
        return "<input type='{type}' class='form-control input-circle-right input-right {classes}' {readOnly}>".format({
          type: type,
          classes: classes,
          readOnly: readOnly
        });
      },
      //TextArea input. Can become not editable too [readOnly]
      textArea: function (classes, readOnly) {
        return "<textarea {readOnly} class='form-control input-right textareaStyle {classes}' rows='5' ></textarea>".format({
          classes: classes,
          readOnly: readOnly
        });
      },
      //Common Button Structure.
      button: "<button class='formButton {classes} {mainClass}' id='{buttonID}'>{buttonText}</button>",
      //DropDown structure. Inside elementHtml will go the html list.
      dropDownButton: function (classes, buttonName, elementHtml) {
        return "<div class='dropdown input-right'><button class='btn dropdown-toggle sr-only DropdownButton {classes}' type='button' data-toggle='dropdown'>{buttonName} <span class='caret'></span> </button> <ul class='dropdown-menu DropDownUL scrollable-menu' role='menu' aria-labelledby='dropdownMenu1'>{elementHtml}</ul></div>".format({
          classes: classes,
          buttonName: buttonName,
          elementHtml: elementHtml
        })
      },
      //Simple item list formatted to be inserted in the dropDown.
      dropDownElement: "<li role='presentation' id='{id}' class='listElement'><a role='menuitem' tabindex='-1' href='#'>{itemName}</a> </li>"
    },
    //Error Displaying by ToastR, automatize easily the render of an Error List Toast, such as for example the error Validation.
    toastError: {
      list: "<ul>{listElements}</ul>",
      listElement: "<li>{item}</li>",
      createError: function (errorArray, message) {
        var toast = this;
        if (errorArray == []) {
          toastr.error(message);
        } else {
          var aux = "";
          $.each(errorArray, function (key) {
            aux += toast.listElement.format({item: errorArray[key]});
          });
          toastr.error(message + toast.list.format({listElements: aux}));
        }
      }
    },
    //CallBack function, to interact once all the inputs are validated successfully.
    onSaveFunction: function (data) {
      toastr.success("Element added successfuly");
    },
    onFinishRender:function(){

    }
  };
  $.fn.DwecProject_Form = function (getData, options) {
    return this.each(function () {
      (new $.DwecProject.Form(this, getData, options));
    });
  };
  // This function breaks the chain, but returns
  // the DwecProject.Form if it has been attached to the object.
  $.fn.getDwecProject_Form = function () {
    this.data("DwecProject.Form");
  };
})(jQuery);

