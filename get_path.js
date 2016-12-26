// Get file path

function sFile() {
  var tmp = document.getElementById("idInputFile").value;
  if (tmp!=""){
    tmp = tmp.split("\\");
    tmp = tmp.slice(0,tmp.length-1).join("\\");
    tmp = "&path="+tmp;
  }else{
    tmp = "";
  }
  speedModalDialog("#(..Link("%25cspapp.bi.file.cls"))#?type=*.txt"+tmp,"sFileRtn","",610,350,"center=yes,status=no,scroll=no,help=no,resizable=yes");
}

function sFileRtn(sRtn,params){
  if(sRtn) {
    idInputFile.value=sRtn;
  }
}
