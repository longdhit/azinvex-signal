var date = new Date();
date.setDate(date.getDate()-1);
$("#datepicker").datepicker({
    dateFormat: "dd/mm/yy",
    defaultDate: date,
    onSelect: function () {
        selectedDate = $.datepicker.formatDate("dd/mm/yy", $(this).datepicker('getDate'));
        var url = '/result/'+selectedDate;
        console.log(url)
        var getting = $.get(url);
        getting.done(function (data) {
            console.log(data)
            $('#daily-profit').empty();
            $('#daily-profit').append(data.dailyProfit);
            $('.pricing-table').empty();
            data.signalList.forEach((signal, index) => {
                const { typeSignal, openPrice,closePrice
                ,closeAt, stoploss, takeprofit, startAt, symbol, ticket,profit} = signal;
                moment.locale('vi-VN');
                const dateclose = moment(closeAt).format('HH:mm DD/MM/YYYY');
                const datestart = moment(startAt).format('HH:mm DD/MM/YYYY');
                var profitView = '<div style="color: red;" class="plan-price">';
                var typeView = '<button class="button is-fullwidth is-success">BUY</button>';
                if(typeSignal) typeView = '<button class="button is-fullwidth is-danger">SELL</button>'
                if(profit >= 0) profitView = '<div style="color: green;" class="plan-price">'
                $('.pricing-table').append(`
                <div class="pricing-plan">
                <div class="plan-header">${symbol}</div>
                <div class="plan-items">
                <div class="plan-item">Open Price:  <strong>${openPrice}</strong></div>
                <div class="plan-item">Takeprofit:  <strong>${takeprofit}</strong></div>
                <div class="plan-item">Open Time : <strong>${datestart}</strong></div>
                <div class="plan-item">Close Price:  <strong>${closePrice}</strong></div>
                <div class="plan-item">Stoploss :   <strong>${stoploss}</strong></div>
                <div class="plan-item">Close Time : <strong>${dateclose}</strong></div>
                </div>
                <div class="plan-footer">
                ${profitView}
               <span class="plan-price-amount">${profit}</span><b>pips</b></div>
               ${typeView}
                </div>
            </div>
                `)
            })
        })
    }
});

$("#datepicker").datepicker("setDate", date);