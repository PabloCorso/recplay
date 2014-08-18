define(["./binReader"], function(binReader){
	var ticker = function(){
		var n = 0;
		return function(m){
			n += m;
			return n - m;
		};
	}();

	var offsFrameCount = ticker(4);
	var offsType = ticker(4);
	ticker(8);
	var offsLevIdent = ticker(4);
	var offsLevName = ticker(16);
	var offsFloat32s = ticker(0);

	return function recReader(data){
		var br = binReader(data);
		var frameCount = br.word32le();

		var gticker = function(){
			var offs = offsFloat32s;

			return function(size, count, reader){
				var offs_ = offs;
				offs += size*count*frameCount;
				return function(n){
					return function(frame){
						br.seek(offs_ + size*(n*frameCount + frame));
						return reader();
					};
				};
			};
		}();

		var float32s = gticker(4, 2, br.binFloat32le); // bikeX, bikeY
		var int16s = gticker(2, 7, br.int16le); // leftX, leftY, rightX, rightY, headX, headY, bikeR
		var word8s = gticker(1, 5, br.byte); // leftR, rightR, turn, unk1, unk2

		return {
			frameCount: function(){
				return frameCount;
			},

			bikeX: float32s(0),
			bikeY: float32s(1),

			leftX: int16s(0),
			leftY: int16s(1),
			rightX: int16s(2),
			rightY: int16s(3),
			headX: int16s(4),
			headY: int16s(5),
			bikeR: int16s(6),

			leftR: word8s(0),
			rightR: word8s(1),
			turn: word8s(2)
		};
	};
});