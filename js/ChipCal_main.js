var HeavyfireType = 1
var globaltime = [0, 0, 0, 0]; // global timer, for test and all result counting
var switch_clear = false, switch_maxall = false, switch_blueall = false, switch_orangeall = false
var filter_switch = false, filter_switch_finalpick = false
var topologySet = [], solutionSet = [], topologyNum = 0
var topology_noresult = [56041, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var buffer_topo = [], buffer_solu = [], buffer_num = 10 // for buffer result for ranking
var rules = ['InfinityFrost', 'FatalChapters']
var color = 1, block_dmg = 0, block_dbk = 0, block_acu = 0, block_fil = 0, mul_property = 1, block_class = 56, block_shape = 9
var chipNum = 0
var chipRepo_data = [], chipRepo_chart = []; // Chip data; Repository information that display at repository-table
var analyze_switch = 1, ranking_switch = 1; // show_percentage[1=validProperty,-1=validBlocknum] rank_result_by[1~6]
var global_workdone = false, global_process = 0, global_totalwork = 0, allCombi = 0
var global_refresher
var ignore_setting = new Map
var readorder = ['dmg', 'dbk', 'acu', 'fil',
  'dmgblo', 'dbkblo', 'acublo', 'filblo']

function creatChip (chipNum, chipColor, chipClass, chipType, chipLevel, blockAcu, blockFil, blockDmg, blockDbk, Den_Level) {
  var chipData = { }
  chipData.chipNum = chipNum // chip number
  chipData.color = chipColor // color
  chipData.classNum = chipClass // 56 or 551
  chipData.typeNum = chipType // shape
  chipData.levelNum = chipLevel // strengthen level
  chipData.bAcu = blockAcu // acuracy block num
  chipData.bFil = blockFil // filling block num
  chipData.bDmg = blockDmg // damage block num
  chipData.bDbk = blockDbk; // defence-breaking block num
  chipData.weight = Den_Level // density*level
  return chipData
}
function creatRepo (chipNum, chipType, chipLevel, Acu, Fil, Dmg, Dbk) {
  var repoData = { }
  repoData.chipNum = chipNum
  repoData.chipType = chipType
  repoData.chipLevel = chipLevel
  repoData.Acu = Acu
  repoData.Fil = Fil
  repoData.Dmg = Dmg
  repoData.Dbk = Dbk
  return repoData
}
function changeRepo (typeInfo) { // 刷新仓库显示，1=添加，2=删除某个，3=清空
  var ChipRepoChartId = document.getElementById('ChipRepoChart')
  var DeleteSelectId = document.getElementById('DeleteSelect')
  switch (typeInfo) {
    case 1:
      chipNum++
      var ChipLevel = document.getElementById('ChipLevel').value
      var newChipData = creatChip(chipNum, color, block_class, block_shape, parseInt(ChipLevel), block_acu, block_fil, block_dmg, block_dbk, 1)
      chipRepo_data.push(newChipData)
      repo_addChart(newChipData)
      break
    case 2:
      var deleteNum = parseInt(document.getElementById('DeleteSelect').value)
      for (var i = 0; i < chipNum; i++) {
        if (i + 1 > deleteNum) {
          chipRepo_data[i].chipNum--
          chipRepo_chart[i].chipNum--
        }
      }
      chipRepo_data.splice(deleteNum - 1, 1)
      chipRepo_chart.splice(deleteNum - 1, 1)
      chipNum--
      ChipRepoChartId.innerHTML = '' // CLEAR chart
      deleteSelectHTML = ['<option value=0 selected>' + lib_lang.sele_selenum + '</option>']
      for (var i = 0; i < chipNum; i++) {
        var ChartAdd = ''
        var colorName
        if (chipRepo_data[i].color === 1) colorName = 'b'
        else colorName = 'o'
        var htmlString = '<img src="../img/chip/' + colorName + '_' + chipRepo_data[i].classNum + '-' + chipRepo_data[i].typeNum + '.png">'
        ChartAdd += '<tr>'
        ChartAdd += '<td style="width:13%">' + chipRepo_chart[i].chipNum + '</td>'
        ChartAdd += '<td style="width:22%">' + htmlString + ' ' + chipRepo_chart[i].chipType + '</td>'
        ChartAdd += '<td style="width:13%">' + chipRepo_chart[i].chipLevel + '</td>'
        ChartAdd += '<td style="width:13%">' + chipRepo_chart[i].Acu + '</td>'
        ChartAdd += '<td style="width:13%">' + chipRepo_chart[i].Fil + '</td>'
        ChartAdd += '<td style="width:13%">' + chipRepo_chart[i].Dmg + '</td>'
        ChartAdd += '<td style="width:13%">' + chipRepo_chart[i].Dbk + '</td>'
        ChartAdd += '</tr>'
        ChipRepoChartId.innerHTML += ChartAdd
        deleteSelectHTML.push(('<option value=' + chipRepo_chart[i].chipNum) + ('>' + chipRepo_chart[i].chipNum) + '</option>')
      }
      var selectText = ''
      for (var i = 0; i < deleteSelectHTML.length; i++) selectText += deleteSelectHTML[i]
      DeleteSelectId.innerHTML = selectText
      document.getElementById('deleteChipButton').disabled = true
      break
    case 3:
      if (switch_clear === false) {
        switch_clear = true
        document.getElementById('alert_clear').innerHTML = ' * ' + lib_lang.btn_clear
      } else {
        switch_clear = false
        document.getElementById('alert_clear').innerHTML = ''
        chipRepo_data = []
        chipRepo_chart = []
        chipNum = 0
        ChipRepoChartId.innerHTML = '' // CLEAR chart
        deleteSelectHTML = ['<option value=0 selected>' + lib_lang.sele_selenum + '</option>']
        DeleteSelectId.innerHTML = deleteSelectHTML[0]
        break
      }
  }
  if (chipNum > 0) {
    document.getElementById('SaveButton').disabled = false
    document.getElementById('clearChipButton').disabled = false
    document.getElementById('maxAllButton').disabled = false
    document.getElementById('blueAllButton').disabled = false
    document.getElementById('orangeAllButton').disabled = false
  } else {
    document.getElementById('SaveButton').disabled = true
    document.getElementById('deleteChipButton').disabled = true
    document.getElementById('clearChipButton').disabled = true
    document.getElementById('maxAllButton').disabled = true
    document.getElementById('blueAllButton').disabled = true
    document.getElementById('orangeAllButton').disabled = true
  }
}
function maxAllChip () {
  switch_blueall = false
  switch_orangeall = false
  if (switch_maxall === false) {
    switch_maxall = true
    document.getElementById('alert_maxall').innerHTML = ' * ' + lib_lang.btn_maxall
  } else {
    switch_maxall = false
    document.getElementById('alert_maxall').innerHTML = ''
    var ChipRepoChartId = document.getElementById('ChipRepoChart')
    ChipRepoChartId.innerHTML = ''
    for (var c = 0; c < chipNum; c++) {
      if (chipRepo_data[c].levelNum < 20) {
        chipRepo_data[c].levelNum = 20
        chipRepo_chart[c].chipLevel = '+20'
        if (chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + 'b' || chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + 'd' ||
          chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + '|' || chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + 'C' ||
          chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + 'Z' || chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + 'Z-' ||
          chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + 'V' || chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + 'L' ||
          chipRepo_chart[c].chipType === lib_lang.blo_5 + ' ' + lib_lang.shape + 'L-') {
          chipRepo_chart[c].Acu = Math.ceil(2.5 * Math.ceil(chipRepo_data[c].bAcu * 0.92 * 7.1))
          chipRepo_chart[c].Fil = Math.ceil(2.5 * Math.ceil(chipRepo_data[c].bFil * 0.92 * 5.7))
          chipRepo_chart[c].Dmg = Math.ceil(2.5 * Math.ceil(chipRepo_data[c].bDmg * 0.92 * 4.4))
          chipRepo_chart[c].Dbk = Math.ceil(2.5 * Math.ceil(chipRepo_data[c].bDbk * 0.92 * 12.7))
        } else {
          chipRepo_chart[c].Acu = Math.ceil(2.5 * Math.ceil(chipRepo_data[c].bAcu * 7.1))
          chipRepo_chart[c].Fil = Math.ceil(2.5 * Math.ceil(chipRepo_data[c].bFil * 5.7))
          chipRepo_chart[c].Dmg = Math.ceil(2.5 * Math.ceil(chipRepo_data[c].bDmg * 4.4))
          chipRepo_chart[c].Dbk = Math.ceil(2.5 * Math.ceil(chipRepo_data[c].bDbk * 12.7))
        }
      }
    }
    for (var c = 0; c < chipNum; c++) {
      var colorName
      if (chipRepo_data[c].color === 1) colorName = 'b'
      else colorName = 'o'
      var htmlString = '<img src="../img/chip/' + colorName + '_' + chipRepo_data[c].classNum + '-' + chipRepo_data[c].typeNum + '.png">'
      var ChartAdd = ''
      ChartAdd += '<tr>'
      ChartAdd += '<td style="width:13%">' + chipRepo_chart[c].chipNum + '</td>'
      ChartAdd += '<td style="width:22%">' + htmlString + ' ' + chipRepo_chart[c].chipType + '</td>'
      ChartAdd += '<td style="width:13%">' + chipRepo_chart[c].chipLevel + '</td>'
      ChartAdd += '<td style="width:13%">' + chipRepo_chart[c].Acu + '</td>'
      ChartAdd += '<td style="width:13%">' + chipRepo_chart[c].Fil + '</td>'
      ChartAdd += '<td style="width:13%">' + chipRepo_chart[c].Dmg + '</td>'
      ChartAdd += '<td style="width:13%">' + chipRepo_chart[c].Dbk + '</td>'
      ChartAdd += '</tr>'
      ChipRepoChartId.innerHTML += ChartAdd
    }
  }
}
function blueAllChip () {
  switch_maxall = false
  switch_orangeall = false
  if (switch_blueall === false) {
    switch_blueall = true
    document.getElementById('alert_maxall').innerHTML = ' * ' + lib_lang.btn_blueall
  } else {
    switch_blueall = false
    document.getElementById('alert_maxall').innerHTML = ''
    var mark_orange = [], code = ''
    for (var i = 0; i < chipNum; i++) { // stat orange idx
      if (chipRepo_data[i].color === 2) mark_orange.push(i)
    }
    code = createSaveCode()
    loadSaveCode(code, mark_orange)
  }
}
function orangeAllChip () {
  switch_maxall = false
  switch_blueall = false
  if (switch_orangeall === false) {
    switch_orangeall = true
    document.getElementById('alert_maxall').innerHTML = ' * ' + lib_lang.btn_orangeall
  } else {
    switch_orangeall = false
    document.getElementById('alert_maxall').innerHTML = ''
    var mark_blue = [], code = ''
    for (var i = 0; i < chipNum; i++) { // stat blue idx
      if (chipRepo_data[i].color === 1) mark_blue.push(i)
    }
    code = createSaveCode()
    loadSaveCode(code, mark_blue)
  }
}
function changeTopology (actionId) {
  if (actionId === 0) topologyNum = parseInt(document.getElementById('TopologySelect').value)
  if (actionId === 1) topologyNum++
  if (actionId === 2) topologyNum--
  document.getElementById('TopologySelect').value = topologyNum
  showSolution()
}
function getSaveCode () { // 获取存储码
  var SaveAlertId = document.getElementById('SaveAlert')
  var SaveCodeId = document.getElementById('SaveCode')
  SaveCodeId.value = createSaveCode()
  SaveCodeId.select()
  document.execCommand('Copy')
  SaveAlertId.innerHTML = '<span style="color:#FF0066">&nbsp&nbsp* ' + lib_lang.btn_savedone + '</span>'
}
function createSaveCode () {
  var code = '[' + rules[0].substr(chipNum - 13 * parseInt(chipNum / 13), 1) + '!'
  for (var i = 0; i < chipRepo_data.length; i++) {
    code += (chipRepo_data[i].chipNum + ',')
    code += (chipRepo_data[i].color + ',')
    code += (chipRepo_data[i].classNum + ',')
    code += (chipRepo_data[i].typeNum + ',')
    code += (chipRepo_data[i].levelNum + ',')
    code += (chipRepo_data[i].bAcu + ',')
    code += (chipRepo_data[i].bFil + ',')
    code += (chipRepo_data[i].bDmg + ',')
    code += (chipRepo_data[i].bDbk + ',')
    code += (chipRepo_data[i].weight + '&')
  }
  code += '?' + rules[1].substr(chipNum - 13 * parseInt(chipNum / 13), 1) + ']'
  return code
}
function repo_addChart (chipData) {
  // Add chipRepo_chart
  var stren_parameter = 1
  if (chipData.levelNum <= 10) stren_parameter = 1 + 0.08 * chipData.levelNum
  else stren_parameter = 1.8 + 0.07 * (chipData.levelNum - 10)
  var Repo_Acu
  var Repo_Fil
  var Repo_Dmg
  var Repo_Dbk
  block_class = chipData.classNum
  block_shape = chipData.typeNum
  if (block_class === 551 && (block_shape === 81 || block_shape === 82 || block_shape === 9 || block_shape === 10 || block_shape === 111 || block_shape === 112 || block_shape === 120 || block_shape === 131 || block_shape === 132)) {
    Repo_Acu = Math.ceil(stren_parameter * Math.ceil(chipData.bAcu * 0.92 * 7.1))
    Repo_Fil = Math.ceil(stren_parameter * Math.ceil(chipData.bFil * 0.92 * 5.7))
    Repo_Dmg = Math.ceil(stren_parameter * Math.ceil(chipData.bDmg * 0.92 * 4.4))
    Repo_Dbk = Math.ceil(stren_parameter * Math.ceil(chipData.bDbk * 0.92 * 12.7))
  } else {
    Repo_Acu = Math.ceil(stren_parameter * Math.ceil(chipData.bAcu * 7.1))
    Repo_Fil = Math.ceil(stren_parameter * Math.ceil(chipData.bFil * 5.7))
    Repo_Dmg = Math.ceil(stren_parameter * Math.ceil(chipData.bDmg * 4.4))
    Repo_Dbk = Math.ceil(stren_parameter * Math.ceil(chipData.bDbk * 12.7))
  }
  var Repo_Type = ''
  if (chipData.classNum === 56) {
    Repo_Type += lib_lang.blo_6 + ' '
    if (chipData.typeNum === 1) Repo_Type += lib_lang.shape + '1'
    else if (chipData.typeNum === 2) Repo_Type += lib_lang.shape + '2'
    else if (chipData.typeNum === 3) Repo_Type += lib_lang.shape + '3'
    else if (chipData.typeNum === 41) Repo_Type += lib_lang.shape + '4a'
    else if (chipData.typeNum === 42) Repo_Type += lib_lang.shape + '4b'
    else if (chipData.typeNum === 5) Repo_Type += lib_lang.shape + '5'
    else if (chipData.typeNum === 6) Repo_Type += lib_lang.shape + '6'
    else if (chipData.typeNum === 7) Repo_Type += lib_lang.shape + '7'
    else if (chipData.typeNum === 8) Repo_Type += lib_lang.shape + '8'
    else if (chipData.typeNum === 9) Repo_Type += lib_lang.shape + '9'
  }
  else if (chipData.classNum === 551) {
    Repo_Type += lib_lang.blo_5 + ' '
    if (chipData.typeNum === 11) Repo_Type += lib_lang.shape + 'Fa'
    else if (chipData.typeNum === 12) Repo_Type += lib_lang.shape + 'Fb'
    else if (chipData.typeNum === 21) Repo_Type += lib_lang.shape + 'Na'
    else if (chipData.typeNum === 22) Repo_Type += lib_lang.shape + 'Nb'
    else if (chipData.typeNum === 31) Repo_Type += lib_lang.shape + 'Ya'
    else if (chipData.typeNum === 32) Repo_Type += lib_lang.shape + 'Yb'
    else if (chipData.typeNum === 4) Repo_Type += lib_lang.shape + 'T'
    else if (chipData.typeNum === 5) Repo_Type += lib_lang.shape + 'W'
    else if (chipData.typeNum === 6) Repo_Type += lib_lang.shape + 'X'
    else if (chipData.typeNum === 81) Repo_Type += lib_lang.shape + 'b'
    else if (chipData.typeNum === 82) Repo_Type += lib_lang.shape + 'd'
    else if (chipData.typeNum === 9) Repo_Type += lib_lang.shape + '|'
    else if (chipData.typeNum === 10) Repo_Type += lib_lang.shape + 'C'
    else if (chipData.typeNum === 111) Repo_Type += lib_lang.shape + 'Z'
    else if (chipData.typeNum === 112) Repo_Type += lib_lang.shape + 'Z-'
    else if (chipData.typeNum === 120) Repo_Type += lib_lang.shape + 'V'
    else if (chipData.typeNum === 131) Repo_Type += lib_lang.shape + 'L'
    else if (chipData.typeNum === 132) Repo_Type += lib_lang.shape + 'L-'
  }
  var newRepo = creatRepo(chipData.chipNum, Repo_Type, '+' + chipData.levelNum, Repo_Acu, Repo_Fil, Repo_Dmg, Repo_Dbk)
  chipRepo_chart.push(newRepo)
  // Add chart entry
  var ChipRepoChartId = document.getElementById('ChipRepoChart')
  var DeleteSelectId = document.getElementById('DeleteSelect')
  var colorName = 'b'
  if (chipData.color === 2) colorName = 'o'
  var htmlString = '<img src="../img/chip/' + colorName + '_' + chipData.classNum + '-' + chipData.typeNum + '.png">'
  var ChartAdd = ''
  ChartAdd += '<tr>'
  ChartAdd += '<td style="width:13%">' + chipData.chipNum + '</td>'
  ChartAdd += '<td style="width:22%">' + htmlString + ' ' + newRepo.chipType + '</td>'
  ChartAdd += '<td style="width:13%">' + newRepo.chipLevel + '</td>'
  ChartAdd += '<td style="width:13%">' + newRepo.Acu + '</td>'
  ChartAdd += '<td style="width:13%">' + newRepo.Fil + '</td>'
  ChartAdd += '<td style="width:13%">' + newRepo.Dmg + '</td>'
  ChartAdd += '<td style="width:13%">' + newRepo.Dbk + '</td>'
  ChartAdd += '</tr>'
  ChipRepoChartId.innerHTML += ChartAdd
  // Add delete-chip-selection
  deleteSelectHTML.push(('<option value=' + chipNum) + ('>' + chipNum) + '</option>')
  var selectText = ''
  for (var i = 0; i < deleteSelectHTML.length; i++) selectText += deleteSelectHTML[i]
  DeleteSelectId.innerHTML = selectText
  if (chipNum > 0) {
    document.getElementById('SaveButton').disabled = false
    document.getElementById('clearChipButton').disabled = false
    document.getElementById('maxAllButton').disabled = false
    document.getElementById('blueAllButton').disabled = false
    document.getElementById('orangeAllButton').disabled = false
  } else {
    document.getElementById('SaveButton').disabled = true
    document.getElementById('deleteChipButton').disabled = true
    document.getElementById('clearChipButton').disabled = true
    document.getElementById('maxAllButton').disabled = true
    document.getElementById('blueAllButton').disabled = true
    document.getElementById('orangeAllButton').disabled = true
  }
}
function simpleCheck (LoadCode) { // 简单检查存储码
  if (LoadCode[0] != '[' || LoadCode[LoadCode.length - 1] != ']') return false
  var rule1 = LoadCode[1], rule2 = LoadCode[LoadCode.length - 2]
  var posi1 = [], posi2 = []
  for (var i = 0; i < 13; i++) {
    if (rules[0][i] === rule1) posi1.push(i)
    if (rules[1][i] === rule2) posi2.push(i)
  }
  for (var i = 0; i < posi1.length; i++) {
    for (var j = 0; j < posi2.length; j++) {
      if (posi1[i] === posi2[j]) return true
    }
  }
  return false
}
function setValue (elementNum, tempStr) { // get value from savecode
  if (elementNum === 0) return chipNum + 1
  else if (elementNum === 1) return parseInt(tempStr)
  else if (elementNum === 2) return parseInt(tempStr)
  else if (elementNum === 3) return parseInt(tempStr)
  else if (elementNum === 4) return parseInt(tempStr)
  else if (elementNum === 5) return parseInt(tempStr)
  else if (elementNum === 6) return parseInt(tempStr)
  else if (elementNum === 7) return parseInt(tempStr)
  else if (elementNum === 8) return parseInt(tempStr)
}
function loadSaveCode () { // load save
  var command = arguments['0'], disable_list
  var need_filter = false
  var chipIdx = 0
  var LoadCode
  if (command === undefined) LoadCode = document.getElementById('LoadCode').value
  else {
    LoadCode = command
    disable_list = arguments['1']
    if (disable_list.length > 0) need_filter = true
  }
  var LoadAlertId = document.getElementById('LoadAlert')
  if (simpleCheck(LoadCode)) {
    // reset repository
    chipNum = 0
    chipRepo_chart = [], chipRepo_data = []
    document.getElementById('ChipRepoChart').innerHTML = ''
    chipRepo_chart = []; chipRepo_data = []; deleteSelectHTML = ['<option value=0 selected>' + lib_lang.sele_selenum + '</option>']
    resetPage()
    var scan = 3, elementNum = 0, tempStr = '', disable_count = 0
    var chipEntry = []
    while (LoadCode[scan] != '?') { // '?' means end of code
      if (LoadCode[scan] === ',') {
        chipEntry.push(setValue(elementNum, tempStr))
        elementNum++
        tempStr = ''
      } else if (LoadCode[scan] === '&') { // '&' means next
        if (need_filter && chipIdx == disable_list[disable_count]) {
          disable_count++
          if (disable_count === disable_list.length) need_filter = false
        } else {
          chipRepo_data.push(creatChip(chipEntry[0], chipEntry[1], chipEntry[2], chipEntry[3], chipEntry[4], chipEntry[5], chipEntry[6], chipEntry[7], chipEntry[8], 1))
          chipNum++
          repo_addChart(chipRepo_data[chipRepo_data.length - 1])
        }
        chipIdx++
        elementNum = 0
        tempStr = ''
        chipEntry = []
      } else tempStr += LoadCode[scan]
      scan++
    }
    LoadAlertId.innerHTML = ''
    document.getElementById('SaveAlert').innerHTML = ''
  } else {
    LoadAlertId.innerHTML = '<span style="color:#FF0066">&nbsp&nbsp* ' + lib_lang.btn_loaderror + '</span>'
  }
  resetPage()
}
function manageDeleteButton () {
  var DeleteSelectId = document.getElementById('DeleteSelect')
  if (parseInt(DeleteSelectId.value) > 0) document.getElementById('deleteChipButton').disabled = false
  else document.getElementById('deleteChipButton').disabled = true
}
function changeProperty (command) { // for change color/chipClass/chipShape
  if (command === 'color_b') { // color=blue
    color = 1
  } else if (command === 'color_o') { // color=orange
    color = 2
  } else if (command === 'class') { // chipClass, 56=block_6, 551=block_5_type1
    var SL1 = document.getElementById('ShapeLine1')
    var SL2 = document.getElementById('ShapeLine2')
    var SL3 = document.getElementById('ShapeLine3')
    var SL4 = document.getElementById('ShapeLine4')
    var SL1_html = '', SL2_html = '', SL3_html = '',SL4_html = ''
    if (block_class === 56) {
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-9.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-9")' + "'" + '></td>'
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-8.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-8")' + "'" + '></td>'
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-7.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-7")' + "'" + '></td>'
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-6.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-6")' + "'" + '></td>'
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-5.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-5")' + "'" + '></td>'
      SL1.innerHTML = SL1_html
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-42.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-42")' + "'" + '></td>'
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-41.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-41")' + "'" + '></td>'
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-3.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-3")' + "'" + '></td>'
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-2.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-2")' + "'" + '></td>'
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/6-1.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("6-1")' + "'" + '></td>'
      SL2.innerHTML = SL2_html
      SL3.innerHTML = SL3_html
      SL4.innerHTML = SL4_html
    } else if (block_class === 551) {
      SL1_html += '<td style="width:50px">' + lib_lang.cs_551 + '</td>'
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-12.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-12")' + "'" + '></td>'
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-11.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-11")' + "'" + '></td>'
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-4.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-4")' + "'" + '></td>'
      SL1_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-6.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-6")' + "'" + '></td>'
      SL1.innerHTML = SL1_html
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-31.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-31")' + "'" + '></td>'
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-32.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-32")' + "'" + '></td>'
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-21.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-21")' + "'" + '></td>'
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-22.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-22")' + "'" + '></td>'
      SL2_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-5.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-5")' + "'" + '></td>'
      SL2.innerHTML = SL2_html
      SL3_html += '<td style="width:50px">' + lib_lang.cs_552 + '</td>'
      SL3_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-81.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-81")' + "'" + '></td>'
      SL3_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-82.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-82")' + "'" + '></td>'
      SL3_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-9.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-9")' + "'" + '></td>'
      SL3_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-10.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-10")' + "'" + '></td>'
      SL3.innerHTML = SL3_html
      SL4_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-111.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-111")' + "'" + '></td>'
      SL4_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-112.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-112")' + "'" + '></td>'
      SL4_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-120.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-120")' + "'" + '></td>'
      SL4_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-131.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-131")' + "'" + '></td>'
      SL4_html += '<td style="width:50px"><img src="../img/chip/shapebutton/5-132.png" style="cursor:pointer" onclick=' + "'" + 'changeBigImg("5-132")' + "'" + '></td>'
      SL4.innerHTML = SL4_html
    }
    resetBlock()
  } else if (command === 'level') {
    var level = parseInt((document.getElementById('ChipLevel')).value)
    if (level <= 10) mul_property = 1 + 0.08 * level
    else mul_property = 1.8 + 0.07 * (level - 10)
  }
  refreshPreview()
  manageButton()
}
function changeBigImg (command) { // change preview and change property
  var imgid = document.getElementById('bigsample')
  var imgsrc = imgid.src
  if (command === 'left' || command === 'right') {
    var angleString = '', cutlength = 0
    for (var i = imgsrc.length - 5; i > 0; i--) {
      if (imgsrc[i] === '-') {
        cutlength = i + 1
        break
      }
      else angleString = imgsrc[i] + angleString
    }
    var angle = parseInt(angleString)
    if (command === 'left') angle -= 90
    else angle += 90
    if (angle >= 360) angle = 0
    else if (angle < 0) angle = 270
    imgid.src = imgsrc.substr(0, cutlength) + (angle + '') + '.png'
  } else if (command === 'blue' || command === 'orange') {
    var cutlength = 0, cutleftidx = 0
    for (var i = imgsrc.length - 1; i > 0; i--) {
      if (imgsrc[i] === '/') {
        cutlength = i + 1
        cutleftidx = i + 2
        break
      }
    }
    if (command === 'blue') {
      imgid.src = imgsrc.substr(0, cutlength) + 'b' + imgsrc.substr(cutleftidx)
      document.getElementById('bigsample_blue').src = '../img/chip/bigsample/blue-select.png'
      document.getElementById('bigsample_orange').src = '../img/chip/bigsample/orange-noselect.png'
      changeProperty('color_b')
    } else if (command === 'orange') {
      imgid.src = imgsrc.substr(0, cutlength) + 'o' + imgsrc.substr(cutleftidx)
      document.getElementById('bigsample_blue').src = '../img/chip/bigsample/blue-noselect.png'
      document.getElementById('bigsample_orange').src = '../img/chip/bigsample/orange-select.png'
      changeProperty('color_o')
    }
  } else if (command === 'addblo' || command === 'subblo') {
    if (command === 'addblo') {
      document.getElementById('AddBloBtn').src = '../img/chip/bigsample/add-block-dis.png'
      document.getElementById('SubBloBtn').src = '../img/chip/bigsample/sub-block.png'
      document.getElementById('AddBloBtn').style = 'cursor:default'
      document.getElementById('SubBloBtn').style = 'cursor:pointer'
      block_class = 56
      block_shape = 9
      if (color === 1) imgid.src = '../img/chip/bigsample/b_56-9-0.png'
      else if (color === 2) imgid.src = '../img/chip/bigsample/o_56-9-0.png'
      changeProperty('class')
    } else if (command === 'subblo') {
      document.getElementById('AddBloBtn').src = '../img/chip/bigsample/add-block.png'
      document.getElementById('SubBloBtn').src = '../img/chip/bigsample/sub-block-dis.png'
      document.getElementById('AddBloBtn').style = 'cursor:pointer'
      document.getElementById('SubBloBtn').style = 'cursor:default'
      block_class = 551
      block_shape = 12
      if (color === 1) imgid.src = '../img/chip/bigsample/b_551-12-0.png'
      else if (color === 2) imgid.src = '../img/chip/bigsample/o_551-12-0.png'
      changeProperty('class')
    }
  } else if (command === '6-1' || command === '6-2' || command === '6-3' || command === '6-41' || command === '6-42' || command === '6-5' || command === '6-6' || command === '6-7' || command === '6-8' || command === '6-9') {
    var colorStr = 'b'
    if (color === 2) colorStr = 'o'
    if (command === '6-1') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-1-0.png'
    else if (command === '6-2') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-2-0.png'
    else if (command === '6-3') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-3-0.png'
    else if (command === '6-41') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-41-0.png'
    else if (command === '6-42') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-42-0.png'
    else if (command === '6-5') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-5-0.png'
    else if (command === '6-6') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-6-0.png'
    else if (command === '6-7') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-7-0.png'
    else if (command === '6-8') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-8-0.png'
    else if (command === '6-9') imgid.src = '../img/chip/bigsample/' + colorStr + '_56-9-0.png'
    block_shape = parseInt(command.substr(2))
  } else if (command === '5-11' || command === '5-12' || command === '5-21' || command === '5-22' || command === '5-31' || command === '5-32' || command === '5-4' || command === '5-5' || command === '5-6' || command === '5-81' || command === '5-82' || command === '5-9' || command === '5-10' || command === '5-111' || command === '5-112' || command === '5-120' || command === '5-131' || command === '5-132') {
    var colorStr = 'b'
    if (color === 2) colorStr = 'o'
    if (command === '5-11') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-11-0.png'
    else if (command === '5-12') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-12-0.png'
    else if (command === '5-21') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-21-0.png'
    else if (command === '5-22') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-22-0.png'
    else if (command === '5-31') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-31-0.png'
    else if (command === '5-32') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-32-0.png'
    else if (command === '5-4') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-4-0.png'
    else if (command === '5-5') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-5-0.png'
    else if (command === '5-6') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-6-0.png'
    else if (command === '5-81') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-81-0.png'
    else if (command === '5-82') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-82-0.png'
    else if (command === '5-9') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-9-0.png'
    else if (command === '5-10') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-10-0.png'
    else if (command === '5-111') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-111-0.png'
    else if (command === '5-112') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-112-0.png'
    else if (command === '5-120') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-120-0.png'
    else if (command === '5-131') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-131-0.png'
    else if (command === '5-132') imgid.src = '../img/chip/bigsample/' + colorStr + '_551-132-0.png'
    block_shape = parseInt(command.substr(2))
  }
  refreshPreview()
}

function chartBack (typeInfo) {
  HeavyfireType = typeInfo
  document.getElementById('HFSwitch1').className = 'btn btn-outline btn-primary'
  document.getElementById('HFSwitch2').className = 'btn btn-outline btn-warning'
  document.getElementById('HFSwitch3').className = 'btn btn-outline btn-warning'
  document.getElementById('HFSwitch4').className = 'btn btn-outline btn-primary'
  document.getElementById('HFSwitch5').className = 'btn btn-outline btn-primary'
  var name_str = (document.getElementById('HFSwitch' + HeavyfireType).className).split(' ')
  document.getElementById('HFSwitch' + HeavyfireType).className = name_str[0] + ' ' + name_str[2]
  var line1 = document.getElementById('solutionLine1')
  var line2 = document.getElementById('solutionLine2')
  var line3 = document.getElementById('solutionLine3')
  var line4 = document.getElementById('solutionLine4')
  var line5 = document.getElementById('solutionLine5')
  var line6 = document.getElementById('solutionLine6')
  var line7 = document.getElementById('solutionLine7')
  var line8 = document.getElementById('solutionLine8')
  switch (typeInfo) {
    case 1:
      Process_Text_Dmg.innerHTML = '0/190'
      Process_Text_Dbk.innerHTML = '0/329'
      Process_Text_Acu.innerHTML = '0/191'
      Process_Text_Fil.innerHTML = '0/49'
      line1.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td>'
      line2.innerHTML = '<td class="td_black"><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black">'
      line3.innerHTML = '<td class="td_black"><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black">'
      line4.innerHTML = '<td class="td_black"><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black">'
      line5.innerHTML = '<td class="td_black"><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black">'
      line6.innerHTML = '<td class="td_black"><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black">'
      line7.innerHTML = '<td class="td_black"><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black">'
      line8.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td>'
      document.getElementById('M2_options').innerHTML = ''
      break
    case 2:
      Process_Text_Dmg.innerHTML = '0/106'
      Process_Text_Dbk.innerHTML = '0/130'
      Process_Text_Acu.innerHTML = '0/120'
      Process_Text_Fil.innerHTML = '0/233'
      line1.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td>'
      line2.innerHTML = '<td class="td_black"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td>'
      line3.innerHTML = '<td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_black"></td><td class="td_black"></td>'
      line4.innerHTML = '<td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_black"></td>'
      line5.innerHTML = '<td class="td_black"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td>'
      line6.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td>'
      line7.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_black"></td>'
      line8.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_black"></td><td class="td_black"></td>'
      document.getElementById('M2_options').innerHTML = ''
      break
    case 3:
      Process_Text_Dmg.innerHTML = '0/227'
      Process_Text_Dbk.innerHTML = '0/58'
      Process_Text_Acu.innerHTML = '0/90'
      Process_Text_Fil.innerHTML = '0/107'
      line1.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td>'
      line2.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_orangeback"></td><td class="td_black"></td><td class="td_black"></td><td class="td_orangeback"></td><td class="td_black"></td><td class="td_black"></td>'
      line3.innerHTML = '<td class="td_black"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_black"></td>'
      line4.innerHTML = '<td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td>'
      line5.innerHTML = '<td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td>'
      line6.innerHTML = '<td class="td_black"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_orangeback"></td><td class="td_black"></td>'
      line7.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_orangeback"></td><td class="td_black"></td><td class="td_black"></td><td class="td_orangeback"></td><td class="td_black"></td><td class="td_black"></td>'
      line8.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td>'
      document.getElementById('M2_options').innerHTML = ''
      break
    case 4:
      Process_Text_Dmg.innerHTML = '0/206'
      Process_Text_Dbk.innerHTML = '0/60'
      Process_Text_Acu.innerHTML = '0/97'
      Process_Text_Fil.innerHTML = '0/148'
      line1.innerHTML = '<td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_black"><td class="td_black"><td class="td_black"><td class="td_black"><td class="td_blueback">'
      line2.innerHTML = '<td class="td_black"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_black"><td class="td_black"><td class="td_blueback"><td class="td_blueback">'
      line3.innerHTML = '<td class="td_black"><td class="td_black"><td class="td_blueback"><td class="td_blueback"><td class="td_black"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback">'
      line4.innerHTML = '<td class="td_black"><td class="td_black"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_black">'
      line5.innerHTML = '<td class="td_black"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_black"><td class="td_black">'
      line6.innerHTML = '<td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_black"><td class="td_blueback"><td class="td_blueback"><td class="td_black"><td class="td_black">'
      line7.innerHTML = '<td class="td_blueback"><td class="td_blueback"><td class="td_black"><td class="td_black"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback"><td class="td_black">'
      line8.innerHTML = '<td class="td_blueback"><td class="td_black"><td class="td_black"><td class="td_black"><td class="td_black"><td class="td_blueback"><td class="td_blueback"><td class="td_blueback">'
      document.getElementById('M2_options').innerHTML = '<input type="checkbox" id="M2_can_unfill"> ' + lib_lang.check_M2
      break
    case 5:
      Process_Text_Dmg.innerHTML = '0/169'
      Process_Text_Dbk.innerHTML = '0/261'
      Process_Text_Acu.innerHTML = '0/190'
      Process_Text_Fil.innerHTML = '0/90'
      line1.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td>'
      line2.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black"></td><td class="td_black"></td>'
      line3.innerHTML = '<td class="td_black"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black"></td>'
      line4.innerHTML = '<td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black"></td><td class="td_black"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td>'
      line5.innerHTML = '<td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black"></td><td class="td_black"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td>'
      line6.innerHTML = '<td class="td_black"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black"></td>'
      line7.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black"></td><td class="td_black"></td>'
      line8.innerHTML = '<td class="td_black"></td><td class="td_black"></td><td class="td_black"></td><td class="td_blueback"></td><td class="td_blueback"></td><td class="td_black"></td><td class="td_black"></td><td class="td_black"></td>'
      document.getElementById('M2_options').innerHTML = ''
      break
  }
  ignore_UI()
}
function countMS (td1, td2, timeclip) { return (timeclip + (60 * td2.getMinutes() + td2.getSeconds()) * 1000 + td2.getMilliseconds()) - ((60 * td1.getMinutes() + td1.getSeconds()) * 1000 + td1.getMilliseconds()); }
function notIn (num, rank) {
  var ranklen = rank.length
  for (var i = 0; i < ranklen; i++) if (rank[i] === num) return false
  return true
}
function refresh_displayUI () {
  document.getElementById('ChipComboChart').innerHTML = ''
  document.getElementById('sort_btn_content').innerHTML = ''
  document.getElementById('TopologySelect').innerHTML = ''
  document.getElementById('TopologySelect').disabled = true
  document.getElementById('SolutionSelect').innerHTML = ''
  document.getElementById('SolutionSelect').disabled = true
  document.getElementById('Process_Bar_Dmg').style = 'width:0%'
  document.getElementById('Process_Bar_Dbk').style = 'width:0%'
  document.getElementById('Process_Bar_Acu').style = 'width:0%'
  document.getElementById('Process_Bar_Fil').style = 'width:0%'
  document.getElementById('AnalyzeSwitch').disabled = true
  document.getElementById('AdTp').disabled = true
  document.getElementById('SbTp').disabled = true
  document.getElementById('AdCo').disabled = true
  document.getElementById('SbCo').disabled = true
  document.getElementById('SortInfo').innerHTML = ''
}
function getTopology () {
  // img init
  refresh_displayUI()
  // calculate
  globaltime[0] = 0
  global_workdone = false
  filter_switch_finalpick = false // 当所有组合都筛选完才能进进入总筛选
  global_process = 0
  topologySet = [], solutionSet = []
  var validSet
  var chipShape_5 = [[11, 0], [12, 0], [21, 0], [22, 0], [31, 0], [32, 0], [4, 0], [5, 0], [6, 0]]
  var chipShape_5_2 = [[81, 0], [82, 0], [9, 0], [10, 0], [111, 0], [112, 0], [120, 0], [131, 0], [132, 0]]
  var chipShape_6 = [[1, 0], [2, 0], [3, 0], [41, 0], [42, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0]]
  for (var i = 0; i < chipNum; i++) {
    if (chipRepo_data[i].classNum === 551) {
      if (chipRepo_data[i].typeNum === 11) chipShape_5[0][1]++
      else if (chipRepo_data[i].typeNum === 12) chipShape_5[1][1]++
      else if (chipRepo_data[i].typeNum === 21) chipShape_5[2][1]++
      else if (chipRepo_data[i].typeNum === 22) chipShape_5[3][1]++
      else if (chipRepo_data[i].typeNum === 31) chipShape_5[4][1]++
      else if (chipRepo_data[i].typeNum === 32) chipShape_5[5][1]++
      else if (chipRepo_data[i].typeNum === 4) chipShape_5[6][1]++
      else if (chipRepo_data[i].typeNum === 5) chipShape_5[7][1]++
      else if (chipRepo_data[i].typeNum === 6) chipShape_5[8][1]++
      else if (chipRepo_data[i].typeNum === 81) chipShape_5_2[0][1]++
      else if (chipRepo_data[i].typeNum === 82) chipShape_5_2[1][1]++
      else if (chipRepo_data[i].typeNum === 9) chipShape_5_2[2][1]++
      else if (chipRepo_data[i].typeNum === 10) chipShape_5_2[3][1]++
      else if (chipRepo_data[i].typeNum === 111) chipShape_5_2[4][1]++
      else if (chipRepo_data[i].typeNum === 112) chipShape_5_2[5][1]++
      else if (chipRepo_data[i].typeNum === 120) chipShape_5_2[6][1]++
      else if (chipRepo_data[i].typeNum === 131) chipShape_5_2[7][1]++
      else if (chipRepo_data[i].typeNum === 132) chipShape_5_2[8][1]++
    }
    else if (chipRepo_data[i].classNum === 56) {
      if (chipRepo_data[i].typeNum === 1) chipShape_6[0][1]++
      else if (chipRepo_data[i].typeNum === 2) chipShape_6[1][1]++
      else if (chipRepo_data[i].typeNum === 3) chipShape_6[2][1]++
      else if (chipRepo_data[i].typeNum === 41) chipShape_6[3][1]++
      else if (chipRepo_data[i].typeNum === 42) chipShape_6[4][1]++
      else if (chipRepo_data[i].typeNum === 5) chipShape_6[5][1]++
      else if (chipRepo_data[i].typeNum === 6) chipShape_6[6][1]++
      else if (chipRepo_data[i].typeNum === 7) chipShape_6[7][1]++
      else if (chipRepo_data[i].typeNum === 8) chipShape_6[8][1]++
      else if (chipRepo_data[i].typeNum === 9) chipShape_6[9][1]++
    }
  }
  if (HeavyfireType === 1 || HeavyfireType === 2 || HeavyfireType === 3) validSet = searchValid(chipShape_6, chipShape_5, HeavyfireType)
  else if (HeavyfireType === 4) {
    validSet = searchValid(chipShape_6, chipShape_5.concat(chipShape_5_2), HeavyfireType)
  }
  else if (HeavyfireType === 5) {
    validSet = searchValid(chipShape_6, [[11, 0], [12, 0], [21, 0], [22, 0], [31, 0], [32, 0], [4, 0], [5, 0], [6, 0]], HeavyfireType)
  }
  var allTopoNum = validSet.length
  // get topology
  for (var num_topo = 0; num_topo < allTopoNum; num_topo++) {
    if (HeavyfireType === 1) {
      if (validSet[num_topo] < topologyLibRefer_BGM_1.length) topologySet.push(topologyLib_BGM_1[validSet[num_topo]])
      else topologySet.push(topologyLib_BGM_2[validSet[num_topo] - topologyLibRefer_BGM_1.length])
    } else if (HeavyfireType === 2) topologySet.push(topologyLib_AGS[validSet[num_topo]])
    else if (HeavyfireType === 3) topologySet.push(topologyLib_2B14[validSet[num_topo]])
    else if (HeavyfireType === 4) {
      if (document.getElementById('M2_can_unfill').checked) {
        if (validSet[num_topo] < topologyLibRefer_M2_6x6.length) topologySet.push(topologyLib_M2_6x6[validSet[num_topo]])
        else topologySet.push(topologyLib_M2_6x5n5[validSet[num_topo] - topologyLibRefer_M2_6x6.length])
      } else {
        topologySet.push(topologyLib_M2[validSet[num_topo]])
      }
    }
    else if (HeavyfireType === 5) topologySet.push(topologyLib_AT4_6x6[validSet[num_topo]])
  }
  allCombi = 0
  if (topologySet.length > 0) {
    if (filter_switch) { // show sort
      global_refresher = setInterval(refresh_timebar, 100)
      buffer_solu = [], buffer_topo = []
      buffer_num = parseInt(document.getElementById('best_num').value)
      document.getElementById('TopologySelect').disabled = true
      document.getElementById('TopologySelect').innerHTML = '<option value=0 selected>' + lib_lang.sele_selebest + '</option>'
      var topoNum = topologySet.length
      global_totalwork = topoNum
      check_if_done()
    } else { // show all
      buffer_num = -1
      var soluNum = topologySet.length
      var TopologySelect = document.getElementById('TopologySelect')
      TopologySelect.disabled = false
      var RTText = '<option value=0 selected>' + lib_lang.topo + ' 1</option>'
      for (var i = 1; i < soluNum; i++) {
        RTText += '<option value=' + i + '>' + lib_lang.topo + ' ' + (i + 1) + '</option>'
      }
      TopologySelect.innerHTML = RTText
      var NoResultTextId = document.getElementById('NoResultText')
      NoResultTextId.innerHTML = ''
      topologyNum = 0
      showSolution()
    }
  } else {
    var NoResultTextId = document.getElementById('NoResultText')
    NoResultTextId.innerHTML = '<span style="color:#FF0066">&nbsp&nbsp* ' + lib_lang.notopo + '</span>'
    var TopologySelect = document.getElementById('TopologySelect')
    TopologySelect.disabled = true
    var RTText = '<option value=1 selected>' + lib_lang.toponum + '</option>'
  }
}

function check_if_done () {
  if (global_workdone) {
    filter_switch_finalpick = true
    solutionSet = buffer_solu
    sortSolution(ranking_switch)
    if (solutionSet.length > buffer_num) {
      var buffer_solu_cut = []
      for (var i = 0; i < buffer_num; i++) buffer_solu_cut.push(solutionSet[i])
      solutionSet = buffer_solu_cut
    }
    var bufferlen = solutionSet.length
    for (var i = 0; i < bufferlen; i++) {
      var topoString = solutionSet[i].pop()
      topoString = topoString.substr(0, topoString.length - 1)
      buffer_topo.push(topologySet[parseInt(topoString)])
    }
    var SSText = ''
    if (bufferlen > 0) {
      for (var i = 0; i < bufferlen; i++) {
        SSText += '<option value=' + i + '>' + lib_lang.num + ' '
        var c_num = solutionSet[i].length
        for (var c = 0; c < c_num; c++) SSText += (solutionSet[i][c] + ' ')
        SSText += '</option>'
      }
    } else {
      SSText = '<option value=-1>' + lib_lang.sele_noresult + '</option>'
    }
    document.getElementById('SortInfo').innerHTML = ''
    SolutionSelect.innerHTML = SSText
    refresh_timebar()
    showAnalyze()
    SolutionSelect.disabled = false
  } else {
    var td1 = new Date()
    solutionSet = getSolution(topologySet[global_process])
    allCombi += solutionSet.length
    sortSolution(ranking_switch)
    if (solutionSet.length > 0) {
      buffer_solu.push(solutionSet[0].concat(((global_process + '') + 't')))
    }
    global_process++
    if (global_process === global_totalwork) {
      global_workdone = true
      clearInterval(global_refresher)
    }
    var td2 = new Date()
    globaltime[0] += countMS(td1, td2, 10)
    setTimeout(check_if_done, 10)
  }
}
function refresh_timebar () {
  document.getElementById('soluText').innerHTML = seperate_thousands(allCombi)
  document.getElementById('timeText').innerHTML = lib_lang.totaltime + (globaltime[0] / 1000).toFixed(2) + 's'
  document.getElementById('processText').innerHTML = Math.ceil(100 * global_process / global_totalwork)
  document.getElementById('Process_Bar_Time').style = 'width:' + Math.ceil(100 * global_process / global_totalwork) + '%'
}
function seperate_thousands (num) {
  var new_format = num + ''
  var count = 0
  for (var i = new_format.length - 1; i > 0; i--) {
    if (count < 2) count++
    else {
      new_format = new_format.substr(0, i) + ',' + new_format.substr(i)
      count = 0
    }
  }
  return new_format
}

function isPossible (chipShape_65, chipRefer, border) {
  for (var i = 0; i < border; i++) if (parseInt(chipRefer[i]) > chipShape_65[i][1]) return false
  return true
}
// function getChipShape6_total (chipShape_6) {
//   var total = 0
//   for (var e of chipShape_6) total += e[1]
//   return total
// }
function searchValid (chipShape_6, chipShape_5, HeavyfireType) {
  var chipShape_65 = chipShape_6.concat(chipShape_5)
  var validSet = []
  var searchlen = [0, 0, 0]
  if (HeavyfireType === 1) {
    searchlen[0] = topologyLibRefer_BGM_1.length
    searchlen[1] = topologyLibRefer_BGM_2.length
  } else if (HeavyfireType === 2) {
    searchlen[0] = topologyLibRefer_AGS.length
  } else if (HeavyfireType === 3) {
    searchlen[0] = topologyLibRefer_2B14.length
  } else if (HeavyfireType === 4) {
    searchlen[0] = topologyLibRefer_M2_6x6.length
    searchlen[1] = topologyLibRefer_M2_6x5n5.length
    searchlen[2] = topologyLibRefer_M2.length
  } else if (HeavyfireType === 5) {
    searchlen[0] = topologyLibRefer_AT4_6x6.length
  }
  if (HeavyfireType === 1) {
    for (var i = 0; i < searchlen[0]; i++) {
      if (isPossible(chipShape_65, topologyLibRefer_BGM_1[i], 10)) validSet.push(i) // BGM 6x6
    }
    for (var i = 0; i < searchlen[1]; i++) {
      if (isPossible(chipShape_65, topologyLibRefer_BGM_2[i], 19)) validSet.push(i + searchlen[0]) // BGM 6x5+5
    }
  } else if (HeavyfireType === 2) {
    for (var i = 0; i < searchlen[0]; i++) {
      if (isPossible(chipShape_65, topologyLibRefer_AGS[i], 19)) validSet.push(i)
    }
  } else if (HeavyfireType === 3) {
    for (var i = 0; i < searchlen[0]; i++) {
      if (isPossible(chipShape_65, topologyLibRefer_2B14[i], 19)) validSet.push(i)
    }
  } else if (HeavyfireType === 4) {
    if (document.getElementById('M2_can_unfill').checked) {
      for (var i = 0; i < searchlen[0]; i++) {
        if (isPossible(chipShape_65, topologyLibRefer_M2_6x6[i], 10)) validSet.push(i) // M2 6x6
      }
      for (var i = 0; i < searchlen[1]; i++) {
        if (isPossible(chipShape_65, topologyLibRefer_M2_6x5n5[i], 19)) validSet.push(i + searchlen[0]) // M2 6x5+5
      }
    } else {
      for (var i = 0; i < searchlen[2]; i++) {
        if (isPossible(chipShape_65, topologyLibRefer_M2[i], 28)) validSet.push(i) // M2 full with 552
      }
    }
  } else if (HeavyfireType === 5) {
    for (var i = 0; i < searchlen[0]; i++) {
      if (isPossible(chipShape_65, topologyLibRefer_AT4_6x6[i], 10)) validSet.push(i) // AT4 6x6
    }
  }
  return validSet
}
function showTopology (solution, HeavyfireType) {
  var line1 = document.getElementById('solutionLine1')
  var line2 = document.getElementById('solutionLine2')
  var line3 = document.getElementById('solutionLine3')
  var line4 = document.getElementById('solutionLine4')
  var line5 = document.getElementById('solutionLine5')
  var line6 = document.getElementById('solutionLine6')
  var line7 = document.getElementById('solutionLine7')
  var line8 = document.getElementById('solutionLine8')
  var lineSet = [line1, line2, line3, line4, line5, line6, line7, line8]
  var htmlSet = []
  if (HeavyfireType === 4) {
    // '<td class="td_blueback"></td>'
    htmlSet.push(['<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_blueback"></td>'])
    htmlSet.push(['<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>'])
    htmlSet.push(['<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>'])
    htmlSet.push(['<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>'])
    htmlSet.push(['<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>'])
    htmlSet.push(['<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>'])
    htmlSet.push(['<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_black"></td>'])
    htmlSet.push(['<td class="td_blueback"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>', '<td class="td_blueback"></td>'])
  } else {
    for (var i = 0; i < 8; i++) htmlSet.push(['<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>', '<td class="td_black"></td>'])
  }
  switch (HeavyfireType) {
    case 1:
      var soluChipNum = solution.length
      for (var i = 0; i < soluChipNum; i++) {
        putChip(1, 1, 6, i, solution[i], htmlSet)
      }
      break
    case 2:
      var soluChipNum = solution.length
      for (var i = 0; i < soluChipNum; i++) {
        putChip(0, 0, 8, i, solution[i], htmlSet)
      }
      break
    case 3:
      var soluChipNum = solution.length
      for (var i = 0; i < soluChipNum; i++) {
        putChip(0, 1, 8, i, solution[i], htmlSet)
      }
      break
    case 4:
      var soluChipNum = solution.length
      for (var i = 0; i < soluChipNum; i++) {
        putChip(0, 0, 8, i, solution[i], htmlSet)
      }
      break
    case 5:
      var soluChipNum = solution.length
      for (var i = 0; i < soluChipNum; i++) {
        putChip(0, 0, 8, i, solution[i], htmlSet)
      }
      break
  }
  for (var i = 0; i < 8; i++) {
    var htmlText = ''
    for (var j = 0; j < 8; j++) {
      htmlText += htmlSet[i][j]
    }
    lineSet[i].innerHTML = htmlText
  }
}
function putChip (bios_x, bios_y, border_x, chipOrder, chipRank, htmlSet) {
  var ranklen = chipRank.length
  for (var i = 1; i < ranklen; i++) {
    if (chipRank[i] === 1) htmlSet[parseInt((i - 1) / border_x) + bios_y][i - border_x * parseInt((i - 1) / border_x) - 1 + bios_x] = '<td class="td_b' + (chipOrder - 7 * parseInt(chipOrder / 7) + 1) + '">' + '</td>'
  }
}

function changeAnalyze (actionId) {
  var SolutionSelect = document.getElementById('SolutionSelect')
  var SSV = parseInt(SolutionSelect.value)
  if (actionId === 1) SSV++
  if (actionId === 2) SSV--
  SolutionSelect.value = SSV
  showAnalyze()
}
function showAnalyze () {
  var AdTp = document.getElementById('AdTp')
  var SbTp = document.getElementById('SbTp')
  var AdCo = document.getElementById('AdCo')
  var SbCo = document.getElementById('SbCo')
  var topoV = parseInt(document.getElementById('TopologySelect').value)
  var combV = parseInt(document.getElementById('SolutionSelect').value)
  var Process_Text_Dmg = document.getElementById('Process_Text_Dmg')
  var Process_Text_Dbk = document.getElementById('Process_Text_Dbk')
  var Process_Text_Acu = document.getElementById('Process_Text_Acu')
  var Process_Text_Fil = document.getElementById('Process_Text_Fil')
  var DmgAlert = document.getElementById('DmgAlert')
  var DbkAlert = document.getElementById('DbkAlert')
  var AcuAlert = document.getElementById('AcuAlert')
  var FilAlert = document.getElementById('FilAlert')
  var Process_Bar_Dmg = document.getElementById('Process_Bar_Dmg')
  var Process_Bar_Dbk = document.getElementById('Process_Bar_Dbk')
  var Process_Bar_Acu = document.getElementById('Process_Bar_Acu')
  var Process_Bar_Fil = document.getElementById('Process_Bar_Fil')
  if (solutionSet.length > 0) {
    var SSNum = parseInt(document.getElementById('SolutionSelect').value)
    var c_num = solutionSet[SSNum].length
    document.getElementById('AnalyzeSwitch').disabled = false
    // show topology image
    if (filter_switch) {
      showTopology(buffer_topo[SSNum], HeavyfireType)
      document.getElementById('sort_btn_content').innerHTML = ''
    } else {
      showTopology(topologySet[topologyNum], HeavyfireType)
      var sbcHTML = ''
      sbcHTML += '<button type="button" class="btn btn-outline btn-danger" style="height:35px;width:130px;padding:0px" onclick="changeRankingSwitch(1)" id="SortButton_AllPro"><img src="../img/icon-allhfpro.png"></button>'
      sbcHTML += ' <button type="button" class="btn btn-default" style="height:35px;width:40px;padding:0px" onclick="changeRankingSwitch(3)" id="SortButton_Dmg"><img src="../img/icon-dmg.png"></button>'
      sbcHTML += ' <button type="button" class="btn btn-default" style="height:35px;width:40px;padding:0px" onclick="changeRankingSwitch(4)" id="SortButton_Dbk"><img src="../img/icon-dbk.png"></button>'
      sbcHTML += ' <button type="button" class="btn btn-default" style="height:35px;width:40px;padding:0px" onclick="changeRankingSwitch(5)" id="SortButton_Acu"><img src="../img/icon-acu.png"></button>'
      sbcHTML += ' <button type="button" class="btn btn-default" style="height:35px;width:40px;padding:0px" onclick="changeRankingSwitch(6)" id="SortButton_Fil"><img src="../img/icon-fil.png"></button>'
      document.getElementById('sort_btn_content').innerHTML = sbcHTML
      document.getElementById('SortButton_AllPro').disabled = false
      document.getElementById('SortButton_Dmg').disabled = false
      document.getElementById('SortButton_Dbk').disabled = false
      document.getElementById('SortButton_Acu').disabled = false
      document.getElementById('SortButton_Fil').disabled = false
    }
    // show pick chips in chart
    var ChipComboChart = document.getElementById('ChipComboChart')
    ChipComboChart.innerHTML = ''
    for (var c = 0; c < c_num; c++) {
      var colorName
      if (chipRepo_data[solutionSet[SSNum][c] - 1].color === 1) colorName = 'b'
      else colorName = 'o'
      var htmlString = '<img src="../img/chip/' + colorName + '_' + chipRepo_data[solutionSet[SSNum][c] - 1].classNum + '-' + chipRepo_data[solutionSet[SSNum][c] - 1].typeNum + '.png">'
      var ChartAdd = ''
      ChartAdd += '<tr>'
      ChartAdd += '<td>'
      if (c === 0) ChartAdd += '<span style="color:dodgerblue">▇ </span>'
      else if (c === 1) ChartAdd += '<span style="color:deepskyblue">▇ </span>'
      else if (c === 2) ChartAdd += '<span style="color:greenyellow">▇ </span>'
      else if (c === 3) ChartAdd += '<span style="color:limegreen">▇ </span>'
      else if (c === 4) ChartAdd += '<span style="color:orange">▇ </span>'
      else if (c === 5) ChartAdd += '<span style="color:#FF0066">▇ </span>'
      else if (c === 6) ChartAdd += '<span style="color:fuchsia">▇ </span>'
      ChartAdd += chipRepo_chart[solutionSet[SSNum][c] - 1].chipNum + '</td>'
      ChartAdd += '<td>' + htmlString + ' ' + chipRepo_chart[solutionSet[SSNum][c] - 1].chipType + '</td>'
      ChartAdd += '<td>' + chipRepo_chart[solutionSet[SSNum][c] - 1].chipLevel + '</td>'
      ChartAdd += '<td>' + chipRepo_chart[solutionSet[SSNum][c] - 1].Acu + '</td>'
      ChartAdd += '<td>' + chipRepo_chart[solutionSet[SSNum][c] - 1].Fil + '</td>'
      ChartAdd += '<td>' + chipRepo_chart[solutionSet[SSNum][c] - 1].Dmg + '</td>'
      ChartAdd += '<td>' + chipRepo_chart[solutionSet[SSNum][c] - 1].Dbk + '</td>'
      ChartAdd += '</tr>'
      ChipComboChart.innerHTML += ChartAdd
    }
    // enable and disable topology & solution switch
    if (topoV === 0 || filter_switch) SbTp.disabled = true
    else SbTp.disabled = false
    if (topoV === topologySet.length - 1 || filter_switch) AdTp.disabled = true
    else AdTp.disabled = false
    if (combV === 0) SbCo.disabled = true
    else SbCo.disabled = false
    if (combV === solutionSet.length - 1) AdCo.disabled = true
    else AdCo.disabled = false
    // show percentage of property or blocknum
    if (analyze_switch === 1) {
      document.getElementById('AnalyzeSwitch').innerHTML = lib_lang.btn_showblock
      document.getElementById('AnalyzeSwitch').className = 'btn btn-outline btn-success'
      var dmg = 0, dbk = 0, acu = 0, fil = 0
      var dmg_max = 0, dbk_max = 0, acu_max = 0, fil_max = 0
      if (HeavyfireType === 1) { dmg_max = 190; dbk_max = 329; acu_max = 191; fil_max = 46; }
      else if (HeavyfireType === 2) { dmg_max = 106; dbk_max = 130; acu_max = 120; fil_max = 233; }
      else if (HeavyfireType === 3) { dmg_max = 227; dbk_max = 58; acu_max = 90; fil_max = 107; }
      else if (HeavyfireType === 4) { dmg_max = 206; dbk_max = 60; acu_max = 97; fil_max = 148; }
      else if (HeavyfireType === 5) { dmg_max = 169; dbk_max = 261; acu_max = 190; fil_max = 90; }
      for (var c = 0; c < c_num; c++) {
        dmg += chipRepo_chart[solutionSet[SSNum][c] - 1].Dmg
        dbk += chipRepo_chart[solutionSet[SSNum][c] - 1].Dbk
        acu += chipRepo_chart[solutionSet[SSNum][c] - 1].Acu
        fil += chipRepo_chart[solutionSet[SSNum][c] - 1].Fil
      }
      if (dmg > dmg_max) {
        Process_Text_Dmg.innerHTML = '<span style="color:red">' + dmg + '</span>' + '/' + dmg_max
        DmgAlert.innerHTML = '* ' + lib_lang.over_dmg
        Process_Bar_Dmg.style = 'width:100%'
      } else {
        Process_Text_Dmg.innerHTML = dmg + '/' + dmg_max
        DmgAlert.innerHTML = ''
        Process_Bar_Dmg.style = ('width:' + (dmg / dmg_max).toFixed(2) * 100 + '%')
      }
      if (dbk > dbk_max) {
        Process_Text_Dbk.innerHTML = '<span style="color:red">' + dbk + '</span>' + '/' + dbk_max
        DbkAlert.innerHTML = '* ' + lib_lang.over_dbk
        Process_Bar_Dbk.style = 'width:100%'
      }else {
        Process_Text_Dbk.innerHTML = dbk + '/' + dbk_max
        DbkAlert.innerHTML = ''
        Process_Bar_Dbk.style = ('width:' + (dbk / dbk_max).toFixed(2) * 100 + '%')
      }
      if (acu > acu_max) {
        Process_Text_Acu.innerHTML = '<span style="color:red">' + acu + '</span>' + '/' + acu_max
        AcuAlert.innerHTML = '* ' + lib_lang.over_acu
        Process_Bar_Acu.style = 'width:100%'
      } else {
        Process_Text_Acu.innerHTML = acu + '/' + acu_max
        AcuAlert.innerHTML = ''
        Process_Bar_Acu.style = ('width:' + (acu / acu_max).toFixed(2) * 100 + '%')
      }
      var fil_to_interval = 0
      var fil_base = 0
      if (HeavyfireType === 1) fil_base = 99 + 9
      else if (HeavyfireType === 2) fil_base = 465 + 46
      else if (HeavyfireType === 3) fil_base = 194 + 22
      else if (HeavyfireType === 4) fil_base = 225 + 28
      else if (HeavyfireType === 5) fil_base = 161 + 15
      if (fil > fil_max) {
        fil_to_interval = ((Math.ceil(45000 / (300 + fil_max + fil_base))) / 30).toFixed(2)
        Process_Text_Fil.innerHTML = '<span style="color:red">' + fil + '</span>' + '/' + fil_max + ' (' + fil_to_interval + 's/a) '
        FilAlert.innerHTML = '* ' + lib_lang.over_fil
        Process_Bar_Fil.style = 'width:100%'
      } else {
        fil_to_interval = ((Math.ceil(45000 / (300 + fil + fil_base))) / 30).toFixed(2)
        Process_Text_Fil.innerHTML = fil + '/' + fil_max + ' (' + fil_to_interval + 's/a) '
        FilAlert.innerHTML = ''
        Process_Bar_Fil.style = ('width:' + (fil / fil_max).toFixed(2) * 100 + '%')
      }
    } else if (analyze_switch === -1) {
      document.getElementById('AnalyzeSwitch').innerHTML = lib_lang.btn_showvalue
      document.getElementById('AnalyzeSwitch').className = 'btn btn-outline btn-warning'
      var dmg_blo = 0, dbk_blo = 0, acu_blo = 0, fil_blo = 0
      var dmg_blomax = 0, dbk_blomax = 0, acu_blomax = 0, fil_blomax = 0
      if (HeavyfireType === 1) { dmg_blomax = 18; dbk_blomax = 11; acu_blomax = 11; fil_blomax = 4; }
      else if (HeavyfireType === 2) { dmg_blomax = 10; dbk_blomax = 4; acu_blomax = 7; fil_blomax = 17; }
      else if (HeavyfireType === 3) { dmg_blomax = 21; dbk_blomax = 2; acu_blomax = 6; fil_blomax = 8; }
      else if (HeavyfireType === 4) { dmg_blomax = 19; dbk_blomax = 2; acu_blomax = 6; fil_blomax = 10; }
      else if (HeavyfireType === 5) { dmg_blomax = 16; dbk_blomax = 8; acu_blomax = 10; fil_blomax = 6; }
      for (var c = 0; c < c_num; c++) {
        dmg_blo += chipRepo_data[solutionSet[SSNum][c] - 1].bDmg
        dbk_blo += chipRepo_data[solutionSet[SSNum][c] - 1].bDbk
        acu_blo += chipRepo_data[solutionSet[SSNum][c] - 1].bAcu
        fil_blo += chipRepo_data[solutionSet[SSNum][c] - 1].bFil
      }
      if (dmg_blo > dmg_blomax) {
        Process_Text_Dmg.innerHTML = '<span style="color:red">' + dmg_blo + '</span>' + '/' + dmg_blomax
        DmgAlert.innerHTML = '* ' + lib_lang.over_dmg
        Process_Bar_Dmg.style = 'width:100%'
      } else {
        Process_Text_Dmg.innerHTML = dmg_blo + '/' + dmg_blomax
        DmgAlert.innerHTML = ''
        Process_Bar_Dmg.style = ('width:' + (dmg_blo / dmg_blomax).toFixed(2) * 100 + '%')
      }
      if (dbk_blo > dbk_blomax) {
        Process_Text_Dbk.innerHTML = '<span style="color:red">' + dbk_blo + '</span>' + '/' + dbk_blomax
        DbkAlert.innerHTML = '* ' + lib_lang.over_dbk
        Process_Bar_Dbk.style = 'width:100%'
      } else {
        Process_Text_Dbk.innerHTML = dbk_blo + '/' + dbk_blomax
        DbkAlert.innerHTML = ''
        Process_Bar_Dbk.style = ('width:' + (dbk_blo / dbk_blomax).toFixed(2) * 100 + '%')
      }
      if (acu_blo > acu_blomax) {
        Process_Text_Acu.innerHTML = '<span style="color:red">' + acu_blo + '</span>' + '/' + acu_blomax
        AcuAlert.innerHTML = '* ' + lib_lang.over_acu
        Process_Bar_Acu.style = 'width:100%'
      } else {
        Process_Text_Acu.innerHTML = acu_blo + '/' + acu_blomax
        AcuAlert.innerHTML = ''
        Process_Bar_Acu.style = ('width:' + (acu_blo / acu_blomax).toFixed(2) * 100 + '%')
      }
      if (fil_blo > fil_blomax) {
        Process_Text_Fil.innerHTML = '<span style="color:red">' + fil_blo + '</span>' + '/' + fil_blomax
        FilAlert.innerHTML = '* ' + lib_lang.over_fil
        Process_Bar_Fil.style = 'width:100%'
      } else {
        Process_Text_Fil.innerHTML = fil_blo + '/' + fil_blomax
        FilAlert.innerHTML = ''
        Process_Bar_Fil.style = ('width:' + (fil_blo / fil_blomax).toFixed(2) * 100 + '%')
      }
    }
  } else {
    document.getElementById('sort_btn_content').innerHTML = ''
    // show topology(no result) image
    showTopology(topology_noresult, HeavyfireType)
    // show pick chips in chart
    var ChipComboChart = document.getElementById('ChipComboChart').innerHTML = ''
    // enable and disable topology & solution switch
    if (topoV === 0) SbTp.disabled = true
    else SbTp.disabled = false
    if (topoV === topologySet.length - 1) AdTp.disabled = true
    else AdTp.disabled = false
    SbCo.disabled = true
    AdCo.disabled = true
    // show percentage of property or blocknum
    if (analyze_switch === 1) {
      document.getElementById('AnalyzeSwitch').innerHTML = lib_lang.btn_showblock
      document.getElementById('AnalyzeSwitch').className = 'btn btn-outline btn-success'
      var dmg_max = 0, dbk_max = 0, acu_max = 0, fil_max = 0
      if (HeavyfireType === 1) { dmg_max = 190; dbk_max = 329; acu_max = 191; fil_max = 46; }
      else if (HeavyfireType === 2) { dmg_max = 106; dbk_max = 130; acu_max = 120; fil_max = 233; }
      else if (HeavyfireType === 3) { dmg_max = 227; dbk_max = 58; acu_max = 90; fil_max = 107; }
      else if (HeavyfireType === 4) { dmg_max = 206; dbk_max = 60; acu_max = 97; fil_max = 148; }
      else if (HeavyfireType === 5) { dmg_max = 169; dbk_max = 261; acu_max = 190; fil_max = 90; }
      Process_Text_Dmg.innerHTML = 0 + '/' + dmg_max
      DmgAlert.innerHTML = ''
      Process_Bar_Dmg.style = ('width:0%')
      Process_Text_Dbk.innerHTML = 0 + '/' + dbk_max
      DbkAlert.innerHTML = ''
      Process_Bar_Dbk.style = ('width:0%')
      Process_Text_Acu.innerHTML = 0 + '/' + acu_max
      AcuAlert.innerHTML = ''
      Process_Bar_Acu.style = ('width:0%')
      Process_Text_Fil.innerHTML = 0 + '/' + fil_max
      FilAlert.innerHTML = ''
      Process_Bar_Fil.style = ('width:0%')
    } else if (analyze_switch === -1) {
      document.getElementById('AnalyzeSwitch').innerHTML = lib_lang.btn_showvalue
      document.getElementById('AnalyzeSwitch').className = 'btn btn-outline btn-warning'
      var dmg_blomax = 0, dbk_blomax = 0, acu_blomax = 0, fil_blomax = 0
      if (HeavyfireType === 1) { dmg_blomax = 18; dbk_blomax = 11; acu_blomax = 11; fil_blomax = 4; }
      else if (HeavyfireType === 2) { dmg_blomax = 10; dbk_blomax = 4; acu_blomax = 7; fil_blomax = 17; }
      else if (HeavyfireType === 3) { dmg_blomax = 21; dbk_blomax = 2; acu_blomax = 6; fil_blomax = 8; }
      else if (HeavyfireType === 4) { dmg_blomax = 19; dbk_blomax = 2; acu_blomax = 6; fil_blomax = 10; }
      else if (HeavyfireType === 5) { dmg_blomax = 16; dbk_blomax = 8; acu_blomax = 10; fil_blomax = 6; }
      Process_Text_Dmg.innerHTML = 0 + '/' + dmg_blomax
      DmgAlert.innerHTML = ''
      Process_Bar_Dmg.style = ('width:0%')
      Process_Text_Dbk.innerHTML = 0 + '/' + dbk_blomax
      DbkAlert.innerHTML = ''
      Process_Bar_Dbk.style = ('width:0%')
      Process_Text_Acu.innerHTML = 0 + '/' + acu_blomax
      AcuAlert.innerHTML = ''
      Process_Bar_Acu.style = ('width:0%')
      Process_Text_Fil.innerHTML = 0 + '/' + fil_blomax
      FilAlert.innerHTML = ''
      Process_Bar_Fil.style = ('width:0%')
    }
  }
}
function showSolution () {
  solutionSet = getSolution(topologySet[topologyNum])
  SolutionSelect.disabled = false
  sortSolution(ranking_switch)
  showAnalyze()
}
function getSolution (topology) {
  var tempChipRepo = []; // 待选芯片数据的二维数组
  var topolen = topology.length
  var type = [], typeNum = [], totalType = 0
  var pickIdx = []; // 二维数组，存放芯片选取组合的索引
  var changeIdx = 0
  var solution = []; // 二维数组，存放芯片选取组合的编号
  for (var i = 0; i < topolen; i++) { // 记录芯片形状和对应数量
    var chipCode = parseInt(topology[i][0])
    if (notIn(chipCode, type)) {
      totalType++
      type.push(chipCode)
      typeNum.push(1)
    } else {
      for (var c = 0; c < totalType; c++) if (chipCode === type[c]) typeNum[c]++
    }
  }
  for (var t = 0; t < totalType; t++) {
    tempChipRepo.push(searchChipSet(type[t])); // 把对应芯片全备份
    pickIdx.push([])
    for (var n = 0; n < typeNum[t]; n++) pickIdx[t].push(n); // 初始化选取
  }
  var solutionRank_init = []
  for (var t = 0; t < totalType; t++) {
    for (var n = 0; n < typeNum[t]; n++) {
      solutionRank_init.push(tempChipRepo[t][pickIdx[t][n]].chipNum)
    }
  }
  solution.push(solutionRank_init)
  changeIdx = totalType - 1; // 从最后一类开始变
  while (changeIdx > -1) {
    var changeCom = changeCombination(pickIdx[changeIdx], tempChipRepo[changeIdx].length)
    if (changeCom.length > 0) { // 有新的解
      pickIdx[changeIdx] = changeCom
      var solutionRank = []
      for (var t = 0; t < totalType; t++) {
        for (var n = 0; n < typeNum[t]; n++) {
          solutionRank.push(tempChipRepo[t][pickIdx[t][n]].chipNum)
        }
      }
      solution.push(solutionRank)
      changeIdx = totalType - 1
    } else {
      pickIdx[changeIdx] = []
      for (var n = 0; n < typeNum[changeIdx]; n++) pickIdx[changeIdx].push(n); // 初始化选取
      changeIdx--
    }
  }
  return solution
}
function changeCombination (rank, pickLimit) {
  var currentCombination = rank
  var cuComlen = currentCombination.length
  var isCompact = true
  for (var i = cuComlen - 1; i > 0; i--) {
    if (currentCombination[i] - currentCombination[i - 1] != 1) {
      isCompact = false
      break
    }
  }
  if (isCompact && (currentCombination[cuComlen - 1] === pickLimit - 1)) return []; // 紧凑且触底
  else {
    var changeIdx = cuComlen - 1
    while (true) {
      if (currentCombination[changeIdx] < pickLimit - 1) {
        currentCombination[changeIdx]++
        return currentCombination
      } else {
        for (var i = changeIdx; i > 0; i--) {
          if (currentCombination[i] - currentCombination[i - 1] != 1) {
            changeIdx = i - 1
            currentCombination[changeIdx]++
            break
          }
        }
        while (changeIdx < cuComlen - 1) {
          changeIdx++
          currentCombination[changeIdx] = currentCombination[changeIdx - 1] + 1
        }
        return currentCombination
      }
    }
  }
}
function searchChipSet (chipCode) {
  var chipString = chipCode + ''
  var tempChipSet = []
  var class_num, type_num
  if (chipString.substr(0, 3) === '551') class_num = 551
  else class_num = 56
  type_num = parseInt(chipString.substr(3))
  for (var i = 0; i < chipNum; i++) if (chipRepo_data[i].classNum === class_num && chipRepo_data[i].typeNum === type_num) tempChipSet.push(chipRepo_data[i])
  return tempChipSet
}
function editLevel (actionInfo) {
  var ChipLevel = document.getElementById('ChipLevel')
  if (actionInfo === 1) ChipLevel.value = parseInt(ChipLevel.value) + 1
  else if (actionInfo === 2) ChipLevel.value = parseInt(ChipLevel.value) - 1
  else if (actionInfo === 3) ChipLevel.value = 20
  else if (actionInfo === 4) ChipLevel.value = 10
  else if (actionInfo === 5) ChipLevel.value = 0
  changeProperty('level')
  manageButton()
}
function compare_sumpro (solu_a, solu_b) {
  var value_a = 0, value_b = 0
  var dmg_a = 0, dmg_b = 0, dbk_a = 0, dbk_b = 0, acu_a = 0, acu_b = 0, fil_a = 0, fil_b = 0
  var dmg_max = 0, dbk_max = 0, acu_max = 0, fil_max = 0
  if (HeavyfireType === 1) { dmg_max = 190; dbk_max = 329; acu_max = 191; fil_max = 46; }
  else if (HeavyfireType === 2) { dmg_max = 106; dbk_max = 130; acu_max = 120; fil_max = 233; }
  else if (HeavyfireType === 3) { dmg_max = 227; dbk_max = 58; acu_max = 90; fil_max = 107; }
  else if (HeavyfireType === 4) { dmg_max = 206; dbk_max = 60; acu_max = 97; fil_max = 148; }
  else if (HeavyfireType === 5) { dmg_max = 169; dbk_max = 261; acu_max = 190; fil_max = 90; }
  var looplen_a = solu_a.length, looplen_b = solu_b.length
  if (isNaN(solu_a[looplen_a - 1])) looplen_a--
  if (isNaN(solu_b[looplen_b - 1])) looplen_b--
  for (var n = 0; n < looplen_a; n++) {
    dmg_a += chipRepo_chart[solu_a[n] - 1].Dmg
    dbk_a += chipRepo_chart[solu_a[n] - 1].Dbk
    acu_a += chipRepo_chart[solu_a[n] - 1].Acu
    fil_a += chipRepo_chart[solu_a[n] - 1].Fil
  }
  for (var n = 0; n < looplen_b; n++) {
    dmg_b += chipRepo_chart[solu_b[n] - 1].Dmg
    dbk_b += chipRepo_chart[solu_b[n] - 1].Dbk
    acu_b += chipRepo_chart[solu_b[n] - 1].Acu
    fil_b += chipRepo_chart[solu_b[n] - 1].Fil
  }
  if (dmg_a > dmg_max) dmg_a = dmg_max; if (dmg_b > dmg_max) dmg_b = dmg_max
  if (dbk_a > dbk_max) dbk_a = dbk_max; if (dbk_b > dbk_max) dbk_b = dbk_max
  if (acu_a > acu_max) acu_a = acu_max; if (acu_b > acu_max) acu_b = acu_max
  if (fil_a > fil_max) fil_a = fil_max; if (fil_b > fil_max) fil_b = fil_max
  value_a = (dmg_a / dmg_max) + (dbk_a / dbk_max) + (acu_a / acu_max) + (fil_a / fil_max)
  value_b = (dmg_b / dmg_max) + (dbk_b / dbk_max) + (acu_b / acu_max) + (fil_b / fil_max)
  return value_b - value_a
}
function compare_dmg (solu_a, solu_b) {
  var dmg_a = 0, dmg_b = 0, dmg_max = 0
  if (HeavyfireType === 1) dmg_max = 190
  else if (HeavyfireType === 2) dmg_max = 106
  else if (HeavyfireType === 3) dmg_max = 227
  else if (HeavyfireType === 4) dmg_max = 206
  else if (HeavyfireType === 5) dmg_max = 169
  var looplen_a = solu_a.length, looplen_b = solu_b.length
  if (isNaN(solu_a[looplen_a - 1])) looplen_a--
  if (isNaN(solu_b[looplen_b - 1])) looplen_b--
  for (var n = 0; n < looplen_a; n++) dmg_a += chipRepo_chart[solu_a[n] - 1].Dmg
  for (var n = 0; n < looplen_b; n++) dmg_b += chipRepo_chart[solu_b[n] - 1].Dmg
  if (dmg_a > dmg_max) dmg_a = dmg_max; if (dmg_b > dmg_max) dmg_b = dmg_max
  return dmg_b - dmg_a
}
function compare_dbk (solu_a, solu_b) {
  var dbk_a = 0, dbk_b = 0, dbk_max = 0
  if (HeavyfireType === 1) dbk_max = 329
  else if (HeavyfireType === 2) dbk_max = 130
  else if (HeavyfireType === 3) dbk_max = 58
  else if (HeavyfireType === 4) dbk_max = 60
  else if (HeavyfireType === 5) dbk_max = 261
  var looplen_a = solu_a.length, looplen_b = solu_b.length
  if (isNaN(solu_a[looplen_a - 1])) looplen_a--
  if (isNaN(solu_b[looplen_b - 1])) looplen_b--
  for (var n = 0; n < looplen_a; n++) dbk_a += chipRepo_chart[solu_a[n] - 1].Dbk
  for (var n = 0; n < looplen_b; n++) dbk_b += chipRepo_chart[solu_b[n] - 1].Dbk
  if (dbk_a > dbk_max) dbk_a = dbk_max; if (dbk_b > dbk_max) dbk_b = dbk_max
  return dbk_b - dbk_a
}
function compare_acu (solu_a, solu_b) {
  var acu_a = 0, acu_b = 0, acu_max = 0
  if (HeavyfireType === 1) acu_max = 191
  else if (HeavyfireType === 2) acu_max = 120
  else if (HeavyfireType === 3) acu_max = 90
  else if (HeavyfireType === 4) acu_max = 97
  else if (HeavyfireType === 5) acu_max = 190
  var looplen_a = solu_a.length, looplen_b = solu_b.length
  if (isNaN(solu_a[looplen_a - 1])) looplen_a--
  if (isNaN(solu_b[looplen_b - 1])) looplen_b--
  for (var n = 0; n < looplen_a; n++) acu_a += chipRepo_chart[solu_a[n] - 1].Acu
  for (var n = 0; n < looplen_b; n++) acu_b += chipRepo_chart[solu_b[n] - 1].Acu
  if (acu_a > acu_max) acu_a = acu_max; if (acu_b > acu_max) acu_b = acu_max
  return acu_b - acu_a
}
function compare_fil (solu_a, solu_b) {
  var fil_a = 0, fil_b = 0, fil_max = 0
  if (HeavyfireType === 1) fil_max = 46
  else if (HeavyfireType === 2) fil_max = 233
  else if (HeavyfireType === 3) fil_max = 107
  else if (HeavyfireType === 4) fil_max = 148
  else if (HeavyfireType === 5) fil_max = 90
  var looplen_a = solu_a.length, looplen_b = solu_b.length
  if (isNaN(solu_a[looplen_a - 1])) looplen_a--
  if (isNaN(solu_b[looplen_b - 1])) looplen_b--
  for (var n = 0; n < looplen_a; n++) fil_a += chipRepo_chart[solu_a[n] - 1].Fil
  for (var n = 0; n < looplen_b; n++) fil_b += chipRepo_chart[solu_b[n] - 1].Fil
  if (fil_a > fil_max) fil_a = fil_max; if (fil_b > fil_max) fil_b = fil_max
  return fil_b - fil_a
}
function ignore_readinfo () {
  ignore_setting.clear()
  for (var entry of readorder) {
    if (document.getElementById('ignore_' + entry).checked) {
      ignore_setting.set(entry, true)
      if ((document.getElementById('ignore_' + entry + 'max').value).length === 0) ignore_setting.set(entry + 'max', false)
      else {
        ignore_setting.set(entry + 'max', true)
        ignore_setting.set(entry + 'maxv', parseInt(document.getElementById('ignore_' + entry + 'max').value))
      }
      if ((document.getElementById('ignore_' + entry + 'min').value).length === 0) ignore_setting.set(entry + 'min', false)
      else {
        ignore_setting.set(entry + 'min', true)
        ignore_setting.set(entry + 'minv', parseInt(document.getElementById('ignore_' + entry + 'min').value))
      }
    } else ignore_setting.set(entry, false)
  }
} // entry-min/max, entry-minv
function ignoreSolution (list_max) {
  var propertyorder = ['Dmg', 'Dbk', 'Acu', 'Fil', 'bDmg', 'bDbk', 'bAcu', 'bFil']
  ignore_readinfo()
  var solution_filtered = []
  var solulen = solutionSet.length
  for (var i = 0; i < solulen; i++) {
    var combinelen = solutionSet[i].length
    var orderlen = readorder.length
    var skip = false
    if (filter_switch && filter_switch_finalpick) combinelen--
    // entry=readoerder[e]
    for (var e = 0; e < orderlen; e++) {
      var value = 0, iftype = [false, false]
      if (ignore_setting.get(readorder[e])) {
        for (var n = 0; n < combinelen; n++) {
          if (propertyorder[e][0] === 'b') eval('value+=chipRepo_data[solutionSet[i][n] - 1].' + propertyorder[e])
          else eval('value+=chipRepo_chart[solutionSet[i][n] - 1].' + propertyorder[e])
        }
        if (ignore_setting.get(readorder[e] + 'min')) iftype[0] = true
        if (ignore_setting.get(readorder[e] + 'max')) iftype[1] = true
        if (iftype[0] || iftype[1]) { // at least one requirement
          var code = ''
          if (iftype[0]) {
            code += 'value>=' + (list_max[e] - ignore_setting.get(readorder[e] + 'minv'))
            if (iftype[1]) code += '&&'
          }
          if (iftype[1]) {
            code += 'value<=' + (list_max[e] + ignore_setting.get(readorder[e] + 'maxv'))
          }
          eval('if(!(' + code + ')) skip=true')
          if (skip) break
        }
      }
    }
    if (skip) continue
    solution_filtered.push(solutionSet[i])
  }
  return solution_filtered
}
function changeRankingSwitch (sortType) {
  sortSolution(sortType)
  showAnalyze()
}
function sortSolution (sortType) {
  ranking_switch = parseInt(sortType)
  if (sortType === 1) analyze_switch = 1
  else if (sortType === 2) analyze_switch = -1
  var dmg_max = 0, dbk_max = 0, acu_max = 0, fil_max = 0
  var dmgblo_max = 0, dbkblo_max = 0, acublo_max = 0, filblo_max = 0
  if (HeavyfireType === 1) { dmg_max = 190; dbk_max = 329; acu_max = 191; fil_max = 46; dmgblo_max = 18; dbkblo_max = 11; acublo_max = 11; filblo_max = 4; }
  else if (HeavyfireType === 2) { dmg_max = 106; dbk_max = 130; acu_max = 120; fil_max = 233; dmgblo_max = 10; dbkblo_max = 4; acublo_max = 7; filblo_max = 17; }
  else if (HeavyfireType === 3) { dmg_max = 227; dbk_max = 58; acu_max = 90; fil_max = 107; dmgblo_max = 21; dbkblo_max = 2; acublo_max = 6; filblo_max = 8; }
  else if (HeavyfireType === 4) { dmg_max = 206; dbk_max = 60; acu_max = 97; fil_max = 148; dmgblo_max = 19; dbkblo_max = 2; acublo_max = 6; filblo_max = 10; }
  else if (HeavyfireType === 5) { dmg_max = 169; dbk_max = 261; acu_max = 190; fil_max = 90; dmgblo_max = 16; dbkblo_max = 8; acublo_max = 10; filblo_max = 6; }
  solutionSet = ignoreSolution([dmg_max, dbk_max, acu_max, fil_max, dmgblo_max, dbkblo_max, acublo_max, filblo_max])
  switch (ranking_switch) {
    case 1: // All property
      solutionSet = selectOptimal(solutionSet, buffer_num, value_sumpro_of_HeavyfireType(HeavyfireType))
      break
    case 3: // Dmg
      solutionSet.sort(compare_dmg)
      break
    case 4: // Dbk
      solutionSet.sort(compare_dbk)
      break
    case 5: // Acu
      solutionSet.sort(compare_acu)
      break
    case 6: // Fil
      solutionSet.sort(compare_fil)
      break
  }
  // UI refresh
  if (!filter_switch) {
    var SolutionSelect = document.getElementById('SolutionSelect')
    var SSText = ''
    switch (ranking_switch) {
      case 1: // All property
        document.getElementById('SortInfo').innerHTML = lib_lang.refer + ' <span style="color:red"><b>' + lib_lang.valid_value + '</b></span> ' + lib_lang.sorting + ', ' + lib_lang.topo + ' ' + (topologyNum + 1) + ' ' + lib_lang.have + ' ' + solutionSet.length + ' ' + lib_lang.type_of_combi
        break
      case 3: // Dmg
        document.getElementById('SortInfo').innerHTML = lib_lang.refer + ' <span style="color:red"><b>' + lib_lang.dmg + '</b></span> ' + lib_lang.sorting + ', ' + lib_lang.topo + ' ' + (topologyNum + 1) + ' ' + lib_lang.have + ' ' + solutionSet.length + ' ' + lib_lang.type_of_combi
        break
      case 4: // Dbk
        document.getElementById('SortInfo').innerHTML = lib_lang.refer + ' <span style="color:red"><b>' + lib_lang.dbk + '</b></span> ' + lib_lang.sorting + ', ' + lib_lang.topo + ' ' + (topologyNum + 1) + ' ' + lib_lang.have + ' ' + solutionSet.length + ' ' + lib_lang.type_of_combi
        break
      case 5: // Acu
        document.getElementById('SortInfo').innerHTML = lib_lang.refer + ' <span style="color:red"><b>' + lib_lang.acu + '</b></span> ' + lib_lang.sorting + ', ' + lib_lang.topo + ' ' + (topologyNum + 1) + ' ' + lib_lang.have + ' ' + solutionSet.length + ' ' + lib_lang.type_of_combi
        break
      case 6: // Fil
        document.getElementById('SortInfo').innerHTML = lib_lang.refer + ' <span style="color:red"><b>' + lib_lang.fil + '</b></span> ' + lib_lang.sorting + ', ' + lib_lang.topo + ' ' + (topologyNum + 1) + ' ' + lib_lang.have + ' ' + solutionSet.length + ' ' + lib_lang.type_of_combi
        break
    }
    SolutionSelect.disabled = false
    var solulen = solutionSet.length
    if (solulen > 0) {
      for (var i = 0; i < solulen; i++) {
        SSText += '<option value=' + i + '>' + lib_lang.num + ' '
        var c_num = solutionSet[i].length
        for (var c = 0; c < c_num; c++) SSText += (solutionSet[i][c] + ' ')
        SSText += '</option>'
      }
    } else {
      SSText = '<option value=-1>' + lib_lang.sele_noresult + '</option>'
    }
    SolutionSelect.innerHTML = SSText
  }
}
function switchAnalyze () { analyze_switch *= -1; showAnalyze(); }
function setBest (typeInfo) {
  if (typeInfo === 1) {
    filter_switch = false
    document.getElementById('best_num').disabled = true
  } else {
    filter_switch = true
    document.getElementById('best_num').disabled = false
  }
}
function setBestSort (typeInfo) {
  document.getElementById('sbs_1').src = '../img/chip/btn-s1-no.png'
  document.getElementById('sbs_3').src = '../img/chip/btn-s3-no.png'
  document.getElementById('sbs_4').src = '../img/chip/btn-s4-no.png'
  document.getElementById('sbs_5').src = '../img/chip/btn-s5-no.png'
  document.getElementById('sbs_6').src = '../img/chip/btn-s6-no.png'
  ranking_switch = typeInfo
  document.getElementById('sbs_' + typeInfo).src = '../img/chip/btn-s' + typeInfo + '.png'
}
function setBestNum () {
  var best_num = document.getElementById('best_num')
  if ((best_num.value).length === 0) best_num.value = 10
  if (isNaN(parseInt(best_num.value))) best_num.value = 10
}

// ====================================================================

/**
 * this part made by kirA, thanks him
 * return a function that can compute the value for specified HeavyfireType
 */
function value_sumpro_of_HeavyfireType (HeavyfireType) {
  var dmg_max = 0, dbk_max = 0, acu_max = 0, fil_max = 0
  // Init max value of each property for different Heavyfire.
  if (HeavyfireType === 1) { dmg_max = 190; dbk_max = 329; acu_max = 191; fil_max = 46; }
  else if (HeavyfireType === 2) { dmg_max = 106; dbk_max = 130; acu_max = 120; fil_max = 233; }
  else if (HeavyfireType === 3) { dmg_max = 227; dbk_max = 58; acu_max = 90; fil_max = 107; }
  else if (HeavyfireType === 4) { dmg_max = 206; dbk_max = 60; acu_max = 97; fil_max = 148; }
  else if (HeavyfireType === 5) { dmg_max = 169; dbk_max = 261; acu_max = 190; fil_max = 90; }

  // get value for a solution
  function getValue (solu_a) {
    var looplen_a = solu_a.length
    if (isNaN(solu_a[looplen_a - 1])) looplen_a--

    var dmg_a = 0, dbk_a = 0, acu_a = 0, fil_a = 0
    for (var n = 0; n < looplen_a; n++) {
      dmg_a += chipRepo_chart[solu_a[n] - 1].Dmg
      dbk_a += chipRepo_chart[solu_a[n] - 1].Dbk
      acu_a += chipRepo_chart[solu_a[n] - 1].Acu
      fil_a += chipRepo_chart[solu_a[n] - 1].Fil
    }

    if (dmg_a > dmg_max) dmg_a = dmg_max
    if (dbk_a > dbk_max) dbk_a = dbk_max
    if (acu_a > acu_max) acu_a = acu_max
    if (fil_a > fil_max) fil_a = fil_max

    var value_a = (dmg_a / dmg_max) + (dbk_a / dbk_max) + (acu_a / acu_max) + (fil_a / fil_max)
    return value_a
  }
  return getValue
}

function value_sumblo_of_HeavyfireType (HeavyfireType) {
  var dmgblo_max = 0, dbkblo_max = 0, acublo_max = 0, filblo_max = 0
  if (HeavyfireType === 1) { dmgblo_max = 18; dbkblo_max = 11; acublo_max = 11; filblo_max = 4; }
  else if (HeavyfireType === 2) { dmgblo_max = 10; dbkblo_max = 4; acublo_max = 7; filblo_max = 17; }
  else if (HeavyfireType === 3) { dmgblo_max = 21; dbkblo_max = 2; acublo_max = 6; filblo_max = 8; }
  else if (HeavyfireType === 4) { dmgblo_max = 19; dbkblo_max = 2; acublo_max = 6; filblo_max = 10; }
  else if (HeavyfireType === 5) { dmgblo_max = 16; dbkblo_max = 8; acublo_max = 10; filblo_max = 6; }

  function getValue (solu_a) {
    var looplen_a = solu_a.length
    if (isNaN(solu_a[looplen_a - 1])) looplen_a--

    var dmg_a = 0, dbk_a = 0, acu_a = 0, fil_a = 0
    for (var n = 0; n < looplen_a; n++) {
      dmg_a += chipRepo_data[solu_a[n] - 1].bDmg
      dbk_a += chipRepo_data[solu_a[n] - 1].bDbk
      acu_a += chipRepo_data[solu_a[n] - 1].bAcu
      fil_a += chipRepo_data[solu_a[n] - 1].bFil
    }

    if (dmg_a > dmgblo_max) dmg_a = dmgblo_max
    if (dbk_a > dbkblo_max) dbk_a = dbkblo_max
    if (acu_a > acublo_max) acu_a = acublo_max
    if (fil_a > filblo_max) fil_a = filblo_max

    var value_a = dmg_a + dbk_a + acu_a + fil_a
    return value_a
  }
  return getValue
}

/**
 * 
 * @param {Array} solutionSet solutionSet
 * @param {Number} topN the number of solutions which will be select
 * @param {Function} getValue a function can compute the value of solution
 */
function selectOptimal (solutionSet, topN, getValue) {
  // store value for each solution
  var value_array = []
  var setsize = solutionSet.length
  for (var i = 0; i < setsize; i++) {
    value_array.push(getValue(solutionSet[i]))
  }
  // select indices of the top N max value in value_array
  var heap = new TopNheap(topN, (i, j) => value_array[i] - value_array[j])
  for (var i = 0; i < value_array.length; i++) {
    heap.push(i)
  }
  var topN_index_array = heap.extractAll()
  // select the top N solution with indices
  var topNsolutionSet = []
  for (var i = 0; i < topN_index_array.length; i++) {
    topNsolutionSet.push(solutionSet[topN_index_array[i]])
  }
  return topNsolutionSet
}
function TopNheap (N, compare) {
  this.array = []
  this.size = 0
  this.N = N
  this.compare = compare

  for (var i = 0; i < N + 1; i++) {
    this.array[i] = 0
  }
  this.exchange = function (i, j) {
    var temp = this.array[i]
    this.array[i] = this.array[j]
    this.array[j] = temp
  }
  this.push = function (item) {
    if (N < 0 || this.size < N) {
      this.size++
      var i = this.size
      this.array[i] = item
      while (i > 1 && this.compare(this.array[i], this.array[parseInt(i / 2)]) < 0) {
        var j = parseInt(i / 2)
        this.exchange(i, j)
        i = j
      }
    }
    else if (this.compare(item, this.array[1]) > 0) {
      this.array[1] = item
      this.heapify(1)
    }
  }
  this.extractHead = function () {
    if (this.size < 1) {
      return
    }
    var temp = this.array[1]
    this.array[1] = this.array[this.size]
    this.size--
    this.heapify(1)
    return temp
  }
  this.heapify = function (root) {
    while (1) {
      var left = root * 2
      var right = left + 1
      var temp = root
      if (left <= this.size && this.compare(this.array[left], this.array[temp]) < 0) {
        temp = left
      }
      if (right <= this.size && this.compare(this.array[right], this.array[temp]) < 0) {
        temp = right
      }
      if (temp == root) break
      this.exchange(temp, root)
      root = temp
    }
  }
  this.extractAll = function () {
    var a = []
    while (this.size > 0) {
      a.push(this.extractHead())
    }
    return a.reverse()
  }
}
