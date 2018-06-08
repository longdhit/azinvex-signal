$("#pushSignal").submit(function (event) {
    $('#loading').show();
    event.preventDefault();
    var $form = $(this),
      symbol = $form.find("input[name='symbol']").val(),
      type = $form.find("input[name='type']:checked").val(),
      stoploss = $form.find("input[name='stoploss']").val(),
      takeprofit = $form.find("input[name='takeprofit']").val(),
      comment = $form.find("select[name='comment']").val(),
      url = $form.attr("action");
  var posting = $.post(url, { symbol, type, stoploss, takeprofit, comment });
    posting.done(function (data) {
      $('#loading').hide();
      $("#noti-error").empty();
        console.log(data.signal)
      const { _id, typeSignal, openPrice, stoploss, takeprofit, startAt, symbol, ticket, comment } = data.signal;
        moment(startAt).fromNow();
        var date = moment(startAt).fromNow();
        var type = "BUY";
        if (typeSignal) type = "SELL"
        $("#signalActive").append(
          `
       <tr id="${ticket}">
       <td>${ticket}</td>
       <td>${type}</td>
       <td>${symbol}</td>
       <td >${openPrice}</td>
       <td id="sl-${ticket}">${stoploss}</td>
       <td class="tp-${ticket}">${takeprofit}</td>
       <td> ${date}</td>
       <td>
       <a id="${ticket}" data-href="/edit/${ticket}" class="stop-signal button is-success">Sửa lệnh</button>
     </td>
       <td><a id="${ticket}" data-href="/close/${ticket}" class="stop-signal button is-danger">Tắt Lệnh</button></td>
       </tr>`
        );
    });
    posting.fail(function(data) {
        $('#loading').hide();
        $("#pushSignal").append(
            `<div class="noti-error notification is-danger">
            Error ${data.responseJSON.error_code}. Please try again !
          </div>`
        )
    });
  });
  $('body').on('click', '.stop-signal', function(){
    $('#loading').show();
    $("#noti-error").remove();
    var id = $(this).attr('id');
    var url = $(this).data('href');
    var getting = $.get(url);
    getting.done(function (data) {
        $('#loading').hide();
        $('#'+data.signal).remove();
        
    })
    getting.fail(function(data) {
        $('#loading').hide();
        $("#pushSignal").append(
            `<div id="noti-error"><div class="notification is-danger">
            Error. Please try again !
          </div></div>`
        )
    });

})

$(document).ready(function () {

  // chinh sua lenh
  $('body').on('click', '.modify-signal', function () {
    var id = $(this).attr('id');
    var sl = $('tr#' + id + ' td')[4].innerHTML.trim();
    var tp = $('tr#' + id + ' td')[5].innerHTML.trim();
    var symbol = $('tr#' + id + ' td')[2].innerHTML.trim();
    $('input[name="stoploss"]').val(sl);
    $('input[name="takeprofit"]').val(tp);
    $('input[name="symbol"]').val(symbol);
    $("select[name='symbol']").attr('disabled', true);
    $("input[name='type']").attr('disabled', true);
    $("#ban_lenh").addClass('is-hidden');
    $("#sua_lenh").data('id', id);
    $("#sua_lenh").removeClass('is-hidden');
    $("#huy_sua").removeClass('is-hidden');

  });

  $("#sua_lenh").click(function (event) {

    $('#loading').show();
    event.preventDefault();
    var ticket = $(this).data('id');
    var stoploss = $('input[name="stoploss"]').val();
    var takeprofit = $('input[name="takeprofit"]').val();
    url = '/edit/' + ticket;
    var posting = $.post(url, {
      stoploss,
      takeprofit
    });
    posting.done(function (data) {
      $('#loading').hide();
      $("#noti-error").empty();
      var sl = $('tr#' + ticket + ' td#sl-' + ticket).text(stoploss);
      var tp = $('tr#' + ticket + ' td#tp-' + ticket).text(takeprofit);
    });
    posting.fail(function (data) {
      $('#loading').hide();
      $("#pushSignal").append(
        `<div class="noti-error notification is-danger">
          Error ${data.responseJSON.error_code}. Please try again !
        </div>`
      )
    });
  });
  $('body').on('click', '#huy_sua', function () {
    $('input[name="stoploss"]').val(0);
    $('input[name="takeprofit"]').val(0);
    $("input[name='symbol']").attr('disabled', false);
    $("input[name='type']").attr('disabled', false);
    $("#ban_lenh").removeClass('is-hidden');
    $("#sua_lenh").addClass('is-hidden');
    $("#huy_sua").addClass('is-hidden');

  });
})