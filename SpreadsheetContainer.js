
//TODO: Make grid look more professional
//https://github.com/danny-sg/slickgrid-spreadsheet-plugins

var Spreadsheet = React.createClass({
  //grid: null,
  //loadDataFromServer: function() {
    // $.ajax({
    //   url: this.props.url,
    //   dataType: 'json',
    //   cache: false,
    //   success: function(data) {
    //     this.setState({data: data});
    //   }.bind(this),
    //   error: function(xhr, status, err) {
    //     console.error(this.props.url, status, err.toString());
    //   }.bind(this)
    // });
  //},
  // handleCommentSubmit: function(comment) {
  //   // TODO: submit to the server and refresh the list
  //   this.state.data.push(comment);
  //   this.setState({data: this.state.data});
  // },
  
  createGrid: function() {
    var self = this;
    
    var options = {
	    editable: true,
	    enableAddRow: true,
	    enableCellNavigation: true,
      enableColumnReorder: false,
	    autoEdit: true,
      asyncEditorLoading: false
	  };
    
    var undoRedoBuffer = {
      	commandQueue : [],
      	commandCtr : 0,

      	queueAndExecuteCommand : function(editCommand) {
        	this.commandQueue[this.commandCtr] = editCommand;
        	this.commandCtr++;
        	editCommand.execute();
      	},

      	undo : function() {
        	if (this.commandCtr == 0)
          	return;

        	this.commandCtr--;
        	var command = this.commandQueue[this.commandCtr];

        	if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
          		command.undo();
        	}
      	},
      	redo : function() {
	        if (this.commandCtr >= this.commandQueue.length)
	          return;
	        var command = this.commandQueue[this.commandCtr];
	        this.commandCtr++;
	        if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
	          command.execute();
	        }
		    }
		}
    
    var pluginOptions = {
    	clipboardCommandHandler: function(editCommand) { 
        undoRedoBuffer.queueAndExecuteCommand.call(undoRedoBuffer,editCommand); 
      },
    	includeHeaderWhenCopying : false
  	};
    
    var columns = [
		    {
		      id: "selector",
		      name: "",
		      field: "_num",
		      width: 30
		    }
		];

  	for (var i = 0; i < 26; i++) {
    	columns.push({
      		id: i,
      		name: String.fromCharCode("A".charCodeAt(0) + i),
      		field: String.fromCharCode("A".charCodeAt(0) + i),
      		width: 60,
      		editor: Slick.Editors.Text
    	});
  	}
    
    // for (var i = 0; i < 2; i++) {
    // 	columns.push({
    //   		id: i,
    //   		name: String.fromCharCode("A".charCodeAt(0) + i),
    //   		field: String.fromCharCode("A".charCodeAt(0) + i),
    //   		width: 60,
    //   		editor: Slick.Editors.Text
    // 	});
  	// }
    
    //Look at this for an Excel like FormulaEditor
    //https://github.com/mleibman/SlickGrid/blob/gh-pages/examples/example-spreadsheet.html

    function FormulaEditor(args) {
      var _self = this;
      var _editor = new Slick.Editors.Text(args);
      var _selector;
      var _grid = args.grid;
      $.extend(this, _editor);
      function init() {
        // register a plugin to select a range and append it to the textbox
        // since events are fired in reverse order (most recently added are executed first),
        // this will override other plugins like moverows or selection model and will
        // not require the grid to not be in the edit mode
        _selector = new Slick.CellRangeSelector();
        _selector.onCellRangeSelected.subscribe(_self.handleCellRangeSelected);
        args.grid.registerPlugin(_selector);
      }
      this.destroy = function () {
        _selector.onCellRangeSelected.unsubscribe(_self.handleCellRangeSelected);
        _grid.unregisterPlugin(_selector);
        _editor.destroy();
      };
      this.handleCellRangeSelected = function (e, args) {
        _editor.setValue(
            _editor.getValue() +
                _grid.getColumns()[args.range.fromCell].name +
                args.range.fromRow +
                ":" +
                _grid.getColumns()[args.range.toCell].name +
                args.range.toRow
        );
      };
      init();
    }
    
    var container = React.findDOMNode(this.refs.spreadsheet);
    
    this.gridDataView = new Slick.Data.DataView();
    this.grid = new Slick.Grid(container, this.gridDataView, columns, options);
    
    
    // this.gridDataView.onRowCountChanged.subscribe(function (e, args) {
    //   self.grid.updateRowCount();
    //   self.grid.render();
    // });
    // this.gridDataView.onRowsChanged.subscribe(function (e, args) {
    //   self.grid.invalidateRows(args.rows);
    //   self.grid.render();
    // });
    $(this.grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
      var columnId = $(this).data("columnId");
      if (columnId != null) {
        columnFilters[columnId] = $.trim($(this).val());
        self.gridDataView.refresh();
      }
    });
    
    var rows = [];
    for (var i = 0; i < 100; i++) {
    	var d = (rows[i] = {});
      d["_num"] = i;
      d["__id"] = i;
    }
    
    this.gridDataView.beginUpdate();
    this.gridDataView.setItems(rows, "__id");
    this.gridDataView.endUpdate();
    
    this.grid.setSelectionModel(new Slick.CellSelectionModel());
    this.grid.getCanvasNode().focus();
    //This makes editing a cell a terrible experience. Probably a bug in the plugin.
    //this.grid.registerPlugin(new Slick.CellExternalCopyManager(pluginOptions));
    this.grid.render();
    
  },
  getInitialState: function() {
    return {grid: null, gridData: []};
  },
  componentDidMount: function() {
    this.createGrid();    
  },
  loadData: function() {
    var self = this;
    if (typeof self.props.gridData !== 'undefined') {
      var data = this._convertDataToGridFormat(self.props.gridData, "__id");
      self.gridDataView.setItems(data, "__id");
      self.grid.invalidate();
    }    
  },
  getData: function() {
    var data = this.gridDataView.getItems();
    data = this._convertDataToStandardFormat(data, "__id");
    return data;
  },
  _convertDataToGridFormat: function(dataArray, idValue){
    
    //This will modify the data array to work with the dataview component
    dataArray.map(function(v,i,a){
      var j = 0;
      for (var key in v) {
        if (v.hasOwnProperty(key)) {
          //Take each property and add a coresponding A,B,C column
          v[String.fromCharCode("A".charCodeAt(0) + j)] = v[key];
          j++;
        }
      }
      //Add the remaining A-Z Columns
      //Doesn't appear to be neccesary if all the columns are set already.
      // for (var k = j; k < 26; k++) {
      //   v[String.fromCharCode("A".charCodeAt(0) + k)]
      // }
      //Add an __id value for the dataview component
      v[idValue] = i;
    });
    
    return dataArray;
  },
  _convertDataToStandardFormat: function(dataArray, idValue) {
    var newDataArray = [];
    var colDict = {};
    
    if (dataArray.length >= 2){
      
      var firstRow = dataArray[0];
      var j = 0;
      for (var key in firstRow) {
        if (firstRow.hasOwnProperty(key)) {
          //ignore any id or num fields
          if (key === idValue || key === "_num") continue;
          //get the column letter based on the iterator 
          //(VERY IMPORTANT: if the columns are out of order this will not work!!)
          var letter = String.fromCharCode("A".charCodeAt(0) + j);
          //See if the column is the same as the key
          if (key !== letter) continue;
          //Get the actual cell value
          var value = firstRow[key]; 
          //Add the column and cell value to dictionary         
          colDict[letter] = value;
          j++;          
        }
      }
      
      //build new data array
      dataArray.map(function(v,i,a){
        //Skip the first row, its column information
        
        //look at the value, and get each item from the dictionary1
        
        
      });
      
    }    
    return newDataArray;    
  },  
  render: function() {
    return (
      <div ref="spreadsheetContainer">
        <div ref="spreadsheet"></div>
        
      </div>
    );
  }
});

var SpreadsheetContainer = React.createClass({
  getInitialState: function() {
    return {gridData: []};
  },
  handleUpdateData: function() {
    var d = [{
        col1: "valueA",
        col2: "valueB"
    }, {
        col1: "valueC",
        col2: "valueD"
    }];
    
    this.setState({gridData: d}, function(){
      this.refs.spreadsheet.loadData();
    });    
  },
  handleGetData: function() {
    var data = this.refs.spreadsheet.getData();
    return data;
  },
  componentDidMount: function() {
    //this.handleUpdateData();
  },
  render: function() {
    return (
      <div>
        <button ref="update" onClick={this.handleUpdateData}>Update</button>
        <button ref="update" onClick={this.handleGetData}>Get Data</button>
        <Spreadsheet ref="spreadsheet" gridData={this.state.gridData} />
      </div>
    );
  }
});

React.render(
  <SpreadsheetContainer />,
  document.getElementById('spreadsheet')
);