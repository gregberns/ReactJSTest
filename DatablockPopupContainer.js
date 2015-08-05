(function(){

"using strict";

var DatablockContainer = React.createClass({
  //displayName: 'DatablockContainer',
  handleNameChange: function(name) {
    this.setState({name: name});
  },
  handleQueryChange: function(query) {
    this.setState({query: query});
  },
  handleColumnChange: function(col) {
    var db = this.state.datablock
    
    db.updateColumn(col)
    db.calculateColumn(col)

    this.setState({datablock: db })
  },
  getInitialState: function() {
    return {name:'', query: '', datablock: datatableData};
  },
  componentDidMount: function() {
    
  },
  render: function() {

    return (
      <div>
        <h2>Field Editor</h2>
        <div>Name: {this.state.name}</div>
        <NameEditor name={this.state.name} updateName={this.handleNameChange} />
        <br />
        <div>Query: {this.state.query}</div>
        <QueryEditor query={this.state.query} updateQuery={this.handleQueryChange} />
        <br />
        <h2>Datablock Table</h2>
        <DatablockTable datablock={this.state.datablock} />
        <br />
        <h2>Column Editor</h2>
        <ColumnEditor datablock={this.state.datablock} updateColumn={this.handleColumnChange} />
        
      </div>
    );
  }
});

var NameEditor = React.createClass({
  handleNameChange: function() {
    var name = React.findDOMNode(this.refs.name).value.trim();
    //Update Name in Datablock
    this.props.updateName(name);
    return;
  },
  componentDidMount: function() {
    React.findDOMNode(this.refs.name).value = this.props.name;
  },
  render: function() {
    return (
    <div className="name-editor">
      <input type="text" ref="name"></input>
      <input type="button" value="Update" onClick={this.handleNameChange} />
    </div>
    );
  }
});

var QueryEditor = React.createClass({
  handleQueryChange: function() {
    var query = React.findDOMNode(this.refs.query).value.trim();
    //Update Name in Datablock
    this.props.updateQuery(query);
    return;
  },
  componentDidMount: function() {
    React.findDOMNode(this.refs.query).value = this.props.query;
  },
  render: function() {
    return (
    <div className="query-editor">
      <input type="text" ref="query"></input>
      <input type="button" value="Update" onClick={this.handleQueryChange} />
    </div>
    );
  }
});

if (!Function.prototype.construct) {
        Function.prototype.construct = function(argArray) {
            if (! Array.isArray(argArray)) {
                throw new TypeError("Argument must be an array");
            }
            var constr = this;
            var nullaryFunc = Function.prototype.bind.apply(
                constr, [null].concat(argArray));
            //var nullaryFunc = Function.prototype.bind.apply(this,argArray);
            return new nullaryFunc();
        };
    }

var datatableData = { 
  rows: [
          ["cow","sheep"," "],
          ["chicken"," "," "],
          ["goat","donkey","horse"],
          ["pig","cat","dog"]
        ],
  computedRows: [],
  columns:[
            {name:'Col1', fxn: '', calculatedColumn: false}, 
            {name:'Col2', fxn: '', calculatedColumn: false}, 
            {name:'Col3', fxn: '', calculatedColumn: false}
          ],
  updateColumn: function(col){
    var arr = this.columns.filter(function(c){ return c.name === col.name })
    if (arr.length === 0) {
      //column exists
      this.columns.push(col)  
    } else {
      arr[0] = col
    }
  },
  removeColumn: function(col){

  },
  _updateColumnFxn: function() {
    var self = this

    var colArray = self.columns.
      filter(function(c){ return !c.calculatedColumn }).
      map(function(c){ return c.name })

    return self.columns.
                  map(function(c){
                    
                    if (!c.calculatedColumn) return false

                    var cols = colArray.slice();
                    cols.push("return " + c.fxn + ";")

                    try {
                      c['execFxn'] = Function.construct(cols)
                      //To Exec call:
                      //out = fxn.apply(this, rowArray)
                    } catch(e) {
                      console.log("error: "+ c.name)
                    }

                    return c
                  })
  },
  calculateColumn: function(col){
    var self = this

    if (!col.fxn) return

    var cols = this._updateColumnFxn()

    var colIndex = self.columns.map(function(e,i){
      if (e === col) return i
    }).filter(isFinite)

    self.rows.map(function(e, i, a){
      try {
        e[colIndex] = cols[colIndex].execFxn.apply(this, e)
      } catch(e) {
        e[colIndex] = "error"
      }
      return e
    })

  }
};

/*self.columns.
      map(function(e,i,a){
        
        if (!e.calculatedColumn) return false

        var colArray = self.columns.
          filter(function(e){
            return !e.calculatedColumn
          }).
          map(function(e){
            return e.name
          }).
          push("return " + e.fxn + ";")
        
        var rowArray = self.rows[i]

        var out

        try {
          var fxn = Function.construct(colArray)
          //var fxn = new Function("ctx", "return " + e.fxn + ";")
          out = fxn.apply(this, rowArray)
        } catch(e) {
          out = "error"
        }

        console.log(out)
        
      })*/


var DatablockTable = React.createClass({
  render: function(){
    //have a header component
    var rowArray = this.props.datablock.rows.map(function (row, i) {
      return React.addons.createFragment({value: <DatablockRow rowData={row} odd={i%2} />})
    });

    return (
      <div className="tableViewport">
        <div className="grid-canvas">
          <DatablockHeaderRow columns={this.props.datablock.columns} />
          {rowArray}
        </div>
      </div>
    );
  }
});

var DatablockHeaderRow = React.createClass({
  render: function() {
    var cells = this.props.columns.map(function (column){
      return React.addons.createFragment({value: <div className="grid-header-cell">{column.name}</div>})
    });

    return (
      <div className="grid-header-row">
        {cells}
      </div>
      );
  }
});

var DatablockRow = React.createClass({
  render: function() {
    var cells = this.props.rowData.map(function (cellData){
      return React.addons.createFragment({value: <DatablockCell content={cellData} />})
    });

    var parity = this.props.odd ? "odd" : "even";

    var classString = "grid-row "

    classString = classString + parity

    return (
      <div className={classString}>
        {cells}
      </div>
      );
  }
});

var DatablockCell = React.createClass({
  render: function() {
    return (
      <div className="grid-cell">
        {this.props.content}
      </div>
      );
  }
});


//data - datablock info
var ColumnEditor = React.createClass({
  handleSelectedColumnChange: function(columnName){
    this.setState({selectedColumn: this.props.datablock.columns.filter(function(c){ return c.name === columnName })[0] })
  },
  handleUpdateColumnFunction: function(fxnText) {
    var col = this.state.selectedColumn
    col.fxn = fxnText
    this.setState({selectedColumn: col});
    this.props.updateColumn(col)
  },
  handleCreateColumn: function(newName) {
    var col = {name: newName, fxn: "", calculatedColumn: true}
    this.setState({selectedColumn: col})
    this.props.updateColumn(col)
  },
  getInitialState: function() {
    return {selectedColumn: { name: ""}};
  },
  render: function(){

    var additionalColumns = this.props.datablock
                                .columns.filter(function(c){ return c.calculatedColumn })
                                .map(function(column){ return { label: column.name, value: column.name }});

    var invalidNames = this.props.datablock.columns.map(function(c){ return c.name })

    return (
      <div>
        <Select className="columns-list"
                value={this.state.selectedColumn.name || ""}
                options={additionalColumns}
                searchable={false} 
                clearable={false} 
                onChange={this.handleSelectedColumnChange} />
        
        <input type="button" 
               value="Delete" />

        <FieldEditor textPlaceholder="New Column Name..."
                     submitPlaceholder="Add"
                     invalidValues={invalidNames} 
                     onSubmit={this.handleCreateColumn} />

        <ColumnFunctionEditor column={this.state.selectedColumn} 
                              columns={this.props.datablock.columns}
                              updateFunction={this.handleUpdateColumnFunction}  />

      </div>
    );
  }
});

var FieldEditor = React.createClass({
  propTypes: {
    textPlaceholder: React.PropTypes.string,
    submitPlaceholder: React.PropTypes.string,
    invalidValues: React.PropTypes.arrayOf(React.PropTypes.string),
    onSubmit: React.PropTypes.func
  },
  handleTextAreaChange: function(e) {
    this.setState({fieldValue: e.target.value})
  },
  handleSubmit: function(e) {
    e.preventDefault()
    this.props.onSubmit(this.state.fieldValue)
    this.setState({fieldValue: ""})
  },
  getInitialState: function() {
    return {fieldValue: ""};
  },
  render: function(){
    var self = this

    var noDup = !this.props.invalidValues.filter(function(v){ return v.toLowerCase() === self.state.fieldValue.toLowerCase() }).length

    return (
        <form role="form" onSubmit={this.handleSubmit}>
          <input type="text"
                 value={this.state.fieldValue}
                 placeholder={this.props.textPlaceholder}
                 onChange={this.handleTextAreaChange}></input>

          <input type="submit" value={this.props.submitPlaceholder} disabled={!noDup}/>

        </form>
      );
  }
})

//props
//columns
//inputs
//updateFunction(functionString)
var ColumnFunctionEditor = React.createClass({
  handleFxnChange: function(newValue){
    this.props.updateFunction(newValue)
  },
  handleColumnSelected: function(e) {
    //this.props.updateFunction(this.props.column.fxn + '#'+ e.target.text + '#')
    this.props.updateFunction(this.props.column.fxn + e.target.text)
  },
  render: function(){
    var self = this;

    var columns = this.props.columns.map(function(column){
      return React.addons.createFragment({value: <option value={column} 
                                                         onClick={self.handleColumnSelected}>{column.name}</option>})
    });

    return (
      <div>
        <h3>Edit Column Function</h3>

        <TextArea ref="fxnValue" 
                  placeholder='Enter column function...'
                  onChange={this.handleFxnChange}
                  text={this.props.column.fxn} 
                  modifyText={this.modifyText} />

        <select className="columns-list" size="5">
          {columns}
        </select>

      </div>
      );
  }
});

//The textarea tag has some complexity to it
//this wraps up those issues and provides an easier interface
//No state is held in it, rather, changes can be listened to, and state managed elsewhere
var TextArea = React.createClass({
  handleTextChange: function(newValue){
    //this fires on every character entered
    if (this.props.onChange) {
      this.props.onChange(newValue)
    }
  },
  render: function(){
    var valueLink = {
      value: this.props.text,
      requestChange: this.handleTextChange
    }

    var placeholder = this.props.placeholder || ''

    return (<textarea valueLink={valueLink} placeholder={placeholder}></textarea>)
  }
});

//This is the logic in the 'old' TextArea
//Notice how I would store state, then require the parent to call into 'modifyText' to add the extra column!
//By removing the state, and pushing it up to the parent container, it makes the code much simpler.
//Now we just throw changes up to the parent, and 
/*var TextArea = React.createClass({
  handleValueChange: function(newValue){
    //this fires on every character entered
    this.setState({textValue: newValue})
    if (this.props.onChange) {
      this.props.onChange(newValue)
    }
  },
  modifyText: function(fxn){
    var v = fxn(this.state.textValue)
    this.setState({textValue: v})
  },
  getText: function() {
    return this.state.textValue
  },
  getInitialState: function() {
    return {textValue: ''};
  },
  render: function(){
    var valueLink = {
      value: this.state.textValue,
      requestChange: this.handleValueChange
    }

    var placeholder = this.props.placeholder || ''

    return (<textarea valueLink={valueLink} placeholder={placeholder}></textarea>)
  }
});*/

React.render(<DatablockContainer />, document.getElementById('datablock'));

}())