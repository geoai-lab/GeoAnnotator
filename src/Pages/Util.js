import $ from "jquery"
export function ToggleMessage(type,message, warningFunction) {
    if (type === "success") {
        $("#popupMessageSuccess").children("p").text(message);
        $("#popupMessageSuccess").show("fade");
        setTimeout(() => {
            $("#popupMessageSuccess").hide("fade");
        }, 2500)
    }
    else if(type === "error") {
        $("#popupMessageDanger").children("p").text(message);
        $("#popupMessageDanger").show("fade");
        setTimeout(() => {
            $("#popupMessageDanger").hide("fade");
        }, 2500)
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