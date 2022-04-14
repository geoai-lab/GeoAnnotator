import $ from "jquery"
export function ToggleMessage(type,message, warningFunction, timer ) {
    if (type === "success") {
        $("#popupMessageSuccess").children("p").text(message);
        $("#popupMessageSuccess").show("fade");
        var timeToDecay = timer? timer: 2500
        setTimeout(() => {
            $("#popupMessageSuccess").hide("fade");
        }, timeToDecay)
    }
    else if(type === "error") {
        $("#popupMessageDanger").children("p").text(message);
        $("#popupMessageDanger").show("fade");
        var timeToDecay = timer? timer: 2500
        setTimeout(() => {
            $("#popupMessageDanger").hide("fade");
        }, timeToDecay)
    }
    else if(type === "warning") {
        $("#popupMessageWarning").children("p").text(message);
        $("#popupMessageWarning").show("fade"); 
        $("#warningOkButton").on('click',warningFunction)
    }
    else if(type === "primary"){
        $('#popupMessagePrimary').children("p").text(message); 
        $("#popupMessagePrimary").show("fade");
    }
}