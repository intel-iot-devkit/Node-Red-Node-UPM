module.exports = function(RED) {

    var m = require('mraa');
    var LCD = require('jsupm_i2clcd');
    var fs = require('fs');

    function groveRGBLCD(n) {
        //init
        RED.nodes.createNode(this,n);

        //properties
        this.name = n.name;
        this.platform = n.platform;
        this.r = parseInt(n.r);
        this.g = parseInt(n.g);
        this.b = parseInt(n.b);
        this.row = parseInt(n.row);
        this.column = parseInt(n.column);
        if(parseInt(this.platform) == 512) {
            var arr = JSON.parse(fs.readFileSync('/tmp/imraa.lock', 'utf8')).Platform;
            for (var i = 0; i < arr.length; i++) {
                if(arr[i].hasOwnProperty('uart')) {
                    //explicitly add the FIRMATA subplatform for MRAA
                    m.addSubplatform(m.GENERIC_FIRMATA, arr[i].uart);
                    }
                }
        }
        this.sensor = new LCD.Jhd1313m1 (parseInt(this.platform), 0x3E, 0x62);
        this.board = m.getPlatformName();
        this.status({});

        var node = this;

        this.on('input', function(msg) {
		
	    node.sensor.clear();//clear previous message
	    
            //set LCD background color
            if(msg.lcdColor){ //on message
                node.sensor.setColor(
                    parseInt(msg.lcdColor.r),
                    parseInt(msg.lcdColor.g),
                    parseInt(msg.lcdColor.b)
                );
            }
	    else{
                node.sensor.setColor(node.r, node.g, node.b); //on setting
	    }

            //set LCD cursor
            if(msg.lcdCursor){ //on message
                node.sensor.setCursor(
                    parseInt(msg.lcdCursor.row),
                    parseInt(msg.lcdCursor.column)
                );
            }
	    else{
                node.sensor.setCursor(node.row, node.column); //on setting
	    }
            node.sensor.write(''+msg.payload);//set display message
        }); 

        //clear interval on exit
        this.on('close', function() {
            node.sensor.clear();
        });
    }
    RED.nodes.registerType('upm-grove-rgb-lcd', groveRGBLCD);
}
