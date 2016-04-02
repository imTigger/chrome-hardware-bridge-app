var hostName = "com.tigerworkshop.chrome.hardwarebridge";
var port;
var printers = [];
var printer_table;
var printer_table_id = 0;

function connectNative() {
	port = chrome.runtime.connectNative(hostName);
	port.onMessage.addListener(onNativeMessage);
	port.onDisconnect.addListener(onDisconnected);
}

function sendNative(data) {  
	port.postMessage(data);
}

function onNativeMessage(message) {
	if (message.status == 0) {
		if (message.action == 'list' && message.type =='printer') {
			printer_names = document.getElementById('printer');
			for (i in message.items) {
				option = document.createElement("option");
				option.text = message.items[i];
				printer_names.add(option);
			}
			load_options();
		}
	} else {
		if (typeof message == 'object') {
			alert(JSON.stringify(message));
		} else {
			alert(message);
		}
	}
}

function onDisconnected() {
	// alert("Failed to connect: " + chrome.runtime.lastError.message);
}

function load_options() {
	chrome.storage.sync.get({
		printers: {},
		ports: {}
	}, function(items) {
		printers = items.printers;
		for (i in printers) {
			add_printer(printers[i].type, printers[i].name, true);
		}
		
		$('#add-printer').attr('disabled', false);
	});
}

function find_printer(printer_type) {
	for (i in printers) {
		if (printers[i].type == printer_type) {
			return printers[i].name;
		}
	}
	return false;
}

function add_printer(printer_type, printer, bypass) {
	if (printer_type === '') {
		alert('Please enter Printer Type');
		return;
	}
	
	if (find_printer(printer_type) !== false && bypass !== true) {
		alert('Printer Type: ' + printer_type + ' alredy exist');
		return;
	}
	
	printer_table_id += 1;
	
	row = printer_table.row.add([
		printer_type,
		printer,
		'<a href="#" class="remove" data-row-id="row-' + printer_table_id + '">Remove</a>'
	]).draw(false).node();
	
	$(row).attr('id', 'row-' + printer_table_id);
}

function save_printer() {	
	printers = [];
	printer_table.rows().every(function(rowIdx, tableLoop, rowLoop) {
		var data = this.data();
		printers.push({'type': data[0], 'name': data[1]});
	});
	
	chrome.storage.sync.set({
		printers: printers
	});
}


$().ready(function() {
	printer_table = $('#printer-table').DataTable({
		searching: false,
		paging: false,
		info: false,
		columns: [
			{className: ''},
			{className: ''},
			{className: 'dt-right'}
		]
	});
	
	$('#printer-table tbody').on('click', 'a.remove', function() {
		id = $(this).data('row-id');
		printer_table.row('#' + id).remove().draw(false);
		save_printer();
	})
	
	$('#add-printer').on('click', function() {
		add_printer($('#printer_type').val(), $('#printer').val());
		save_printer();
	});
	
	connectNative();
	sendNative({'action': 'list_printer'});
});
