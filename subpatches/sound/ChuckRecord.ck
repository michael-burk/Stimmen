WvOut w;

OscRecv recv;
6449 => recv.port;
recv.listen();
recv.event( "/record, i, s" ) @=> OscEvent @ oe;

int isRecording;
0 => isRecording;

adc => dac;


while( true )
{
    oe => now;

    while( oe.nextMsg() )
    { 
	    int record;
		string filename;

	    oe.getInt() => record;
		oe.getString() => filename;

		if (record == 1 && record != isRecording) {
			1 => isRecording;
			filename => w.wavFilename;
			adc =< dac;
			adc => w => dac;
		        <<< "record: ", filename >>>;

		}


		if (record == 0 && record != isRecording) {
			0 => isRecording;
			adc =< w =< dac;
			adc => dac;
		        <<< "stopped." >>>;

		}
    }
}
