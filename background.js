var hostName = "com.tigerworkshop.chrome.hardwarebridge";
var port;
var printers = [];

function connectNative() {
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
}

function sendNative(data) {    
    port.postMessage(data);
}

function onNativeMessage(message) {
    //alert("Received message: " + JSON.stringify(message) + "");
}

function onDisconnected() {
    // alert("Failed to connect: " + chrome.runtime.lastError.message);
}

function load_options(data) {
    chrome.storage.sync.get({
        printers: {},
        ports: {}
    }, function(items) {
        printers = items.printers;
        
        connectNative();
        process_data(data);
    });
}

function process_data(data) {
    // Select designated printer
    if (data.action == 'print' && typeof data.type != 'undefined') {
        data.printer = find_printer(data.type);
    }
    sendNative(data);
}

function find_printer(printer_type) {
    for (i in printers) {
        if (printers[i].type == printer_type) {
            return printers[i].name;
        }
    }
    return false;
}

chrome.extension.onRequest.addListener(function(data, sender) {    
    load_options(data);
});