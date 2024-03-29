//when the parmas input changes, send the values to server
//when click start redrawing, generate new mapperjson
//the default value of the box changes

$(function() {
  //when click upload button, delete previously
  //shown features and hide select nodes button
  $("#fileupload").bind('click', function() {

    $('#index').children().not(':first').remove();

    //upload file first!
    var form_data = new FormData($('#upload-file')[0]);
    $.ajax({
      type: 'POST',
      url: '/uploadFile',
      data: form_data,
      contentType: false,
      cache: false,
      processData: false,
      async: false,
      success: function(data) {
        //generate checkbox for each features
        //var checkboxesForm = $('#featuresCheck')
        //var featureNormForm = $('#featuresNorm')
        var featuresTable = $('#featuresTable')
        var indexradiobox = $('#index')

        featuresTable.children().remove()


        //$('tr').each(function(){$(this).remove()})

        //generates index selection dropbox and features selection checkboxes
        var genIndexDropbox = $(function() {

          for (i in data.features) {

            var radiodropdown = $("<option value=" + data.features[i] + ">" + data.features[i] + "</option>")
            radiodropdown.appendTo(indexradiobox).trigger('chosen:updated')

          }
        })
        indexradiobox.selectmenu("refresh")

        var genFeaturesCheckBoxes = function() {
          for (i in data.features) {
            var tds = $("<tr>"+"<td style='width:25px'><input type='checkbox' id=fcheckF" + i + " title='勾选此特征作为计算考虑' checked=true value=" + data.features[i] + "></td>"+"<td style='color:white'>"+ data.features[i] +"</td></tr>")
           // var tds = $("<tr>"+"<td style='width:25px'><input type='checkbox' id=fcheckF" + i + " title='勾选此特征作为计算考虑' checked=true value=" + data.features[i] + "></td>"+"<td style='width:40px'><input type='checkbox' title='对此特征进行标准化' id=fcheckNorm" + i + " checked=true value=" + data.features[i] + "></td>"+"<td style='color:white'>"+ data.features[i] +"</td></tr>")
          //  var checkbox = $("<li><a><input type='checkbox' id=fcheckF" + i + " checked=true value=" + data.features[i] + ">" + '<label for=fcheckF' + i + ' class=btn>' + data.features[i] + '</label></a></li>')
          //  checkbox.appendTo(checkboxesForm)
            //var checkboxNorm = $("<li><a><input type='checkbox' id=fcheckNorm" + i + " checked=true value=" + data.features[i] + ">" + '<label for=fcheckNorm' + i + ' class=btn>' + data.features[i] + '</label></a></li>')
            tds.appendTo(featuresTable)
          }
        }
        genFeaturesCheckBoxes()

        $(function() {
          //when select an index column, del the corresbonding checkbox
          $('#index').on('change', function() {

            genFeaturesCheckBoxes()
            var index = $("#index").prop('checked', true).val()
            $('#featuresCheck').children().filter(function() {
              return this.value == index
            }).remove()
            //$('label:contains(' + index + ')').remove()
          })
        })
      },
      error: function(e) {
        console.log(e)
      }
    });

  })
})

////if selected filter support metric selection, then generates metric selection dropbox
$(function() {
  $('#filters').on('change', function() {
    var filter = $('#filters').prop('selected', true).val()
    var DISallowedF = ['kNN_distance', 'distance_to_measure', 'zero_filter']
    var redandentMetrics = $('#metrics').children().not(':first')
    if ($.inArray(filter, DISallowedF) != -1) {
      redandentMetrics.hide()
    } else {
      redandentMetrics.show()
    }

  })
})

$(function() {
  $('#cutoff').on('change', function() {
    if ($(this).val() != 'scale_graph') {
      $('#weighting').hide()
      $('#exponent').hide()
      $('#atag').html('')
    } else {
      $('#weighting').show()
      $('#exponent').show()
      $('#atag').html('Exponent:')
    }
  })
})

$(function() {
  $("#paramsGenerate").bind('click', function() {


    //get checked features and
    var checkedFeatures = []
    $('[id^=fcheckF]:checked').each(function() {
      checkedFeatures.push(this.value)
    })

//    var checkedFeaturesNorm = []
//    $('[id^=fcheckNorm]:checked').each(function() {
//      checkedFeaturesNorm.push(this.value)
//    })
//    console.log(checkedFeaturesNorm)

    //post params
    var index = $("#index").prop('checked', true).val();
    var interval = $("#interval").val();
    var overlap = $("#overlap").val();
    var metric = $('#metrics').prop('selected', true).val();
    var cutoff = $('#cutoff').prop('selected', true).val();
    var weight = $('#weighting').prop('selected', true).val();
    var exponent = $('#exponent').val();
    var data = {
      'interval': interval,
      'overlap': overlap,
      'checkedFeatures': checkedFeatures,
//      'checkedFeaturesNorm': checkedFeaturesNorm,
      'index': index,
      'metric': metric,
      'cutoff': cutoff,
      'weighting': weight,
      'exponent': exponent
    }

    //send to server
    $.ajax({
      type: "POST",
      //mimic the url_for function when this js file is external
      url: "/paramsAjax",
      data: JSON.stringify(data), // null, '\t'),
      contentType: 'application/json;charset=UTF-8',
      success: function(result) {
        console.log('initialization successed!!')
          //when post successed,redraw the graph
      }
    });
    //run Clustering
    //runClustering();
  })
});

$(function() {
  $('#Clustering').bind('click', function() {
    runClustering('/mapperjson');
    //$('#Clustering').hide()

    var interval = $("#interval").val();
    var overlap = $("#overlap").val();
    var metric = $('#metrics').prop('selected', true).val();
    var cutoff = $('#cutoff').prop('selected', true).val();
    var filter = $('#filters').html();

    $('#tdfilter').html(filter)
    $('#tdinterval').html(interval)
    $('#tdoverlap').html(overlap)
    $('#tdcutoff').html(cutoff)
    $('#tdmetric').html(metric)

    $('#saveimg').show()
  })
})

$(function() {
  $('#saveimg').bind('click', function() {

    //save to a mini graph
    var html = new XMLSerializer().serializeToString(document.getElementById(`graph`).querySelector('svg'));
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
    var image = new Image;
    image.src = imgsrc;

    image.onload = function() {
      var id = 'svgimg' + $('[id^=svgimg]').length
      var svgshot = $('<img>').attr('id', id).attr('width', '202px').attr('height', "202px")
        .attr('src', imgsrc);

      var interval = $("#interval").val();
      var overlap = $("#overlap").val();
      var metric = $('#metrics').prop('selected', true).val();
      var cutoff = $('#cutoff').prop('selected', true).val();
      var filter = $('#filters').html();
      var li = $('<div></div>')

      var savedGrapg = $(
        '<li>Filter:' + filter + '</li>' +
        '<li>Interval:' + interval + '</li>' +
        '<li>Overlap:' + overlap + '</li>')

      savedGrapg.appendTo(li)
      svgshot.appendTo(li)
      li.appendTo($('#timemachine'))

      $('img').on('click', function() {
        window.open(imgsrc, 'width:1200;height:1000')
          //send id to server and re-store the graph when successed
        var data = {
          'stateId': id
        }
        $.ajax({
          type: "POST",
          //mimic the url_for function when this js file is external
          url: "/Restore",
          data: JSON.stringify(data), // null, '\t'),
          contentType: 'application/json;charset=UTF-8',
          success: function(result) {
            console.log('I am restoring!!')
              //result = $.parseJSON(result)
            console.log(result)
            console.log(typeof result)
              //when post successed,redraw the graph
            console.log('this id is ' + id)

          }
        });
        $(function() {
          $('[id^=svgimg]').each(function() {
            $(this).bind('click', function() {
              runClustering('/restoreJson/' + $(this).attr('id'))
            })
          })
        })

      })

      //send x,y coo-dinate of nodes to server
      var coordinates = []
      $('circle').each(function() {
        var xy = [$(this).attr('cx'), $(this).attr('cy')]
        coordinates.push(xy)
      })
      var data = {
        'xy': coordinates,
        'stateId': id
      }
      console.log(coordinates)
      $.ajax({
        type: "POST",
        //mimic the url_for function when this js file is external
        url: "/graphstateAjax",
        data: JSON.stringify(data),
        contentType: 'application/json;charset=UTF-8',
        success: function(result) {
          console.log('Graph State recording successed!!')
        }
      });
    }
  })
})



$(function() {
  $('#explain').bind('click', function() {
    var ssc = $('#explainFlists').children().remove()
      //collect
    var dataLi = []
    d3.selectAll('.selected').attr('selected',"")
    $('#selectionNodes').data('tmp','None')

    $('[id^=sebtn]').each(function() {

          $(this).removeClass('ui-state-hover')

      })
    $('[id^=addtemp]').each(function() {
      //release the selections
      $(this).attr('value',0)
      var selection = $(this).data('selected')
      dataLi.push(selection)
    })
    console.log('length!'+dataLi[0].length)
    console.log(dataLi[1].length)
    var data = {
        'selectionA': dataLi[0],
        'selectionB': dataLi[1]
      }
      //send data to server
    $.ajax({
      type: "POST",
      //mimic the url_for function when this js file is external
      url: "/explainAjax",
      data: JSON.stringify(data), // null, '\t'),
      contentType: 'application/json;charset=UTF-8',
      success: function(result) {
        result = $.parseJSON(result)
        var table = $('#explainFlists')
        for (i in result) {
          var Finfo = result[i]
          var domElemt = $('<tr><td>' + Finfo.colname + '</td><td>' + Finfo.p4t + '</td><td>' + Finfo.p4ks + '</td></tr>')
          //var domElemt = $('<li><a>[' + Finfo.colname + ']-T: [' + Finfo.p4t + ']-KS: [' + Finfo.p4ks + ']</a></li>')
          domElemt.appendTo(table)
        }
      }
    });


  })
})
$(function() {
  $('#export2csv').bind('click', function() {
    //export to csv utility
    var indexes = $('#selection').data('tmp')
    var data = {'indexes': indexes}
    console.log(indexes)

    $.ajax({
      type: "POST",
      //mimic the url_for function when this js file is external
      url: "/export_ajax",
      data: JSON.stringify(data), // null, '\t'),
      contentType: 'application/json;charset=UTF-8',
      success: function(data) {
          data = JSON.stringify(eval("(" + data + ")"))
          console.log(data)
          console.log(typeof data)
          console.log(data.redirect)
                 // data.redirect contains the string URL to redirect to
          window.open("exportdownload")
      }
    })

    //$('#export2csv').attr('href', 'data:text/plain;charset=utf8,' + encodeURIComponent(data))
  })
})
