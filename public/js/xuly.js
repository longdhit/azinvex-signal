var socket = io('http://signal.azinvex.com/admin');
moment.locale('vi'); 
socket.on('new-signal', function (msg) {
  var audio = new Audio('../plucky.mp3');
  audio.play();
  var { typeSignal, openPrice, stoploss, takeprofit, startAt, symbol, ticket } = msg;
  var type = '<button class="button is-fullwidth is-danger">SELL</button>';
  var date  = moment(startAt).fromNow();
  if (!typeSignal) type = '<button class="button is-fullwidth is-success">BUY</button>';
  $( ".pricing-table" ).prepend( `<div id="${ticket}" class="pricing-plan">
      <div class="plan-header">${symbol}
      </div>
      <div class="plan-items">
        <div class="plan-item">Openprice:  
          <strong>${openPrice}
          </strong>
        </div>
        <div class="plan-item">Takeprofit:  
          <strong>${takeprofit}
          </strong>
        </div>
        <div class="plan-item">Stoploss :   
          <strong>${stoploss}
          </strong>
        </div>
        <div class="plan-item">Time : 
          <strong> ${date}
          </strong>
        </div>
      </div>
      <div class="plan-footer">
        <div class="plan-price">
          <span class="plan-price-amount">
            <span class="plan-price-currency">
            </span>
            <img width="60px" height="60px" src="/images/loading.gif">
            </span></div>

              ${type}
             
        </div>
      </div>` );
  });
  $(document).ready(function(){
    socket.on('result-signal', function (msg) {
        $("#"+msg.ticket).remove();
        var { typeSignal, openPrice, stoploss, takeprofit, startAt, symbol, ticket, profit,closePrice,closeAt } = msg;
        console.log(msg)
        var viewProfit = '<div style="color: green;" class="plan-price">';
        if(profit < 0) viewProfit = '<div style="color: red;" class="plan-price">';
        var type = '<button class="button is-fullwidth is-danger">SELL</button>';
        if (!typeSignal) type = '<button class="button is-fullwidth is-success">BUY</button>';
        const dateclose = moment(closeAt).format('HH:mm DD/MM/YYYY');
        const datestart = moment(startAt).format('HH:mm DD/MM/YYYY');
        $( ".pricing-table" ).prepend( `
        <div class="pricing-plan">
        <div class="plan-header">${symbol}</div>
        <div class="plan-items">
        <div class="plan-item">Open Price:  <strong>${openPrice}</strong></div>
        <div class="plan-item">Takeprofit:  <strong>${takeprofit}</strong></div>
        <div class="plan-item">Open Time : <strong> ${datestart}</strong></div>
        <div class="plan-item">Close Price:  <strong>${closePrice}</strong></div>
        <div class="plan-item">Stoploss :   <strong>${stoploss}</strong></div>
        <div class="plan-item">Close Time : <strong> ${dateclose}</strong></div>
        </div>
        <div class="plan-footer">
        ${viewProfit}
       <span class="plan-price-amount">${profit}</span><b>pips</b></div>
       ${type}
        </div>
    </div>
        ` )
      })
  });