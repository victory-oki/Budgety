var budgetController = (function () {
    // function constructor for income
    var Income = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
    }
    // function constructor for expense
    var Expense = function (id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    }
    Expense.prototype.calcPercentages = function(totalInc){

        if(totalInc > 0){
            this.percentage = Math.round((this.value/totalInc)*100);
        }
        else{
            this.percentage = -1;
        }
    }
    //   calc totals
    var calcTotals = function (type) {
        var sum = 0
        data.allItems[type].forEach(function (cur) {
            sum += cur.value
        })
        data.totals[type] = sum;
    }
    //   data structure for all data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    return {
        //   function to add a new item
        addNewItem: function (type, des, val) {
            var newItem, id;
            /************************************* 
            setting id of the item as (last id +1) 
            or 0 if noting was there previously
            *************************************/
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }
            // creating new item based on type of item
            if (type === "exp") {
                newItem = new Expense(id, des, val);
            } else if (type === 'inc') { newItem = new Income(id, des, val) };
            // pushing item to data-structure based on type of item
            data.allItems[type].push(newItem);
            return newItem;
        },
        testing: function () {
            console.log(data);
        },
        calcBudget: function () {
            // calculate total income and expense
            calcTotals('inc');
            calcTotals('exp');
            // calculate budget
            data.budget = data.totals.inc - data.totals.exp
            // calculate percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },
        calcPercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentages(data.totals.inc);
            })
        },
        getPercentages:function(){
            var allpercs = data.allItems.exp.map(function(cur){
                return cur.percentage;
            })
            return allpercs;
        },
        getBudget: function () {
            return {
                totalinc: data.totals.inc,
                totalexp: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },
        delData:function(type,id){
            var ids,index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            console.log(ids);
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        }
    }

})();

var uiController = (function () {

    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        expensesList: '.expenses__list',
        incomeList: '.income__list',
        budgetVal: '.budget__value',
        incomeVal: '.budget__income--value',
        expenseVal: '.budget__expenses--value',
        percentageVal: '.budget__expenses--percentage',
        container:'.container',
        itemPercentage:'.item__percentage',
        month:'.budget__title--month'
    }
    var formatNumber= function(num,type){
        var numsplit,int,dec,newInt;
        num = Math.abs(num);
        num = num.toFixed(2);
        numsplit = num.split('.');
        int = numsplit[0];
        dec = numsplit[1];
        newInt = '';
        a = 0;
        l = 0
        comma = 1
        // if (int.length%3 === 0){
        iter = parseInt((int.length/3).toFixed(1).split('.')[0]);
        if(iter > 0){
            for(var i = iter; i>0;i--){
                console.log("i'm here");
                if(int.substr(a,int.length-(i*3)) !== ''){
                    newInt += int.substr(a,l===0?int.length-(i*3):3) + ','
                    a = newInt.length-comma;
                    l++;
                    comma++;
                }
                else{
                    newInt = '';
                    a = 0 ;
                }  
            }
            newInt += int.substr(a,3) + '.'+ dec
            return((type === 'exp'? sign = '-': sign = '+') + newInt);
        }
        else if (iter <= 0){
            newInt += int.substr(a,int.length) + '.'+ dec
            return((type === 'exp'? sign = '-': sign = '+') + newInt);
        }
    }
    var nodelistForEach = function(list,callback){
        for(var i = 0; i < list.length;i++){
            callback(list[i],i);
        }
    }
    return {
        numFormat:function(num,type){
            return formatNumber(num,type);
        },
        getInput: function () {
            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            }
        },
        getDom: function () {
            return domStrings;
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            if (type === 'inc') {
                element = domStrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete&#45;&#45;btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type === 'exp') {
                element = domStrings.expensesList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete&#45;&#45;btn"><i class="ion-ios-close-outline"></i></button></div></div> </div>'
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index) {
                current.value = "";
                if (index === 0) {
                    current.focus();
                }
            })
        },
        displayBudget: function (obj) {
            var type;
            obj.budget >= 0? type = 'inc':type ='exp';
            document.querySelector(domStrings.budgetVal).innerHTML=  formatNumber(obj.budget,type);
            document.querySelector(domStrings.incomeVal).innerHTML= formatNumber(obj.totalinc,'inc');
            document.querySelector(domStrings.expenseVal).innerHTML= formatNumber(obj.totalexp,'exp'); 
            if(obj.percentage > 0){
                document.querySelector(domStrings.percentageVal).innerHTML= obj.percentage + "%";
            }else{
                document.querySelector(domStrings.percentageVal).innerHTML= "---"
            }
            
        },
        displayPercentages:function(percentages){
            var itemPercNodeList = document.querySelectorAll(domStrings.itemPercentage);
            
            nodelistForEach(itemPercNodeList,function(cur,index){
                if (percentages[index] > 0){
                    cur.textContent = percentages[index] + '%';
                }
                else{
                    cur.textContent = "---";
                }
                
            })
        },
        delListItem: function(id){
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },
        displayDate:function(){
            // calc date
            var now,year,month,months; 
            months = ['January','February','March','April','May','June','July','August','September','October','November','December']
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            // display date on ui
            document.querySelector(domStrings.month).textContent = months[month] + " " + year;
        },
        changedType:function(){
            var fields = document.querySelectorAll(domStrings.inputType +','+ domStrings.inputValue +','+domStrings.inputDescription)
            nodelistForEach(fields,function(cur,index){
                cur.classList.toggle('red-focus');
            })
            document.querySelector(domStrings.inputBtn).classList.toggle('red');    
        }
    }
})();

var controller = (function (bC, uC) {
    var setupEventListeners = function () {
        var dom = uC.getDom();
        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })
        document.querySelector(dom.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(dom.inputType ).addEventListener('change',uC.changedType);
    }
    var updateBudget = function () {
        // calculate the budget
        bC.calcBudget();
        // return the budget
        var budget = bC.getBudget();
        // display the budget on the ui
        console.log(budget);
        uC.displayBudget(budget);
    }
    var updatePercentages = function(){
        // calculate the percentages
        bC.calcPercentages();
        // read percentages from budget controller
        var percentages = bC.getPercentages()
        // display percentages on ui
        uC.displayPercentages(percentages);
    }
    var ctrlAddItem = function () {
        var input, newItem;
        // get the input field data
        input = uC.getInput();
        if (input.description != '' && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            newItem = bC.addNewItem(input.type, input.description, input.value);
            // add the item to the ui controller
            uC.addListItem(newItem, input.type);
            // clear input fields
            uC.clearFields();
            // calculate and update budget ui
            updateBudget();
            // update percentages
            updatePercentages()
        }

    }
    var ctrlDeleteItem = function(event){
        var id,splitArr,itemType,itemId;
        id = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(id){
            splitArr = id.split('-');
            itemType=splitArr[0];
            itemId = parseInt(splitArr[1]);
        }
        // delete item from data structure
        bC.delData(itemType,itemId);

        // delete item from ui
        uC.delListItem(id);

        // update and show new budget
        updateBudget();

        // update and show new percentages
        updatePercentages()
    }
    return {
        init: function () {
            console.log("application has started");
            uC.displayBudget({
                totalinc: 0,
                totalexp: 0,
                budget: 0,
                percentage: -1
            });
            setupEventListeners();
            uC.displayDate();
        }
    }

})(budgetController, uiController);

controller.init();